import sharp from "sharp";

// Kompres + ubah ukuran gambar agar ringan untuk web (mengurangi beban halaman
// walau operator mengunggah foto kamera beresolusi/berukuran sangat besar).
export type ImageVariant = "photo" | "graphic";

// photo   → foto biasa (galeri, hero, produk, dst): WebP, maks sisi 1920px.
// graphic → gambar yang HARUS tetap PNG: tanda tangan/logo transparan. pdf-lib
//           (pembuat PDF surat) hanya bisa membaca PNG/JPEG, bukan WebP, jadi
//           TTD wajib PNG. Transparansi tetap terjaga.
const PRESET: Record<
  ImageVariant,
  { maxDim: number; format: "webp" | "png" }
> = {
  photo: { maxDim: 1920, format: "webp" },
  graphic: { maxDim: 1000, format: "png" },
};

export async function compressImage(
  input: Buffer,
  variant: ImageVariant = "photo",
): Promise<{ buffer: Buffer; ext: string }> {
  const { maxDim, format } = PRESET[variant];

  // failOn: "none" → toleran terhadap file kamera yang sedikit tak sempurna.
  // rotate() tanpa argumen → auto-orientasi berdasar EXIF (foto HP sering miring).
  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: maxDim,
      height: maxDim,
      fit: "inside",
      withoutEnlargement: true,
    });

  if (format === "png") {
    const buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    return { buffer, ext: "png" };
  }

  const buffer = await pipeline.webp({ quality: 80 }).toBuffer();
  return { buffer, ext: "webp" };
}
