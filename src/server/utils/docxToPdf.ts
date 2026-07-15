import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { createId } from "@paralleldrive/cuid2";
import { AppError } from "./appError";

const execFileAsync = promisify(execFile);

// LibreOffice headless untuk konversi .docx → PDF. Di produksi terpasang lewat
// nixpacks.toml (aptPkgs libreoffice-writer); di dev Windows set SOFFICE_PATH,
// mis. C:\Program Files\LibreOffice\program\soffice.exe
const SOFFICE = process.env.SOFFICE_PATH ?? "soffice";

// Profil hangat yang dipakai ulang — start pertama LibreOffice ~2-5 dtk,
// selanjutnya ~1-2 dtk karena profil sudah ada.
const WARM_PROFILE = path.join(os.tmpdir(), "soffice-profile-websangkima");

// ponytail: mutex promise-chain global — soffice headless bermasalah bila jalan
// paralel (lock profil). Volume desa kecil; antre satu-satu sudah cukup.
let queue: Promise<unknown> = Promise.resolve();

async function runConversion(docx: Buffer, profileDir: string): Promise<Buffer> {
  const workDir = path.join(os.tmpdir(), "esurat-docx", createId());
  await fs.promises.mkdir(workDir, { recursive: true });
  const inputPath = path.join(workDir, "in.docx");
  try {
    await fs.promises.writeFile(inputPath, docx);
    await execFileAsync(
      SOFFICE,
      [
        "--headless",
        "--norestore",
        `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        inputPath,
      ],
      { timeout: 60_000 },
    );
    return await fs.promises.readFile(path.join(workDir, "in.pdf"));
  } finally {
    await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function convertDocxToPdf(docx: Buffer): Promise<Buffer> {
  const task = queue.then(async () => {
    try {
      return await runConversion(docx, WARM_PROFILE);
    } catch (err) {
      if (err instanceof Error && "code" in err && err.code === "ENOENT") {
        throw new AppError(
          "Konversi PDF tidak tersedia: LibreOffice (soffice) tidak ditemukan di server. Pasang libreoffice-writer atau set SOFFICE_PATH.",
        );
      }
      // retry sekali dengan profil segar — pulih dari lock profil basi setelah crash/timeout
      console.error("Konversi docx gagal, retry dengan profil segar:", err);
      const freshProfile = path.join(os.tmpdir(), `soffice-profile-${createId()}`);
      try {
        return await runConversion(docx, freshProfile);
      } catch (err2) {
        console.error("Konversi docx gagal setelah retry:", err2);
        throw new AppError(
          "Konversi surat ke PDF gagal. Coba lagi; bila berulang, periksa instalasi LibreOffice di server.",
        );
      } finally {
        await fs.promises.rm(freshProfile, { recursive: true, force: true }).catch(() => {});
      }
    }
  });
  // rantai antrean tak boleh putus walau task ini gagal
  queue = task.catch(() => {});
  return task;
}
