import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import { siteContentService } from "./siteContent.service";

// PDF surat disimpan sekali saat DISETUJUI agar isinya tidak ikut berubah
// kalau data warga (alamat, pekerjaan, dst.) diedit belakangan.
const PDF_DIR = path.join(process.cwd(), "uploads", "surat");

export async function savePdf(requestId: string, bytes: Uint8Array, noSignature?: boolean): Promise<string> {
  await fs.promises.mkdir(PDF_DIR, { recursive: true });
  const fileName = noSignature ? `${requestId}-nosig.pdf` : `${requestId}.pdf`;
  await fs.promises.writeFile(path.join(PDF_DIR, fileName), bytes);
  return fileName;
}

export async function readPdf(requestId: string, noSignature?: boolean): Promise<Buffer | null> {
  try {
    const fileName = noSignature ? `${requestId}-nosig.pdf` : `${requestId}.pdf`;
    return await fs.promises.readFile(path.join(PDF_DIR, fileName));
  } catch {
    return null;
  }
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalID(date: Date) {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

// Isi template surat: {{key}} dan blok kondisional {{#key}}...{{/key}}
function renderTemplate(tpl: string, vars: Record<string, string | number | boolean | null | undefined>) {
  let out = tpl.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, k, inner) =>
    vars[k] ? inner : "",
  );
  out = out.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    vars[k] != null && vars[k] !== "" ? String(vars[k]) : "...",
  );
  return out;
}

// Tulis teks dengan word-wrap; kembalikan posisi y setelah blok teks
function drawWrapped(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; size: number; font: PDFFont; maxWidth: number; lineHeight: number },
) {
  const { x, size, font, maxWidth, lineHeight } = opts;
  let y = opts.y;
  const words = text.split(/\s+/);
  let line = "";
  const flush = () => {
    if (line) {
      page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
      line = "";
    }
  };
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      flush();
      line = w;
    } else {
      line = test;
    }
  }
  flush();
  return y;
}

export type LetterPdfInput = {
  letterNumber: string;
  verificationCode: string;
  approvedAt: Date;
  template: string | null;
  letterTypeName: string;
  requester: {
    name: string;
    nik: string;
    address: string | null;
    placeOfBirth: string | null;
    birthday: Date | string | null;
    job: string | null;
  };
  purpose: string;
  data: Record<string, string | number | null> | null;
  // URL dasar aplikasi untuk QR (mis. http://localhost:3000)
  appUrl: string;
  // pratinjau sebelum surat disetujui: nomor/QR belum ada, tampilkan watermark
  draft?: boolean;
  signatory?: {
    name: string;
    positionCategory: string;
    signatureUrl?: string | null;
  } | null;
  // Jika true, tanda tangan berupa gambar tidak dirender (untuk cetak basah)
  noSignature?: boolean;
};

// Kumpulan variabel yang bisa dipakai template (teks lama maupun .docx).
// Kunci Inggris dipertahankan untuk kompat 8 template teks seed lama;
// kunci Indonesia = vokabular tag .docx (lihat FIXED_LETTER_TAGS di types/letter.ts).
export function buildLetterVars(
  input: LetterPdfInput,
): Record<string, string | number | boolean | null | undefined> {
  const birthday =
    input.requester.birthday instanceof Date
      ? formatTanggalID(input.requester.birthday)
      : input.requester.birthday
        ? formatTanggalID(new Date(input.requester.birthday))
        : null;
  const isSekdes = input.signatory?.positionCategory === "Sekretaris Desa";
  return {
    // kunci lama (template teks {{...}})
    name: input.requester.name,
    nik: input.requester.nik,
    address: input.requester.address,
    placeOfBirth: input.requester.placeOfBirth,
    job: input.requester.job,
    purpose: input.purpose,
    // vokabular tag .docx
    nomor_surat: input.draft ? "(belum diterbitkan)" : input.letterNumber,
    tanggal_surat: formatTanggalID(input.approvedAt),
    nama: input.requester.name,
    alamat: input.requester.address,
    tempat_lahir: input.requester.placeOfBirth,
    tanggal_lahir: birthday,
    tempat_tanggal_lahir:
      input.requester.placeOfBirth || birthday
        ? `${input.requester.placeOfBirth ?? "..."}, ${birthday ?? "..."}`
        : null,
    pekerjaan: input.requester.job,
    keperluan: input.purpose,
    nama_penandatangan:
      input.signatory?.name ?? "............................",
    jabatan_penandatangan: isSekdes ? "Sekretaris Desa" : "Kepala Desa Sangkima",
    is_sekdes: isSekdes,
    ...(input.data ?? {}),
  };
}

