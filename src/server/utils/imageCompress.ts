import sharp from "sharp";

// Kompres + ubah ukuran gambar agar ringan untuk web (mengurangi beban halaman
// walau operator mengunggah foto kamera beresolusi/berukuran sangat besar).
export type ImageVariant = "photo" | "graphic" | "signature";

// photo     → foto biasa (galeri, hero, produk, dst): WebP, maks sisi 1920px.
// graphic   → gambar yang HARUS tetap PNG: logo transparan. pdf-lib (pembuat
//             PDF surat) hanya bisa membaca PNG/JPEG, bukan WebP. Transparansi
//             yang sudah ada tetap terjaga.
// signature → scan tanda tangan: sama seperti graphic, TAPI latar putih kertas
//             di-knockout jadi transparan supaya TTD tak tampak seperti kotak
//             tempelan saat ditempel ke surat.
const PRESET: Record<
  ImageVariant,
  { maxDim: number; format: "webp" | "png" }
> = {
  photo: { maxDim: 1920, format: "webp" },
  graphic: { maxDim: 1000, format: "png" },
  signature: { maxDim: 1000, format: "png" },
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
    if (variant === "signature") {
      // Knockout latar putih kertas → transparan. Ambang all-channel (semua
      // R/G/B near-white) menjaga tinta berwarna (pulpen biru: B tinggi, R/G
      // rendah → tidak near-white) tetap solid; hanya kertas putih yang hilang.
      const { data, info } = await pipeline
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      // ponytail: ambang keras (>240). Tepi antialias bisa sedikit kasar;
      // kalau perlu halus, ganti ke ramp 230–250 → alpha bertahap.
      for (let i = 0; i < data.length; i += info.channels) {
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          data[i + 3] = 0;
        }
      }
      const buffer = await sharp(data, { raw: info })
        .png({ compressionLevel: 9 })
        .toBuffer();
      return { buffer, ext: "png" };
    }
    const buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    return { buffer, ext: "png" };
  }

  const buffer = await pipeline.webp({ quality: 80 }).toBuffer();
  return { buffer, ext: "webp" };
}
