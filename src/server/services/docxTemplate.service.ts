import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import InspectModule from "docxtemplater/js/inspect-module.js";
import PizZip from "pizzip";
import QRCode from "qrcode";
import sharp from "sharp";
import {
  FIXED_LETTER_TAGS,
  type LetterFieldDef,
  type TemplateReport,
} from "../types/letter";
import { AppError } from "../utils/appError";
import { convertDocxToPdf } from "../utils/docxToPdf";
import { formatLetterNumber } from "../utils/letter-number";
import {
  buildLetterVars,
  stampDraftWatermark,
  type LetterPdfInput,
} from "./pdf.service";
import { siteContentService } from "./siteContent.service";

// Template .docx per jenis surat, diunggah admin. File lama tidak dihapus saat
// upload baru (versi by timestamp di nama file) — rollback manual dimungkinkan.
const TEMPLATE_DIR = path.join(process.cwd(), "uploads", "templates");

// PNG placeholder yang disisipkan operator di Word (unduhan dari UI admin).
// Saat render, bytes-nya diganti QR/tanda tangan asli — XML posisi/ukuran di
// dokumen tak disentuh, jadi letak & ukuran persis seperti diatur operator.
const PLACEHOLDER_DIR = path.join(process.cwd(), "public", "esurat");
// dimensi sengaja ganjil agar tak bentrok gambar lain (fallback bila Word
// mengompres ulang bytes sehingga hash berubah)
const QR_DIM = { w: 199, h: 199 };
const TTD_DIM = { w: 401, h: 161 };

const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

let placeholderHashes: { qr: string; ttd: string } | null = null;

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function getPlaceholderHashes() {
  if (!placeholderHashes) {
    placeholderHashes = {
      qr: sha256(fs.readFileSync(path.join(PLACEHOLDER_DIR, "placeholder-qr.png"))),
      ttd: sha256(fs.readFileSync(path.join(PLACEHOLDER_DIR, "placeholder-ttd.png"))),
    };
  }
  return placeholderHashes;
}

// Dimensi PNG dari header IHDR (byte 16-23); null bila bukan PNG
function pngDimensions(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function matchPlaceholder(bytes: Buffer): "qr" | "ttd" | null {
  const hashes = getPlaceholderHashes();
  const hash = sha256(bytes);
  if (hash === hashes.qr) return "qr";
  if (hash === hashes.ttd) return "ttd";
  const dim = pngDimensions(bytes);
  if (dim?.w === QR_DIM.w && dim?.h === QR_DIM.h) return "qr";
  if (dim?.w === TTD_DIM.w && dim?.h === TTD_DIM.h) return "ttd";
  return null;
}

// Cari entri media placeholder di dalam zip docx → { "word/media/image1.png": "qr", ... }
function findPlaceholderEntries(zip: PizZip): Record<string, "qr" | "ttd"> {
  const found: Record<string, "qr" | "ttd"> = {};
  for (const name of Object.keys(zip.files)) {
    if (!name.startsWith("word/media/")) continue;
    const file = zip.file(name);
    if (!file) continue;
    const kind = matchPlaceholder(file.asNodeBuffer());
    if (kind) found[name] = kind;
  }
  return found;
}

// Pesan error compile docxtemplater (tag tak ditutup, delimiter rusak, dsb.)
// → satu AppError terbaca operator, bukan stack internal.
function toReadableError(err: unknown): AppError {
  const sub = (err as { properties?: { errors?: unknown[] } })?.properties?.errors;
  if (Array.isArray(sub) && sub.length) {
    const reasons = sub
      .map((e) => {
        const p = (e as { properties?: { explanation?: string } }).properties;
        return p?.explanation ?? String(e);
      })
      .slice(0, 5);
    return new AppError(
      "Template .docx tidak valid — ada tag yang rusak atau tidak ditutup.",
      { code: "TEMPLATE_INVALID", detail: { reasons } },
    );
  }
  if (err instanceof AppError) return err;
  console.error("[docx template]", err);
  return new AppError("Template .docx tidak bisa dibaca. Pastikan file .docx yang valid.");
}

function loadDocx(buffer: Buffer, opts?: { inspect?: InspectModule }) {
  try {
    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip, {
      modules: opts?.inspect ? [opts.inspect] : [],
      paragraphLoop: true,
      linebreaks: true,
      // konsisten jalur teks lama: nilai hilang → "..." (blok/section → kosong)
      nullGetter: (part) => (part.module ? "" : "..."),
    });
    return { zip, doc };
  } catch (err) {
    throw toReadableError(err);
  }
}

// getAllTags mengembalikan objek bersarang (section punya anak) → ratakan semua key
function flattenTags(tags: Record<string, unknown>, into: Set<string>) {
  for (const [key, val] of Object.entries(tags)) {
    into.add(key);
    if (val && typeof val === "object") {
      flattenTags(val as Record<string, unknown>, into);
    }
  }
}

// Kunci Inggris legacy juga diizinkan sebagai tag (buildLetterVars menyediakannya)
const ENGLISH_TAGS = ["name", "nik", "address", "placeOfBirth", "job", "purpose"];

export function allowedTags(fields: LetterFieldDef[]): string[] {
  return [
    ...FIXED_LETTER_TAGS.map((t) => t.tag),
    ...ENGLISH_TAGS,
    ...fields.map((f) => f.name),
  ];
}