// Stempel watermark PRATINJAU di atas PDF hasil konversi .docx (jalur legacy
// menggambar watermark-nya sendiri di generateLetterPdf).
export async function stampDraftWatermark(pdf: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdf);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const wm = "PRATINJAU";
  const wmSize = 80;
  const wmWidth = bold.widthOfTextAtSize(wm, wmSize);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    // opacity rendah karena digambar DI ATAS konten, bukan di belakang
    page.drawText(wm, {
      x: (width - wmWidth) / 2,
      y: height / 2,
      size: wmSize,
      font: bold,
      color: rgb(0.7, 0.7, 0.7),
      rotate: degrees(45),
      opacity: 0.25,
    });
  }
  return doc.save();
}

export async function generateLetterPdf(input: LetterPdfInput): Promise<Uint8Array> {
  // Kop & tanda tangan bisa diatur lewat CMS (fallback ke default bila belum diisi).
  const surat = await siteContentService.get("surat");
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const normal = await doc.embedFont(StandardFonts.TimesRoman);
  const margin = 56;
  const center = (text: string, y: number, size: number, font: PDFFont) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color: rgb(0, 0, 0) });
  };

  // watermark digambar paling awal supaya berada di belakang konten lain
  if (input.draft) {
    const wm = "PRATINJAU";
    const wmSize = 80;
    const wmWidth = bold.widthOfTextAtSize(wm, wmSize);
    page.drawText(wm, {
      x: (width - wmWidth) / 2,
      y: height / 2,
      size: wmSize,
      font: bold,
      color: rgb(0.85, 0.85, 0.85),
      rotate: degrees(45),
      opacity: 0.5,
    });
  }

  // === KOP SURAT ===
  let y = height - margin;
  center(surat.kopKabupaten, y, 13, bold); y -= 16;
  center(surat.kopKecamatan, y, 13, bold); y -= 16;
  center(surat.kopDesa, y, 16, bold); y -= 16;
  center(surat.alamatKop, y, 9, normal); y -= 18;
  page.drawLine({
    start: { x: margin, y }, end: { x: width - margin, y },
    thickness: 2, color: rgb(0, 0, 0),
  });
  y -= 30;

  // === JUDUL ===
  const title = (input.letterTypeName || "Surat Keterangan").toUpperCase();
  center(title, y, 13, bold);
  const tw = bold.widthOfTextAtSize(title, 13);
  page.drawLine({
    start: { x: (width - tw) / 2, y: y - 3 }, end: { x: (width + tw) / 2, y: y - 3 },
    thickness: 1, color: rgb(0, 0, 0),
  });
  y -= 16;
  center(`Nomor: ${input.draft ? "(belum diterbitkan)" : input.letterNumber}`, y, 10, normal);
  y -= 30;

  // === ISI ===
  const vars = buildLetterVars(input);
  const intro =
    "Yang bertanda tangan di bawah ini Kepala Desa Sangkima, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur, dengan ini menerangkan bahwa:";
  y = drawWrapped(page, intro, { x: margin, y, size: 11, font: normal, maxWidth: width - margin * 2, lineHeight: 16 });
  y -= 10;

  // data diri pemohon
  const rows: [string, string][] = [
    ["Nama", input.requester.name],
    ["NIK", input.requester.nik],
    ["Pekerjaan", input.requester.job || "-"],
    ["Alamat", input.requester.address || "-"],
  ];
  for (const [label, val] of rows) {
    page.drawText(label, { x: margin + 20, y, size: 11, font: normal });
    page.drawText(":", { x: margin + 110, y, size: 11, font: normal });
    page.drawText(val, { x: margin + 120, y, size: 11, font: normal });
    y -= 16;
  }
  y -= 8;

  const body = input.template
    ? renderTemplate(input.template, vars)
    : `Orang tersebut benar-benar warga Desa Sangkima. Surat keterangan ini dibuat untuk keperluan ${input.purpose}.`;
  y = drawWrapped(page, body, { x: margin, y, size: 11, font: normal, maxWidth: width - margin * 2, lineHeight: 16 });
  y -= 6;
  const closing =
    "Demikian surat keterangan ini dibuat dengan sebenarnya, agar dapat dipergunakan sebagaimana mestinya.";
  y = drawWrapped(page, closing, { x: margin, y, size: 11, font: normal, maxWidth: width - margin * 2, lineHeight: 16 });

  // === TANDA TANGAN (kanan) ===
  const signX = width - margin - 180;
  let sy = y - 30;
  page.drawText(`Sangkima, ${formatTanggalID(input.approvedAt)}`, { x: signX, y: sy, size: 11, font: normal });
  sy -= 16;
  
  const isSekdes = input.signatory?.positionCategory === "Sekretaris Desa";
  
  if (isSekdes) {
    page.drawText("a.n Kepala Desa", { x: signX, y: sy, size: 11, font: normal });
    sy -= 16;
    page.drawText("Sekretaris Desa", { x: signX, y: sy, size: 11, font: normal });
  } else {
    page.drawText("Kepala Desa Sangkima", { x: signX, y: sy, size: 11, font: normal });
  }
  
  sy -= 70; // ruang tanda tangan

  // Gambar TTD: Prioritaskan dari profil penandatangan.
  if (!input.noSignature) {
    try {
      let ttdBytes: Buffer | null = null;
      let ext = ".png";

      if (input.signatory?.signatureUrl) {
        const p = path.join(
          process.cwd(),
          "uploads",
          "profil",
          path.basename(input.signatory.signatureUrl)
        );
        if (fs.existsSync(p)) {
          ttdBytes = fs.readFileSync(p);
          ext = path.extname(p).toLowerCase();
        }
      }
      if (ttdBytes) {
        const img =
          ext === ".jpg" || ext === ".jpeg"
            ? await doc.embedJpg(ttdBytes)
            : await doc.embedPng(ttdBytes);
        const scaled = img.scaleToFit(150, 60);
        page.drawImage(img, {
          x: signX,
          y: sy + 8,
          width: scaled.width,
          height: scaled.height,
        });
      }
    } catch {
      // abaikan bila gagal embed ttd
    }
  }

  // Nama penandatangan: otomatis dari akun yang menyetujui.
  const effectiveName = input.signatory?.name;
  const signText = effectiveName
    ? `( ${effectiveName} )`
    : "( ............................ )";
  page.drawText(signText, { x: signX, y: sy, size: 11, font: bold });

  // === QR VERIFIKASI (kiri bawah) — hanya untuk surat yang sudah resmi disetujui ===
  if (input.draft) {
    page.drawText("QR verifikasi akan muncul setelah surat", { x: margin, y: 60, size: 8, font: normal, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("disetujui & diterbitkan resmi.", { x: margin, y: 50, size: 8, font: normal, color: rgb(0.3, 0.3, 0.3) });
  } else {
    const verifyUrl = `${input.appUrl.replace(/\/$/, "")}/esurat/verifikasi/${input.verificationCode}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 200 });
    const qrPng = await doc.embedPng(qrDataUrl);
    const qrSize = 90;
    page.drawImage(qrPng, { x: margin, y: 70, width: qrSize, height: qrSize });
    page.drawText("Pindai untuk verifikasi", { x: margin, y: 60, size: 8, font: normal, color: rgb(0.3, 0.3, 0.3) });
    page.drawText("keaslian surat ini.", { x: margin, y: 50, size: 8, font: normal, color: rgb(0.3, 0.3, 0.3) });
  }

  return doc.save();
}