export const docxTemplateService = {
  async saveTemplateFile(letterTypeId: string, buffer: Buffer): Promise<string> {
    await fs.promises.mkdir(TEMPLATE_DIR, { recursive: true });
    const fileName = `${letterTypeId}-${Date.now()}.docx`;
    await fs.promises.writeFile(path.join(TEMPLATE_DIR, fileName), buffer);
    return fileName;
  },

  async readTemplateFile(fileName: string): Promise<Buffer> {
    try {
      // basename = pengaman path traversal (nama file datang dari kolom DB)
      return await fs.promises.readFile(
        path.join(TEMPLATE_DIR, path.basename(fileName)),
      );
    } catch {
      throw new AppError(
        "File template .docx tidak ditemukan di server. Unggah ulang template di halaman Jenis Surat.",
      );
    }
  },

  // Validasi template unggahan: ekstrak semua tag, banding dengan tag yang
  // tersedia, deteksi placeholder QR/TTD. Tag tak dikenal = ditolak (bila
  // lolos, di surat asli akan tercetak "...").
  validateTemplate(buffer: Buffer, fields: LetterFieldDef[]): TemplateReport & { unknownTags: string[] } {
    const inspect = new InspectModule();
    const { zip, doc } = loadDocx(buffer, { inspect });
    try {
      doc.compile();
    } catch (err) {
      throw toReadableError(err);
    }
    const tagSet = new Set<string>();
    flattenTags(inspect.getAllTags(), tagSet);
    const tags = [...tagSet];
    const allowed = new Set(allowedTags(fields));
    const unknownTags = tags.filter((t) => !allowed.has(t));
    const entries = findPlaceholderEntries(zip);
    const kinds = new Set(Object.values(entries));
    return { tags, unknownTags, hasQr: kinds.has("qr"), hasTtd: kinds.has("ttd") };
  },

  // Pipeline render: isi tag → swap gambar placeholder → konversi PDF → watermark draft.
  // keepPlaceholders: pratinjau admin — gambar placeholder dibiarkan tampak
  // supaya posisi QR/TTD terlihat jelas.
  async renderLetterPdfFromDocx(
    fileName: string,
    input: LetterPdfInput,
    opts?: { keepPlaceholders?: boolean },
  ): Promise<Uint8Array> {
    const buffer = await this.readTemplateFile(fileName);
    return this.renderLetterPdfFromBuffer(buffer, input, opts);
  },

  // Versi dari buffer langsung (tanpa baca file) — dipakai smoke test validasi
  // template SEBELUM berkas disimpan ke disk.
  async renderLetterPdfFromBuffer(
    buffer: Buffer,
    input: LetterPdfInput,
    opts?: { keepPlaceholders?: boolean },
  ): Promise<Uint8Array> {
    const surat = await siteContentService.get("surat");
    const { zip, doc } = loadDocx(buffer);
    try {
      doc.render({
        ...buildLetterVars(input),
        kop_kabupaten: surat.kopKabupaten,
        kop_kecamatan: surat.kopKecamatan,
        kop_desa: surat.kopDesa,
        alamat_kop: surat.alamatKop,
      });
    } catch (err) {
      throw toReadableError(err);
    }

    if (!opts?.keepPlaceholders) {
      // QR: baru terbit setelah nomor & kode verifikasi ada (bukan draft).
      // TTD: hanya di surat final bertanda tangan digital; nosig = ruang kosong.
      let qrBytes: Buffer = TRANSPARENT_PNG;
      if (!input.draft && input.verificationCode) {
        const verifyUrl = `${input.appUrl.replace(/\/$/, "")}/esurat/verifikasi/${input.verificationCode}`;
        qrBytes = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 300 });
      }
      let ttdBytes: Buffer = TRANSPARENT_PNG;
      if (!input.noSignature && input.signatory?.signatureUrl) {
        const p = path.join(
          process.cwd(),
          "uploads",
          "profil",
          path.basename(input.signatory.signatureUrl),
        );
        if (fs.existsSync(p)) {
          // pad ke rasio frame placeholder (contain, latar transparan) supaya
          // tanda tangan tidak tergencet mengikuti rasio frame di Word
          ttdBytes = await sharp(fs.readFileSync(p))
            .resize(TTD_DIM.w, TTD_DIM.h, {
              fit: "contain",
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toBuffer();
        }
      }

      for (const [entry, kind] of Object.entries(findPlaceholderEntries(zip))) {
        zip.file(entry, kind === "qr" ? qrBytes : ttdBytes);
      }
    }

    const filled = zip.generate({ type: "nodebuffer" });
    const pdf = await convertDocxToPdf(filled);
    return input.draft ? stampDraftWatermark(pdf) : new Uint8Array(pdf);
  },

  // Data contoh untuk smoke test upload & tombol Pratinjau admin
  buildDummyInput(type: { name: string; requiredFields: LetterFieldDef[] }): LetterPdfInput {
    const data: Record<string, string | number> = {};
    for (const f of type.requiredFields) {
      if (f.type === "number") data[f.name] = 123;
      else if (f.type === "date") data[f.name] = "1 Januari 2026";
      else if (f.type === "time") data[f.name] = "08:00";
      else if (f.type === "select")
        data[f.name] = f.options?.find((o) => o !== "Lainnya") ?? "Contoh pilihan";
      else data[f.name] = `Contoh ${f.label.toLowerCase()}`;
    }
    return {
      letterNumber: formatLetterNumber(1),
      verificationCode: "contoh-pratinjau",
      approvedAt: new Date(),
      template: null,
      letterTypeName: type.name,
      requester: {
        name: "Contoh Warga",
        nik: "6408012345670001",
        address: "Jl. Contoh No. 1, RT 01, Desa Sangkima",
        placeOfBirth: "Sangatta",
        birthday: "1990-01-01",
        job: "Wiraswasta",
        religion: "islam",
        gender: "L",
        citizenship: "wni",
        status: "Menikah",
        education: "S1/Setara D4",
      },
      purpose: "contoh keperluan pratinjau",
      data,
      appUrl: "https://desasangkima.cloud",
      draft: true,
      signatory: null,
    };
  },
};
