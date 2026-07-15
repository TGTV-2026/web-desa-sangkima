# Panduan Template Surat .docx

Panduan operator untuk mengubah berkas Word dari klien/desa menjadi template
surat yang diisi otomatis oleh sistem E-Surat. **Perubahan format surat tidak
butuh developer**: edit .docx → unggah di halaman admin → selesai.

## Konsep

Setiap jenis surat boleh punya satu **template .docx aktif**. Saat surat
diterbitkan, sistem:

1. Mengisi semua **tag** `{nama}`, `{nik}`, `{nomor_surat}`, dst. dengan data asli.
2. Mengganti **gambar placeholder** dengan QR verifikasi & tanda tangan asli.
3. Mengonversi hasilnya ke PDF (LibreOffice, di server).

Jenis surat **tanpa** template .docx tetap memakai render bawaan sistem (layout
standar lama) — tidak ada yang rusak bila template belum diunggah.

PDF surat yang sudah terbit **di-snapshot** — mengganti template tidak mengubah
surat lama.

## Menyiapkan template dari .docx klien

1. Buka berkas .docx asli (yang masih berisi data contoh atas nama orang).
2. Ganti setiap data contoh dengan tag dari panel **Kamus Tag** di halaman
   *Dashboard → Jenis Surat → Ubah*. Contoh:
   - `Budi Santoso` → `{nama}`
   - `6408xxxxxxxxxxxx` → `{nik}`
   - `470/012/DS-SKM/VI/2026` → `{nomor_surat}`
   - `12 Juni 2026` (tanggal surat) → `{tanggal_surat}`
   - Data khusus jenis surat (mis. nama usaha) → `{nama_usaha}` — nama tag =
     kolom "Nama tag" pada Field Tambahan jenis surat itu.
3. **Ketik tag dalam satu tarikan** (jangan mengedit huruf per huruf di tengah
   tag) — Word kadang memecah teks sehingga tag tidak terbaca. Kalau ragu,
   hapus seluruh tag lalu ketik ulang.
4. Blok kondisional: teks yang hanya muncul bila penandatangan Sekretaris Desa
   ditulis `{#is_sekdes}a.n Kepala Desa{/is_sekdes}`.
5. Butuh data yang belum ada tag-nya? Tambahkan Field Tambahan baru di form
   jenis surat — nama field otomatis jadi tag.

## Gambar QR & tanda tangan

1. Unduh **placeholder QR** dan **placeholder TTD** dari panel Kamus Tag.
2. Sisipkan keduanya di posisi yang diinginkan di Word; atur ukuran & letak
   bebas (QR disarankan minimal ±2,5 cm agar mudah dipindai).
3. **Jangan mengedit/memotong/mengompres gambar placeholder** — sistem
   mengenalinya dari isi berkas; gambar yang diubah tidak terdeteksi.
4. Perilaku otomatis: QR baru muncul setelah surat diproses (punya nomor);
   versi cetak-basah dirender tanpa gambar tanda tangan (ruangnya tetap
   kosong); tanda tangan digital diambil dari profil penandatangan.

## Font

Gunakan **Times New Roman** (atau Liberation Serif). Server memakai Liberation
Serif yang lebar hurufnya identik dengan Times New Roman, jadi layout tidak
bergeser. Font dekoratif lain bisa membuat baris berpindah — periksa lewat
Pratinjau.

## Unggah, validasi, pratinjau

1. *Dashboard → Jenis Surat → Ubah → panel Template DOCX → unggah*.
2. Sistem menolak template yang memakai **tag tak dikenal** dan menampilkan
   daftar tag yang diizinkan — perbaiki di Word lalu unggah ulang.
3. Setelah tersimpan, klik **Pratinjau PDF**: surat dirender dengan data contoh
   + watermark PRATINJAU; placeholder QR/TTD sengaja dibiarkan tampak agar
   posisinya terlihat.
4. Versi lama template diarsip di `uploads/templates/` (rollback manual: unduh
   versi lama, unggah ulang).

## Troubleshooting

| Gejala | Penyebab & solusi |
|---|---|
| "Tag tidak dikenal ..." saat unggah | Salah ketik tag / field belum dibuat. Cocokkan dengan Kamus Tag. |
| "Template .docx tidak valid: ..." | Tag tidak ditutup / terpecah oleh Word. Hapus tag bermasalah, ketik ulang satu tarikan. |
| "LibreOffice (soffice) tidak ditemukan" | Server/dev belum punya LibreOffice. Produksi: pastikan `nixpacks.toml` memuat `libreoffice-writer` dan sudah redeploy. Dev Windows: pasang LibreOffice, set `SOFFICE_PATH` di `.env`. |
| Placeholder QR/TTD "tidak ditemukan" | Gambar placeholder diedit/dikompres Word. Sisipkan ulang dari unduhan asli. |
| Surat tercetak "..." di beberapa bagian | Tag merujuk field yang diganti namanya/kosong. Selaraskan nama field & template. |
| Layout bergeser di PDF | Font non-Times. Ganti ke Times New Roman / Liberation Serif. |

## Catatan deployment

- Kolom DB baru (`template_docx`, `supporting_docs`): jalankan
  `npx drizzle-kit push`/`migrate` ke DB produksi **sebelum** redeploy dipakai.
- `uploads/templates/` otomatis aman karena `uploads/` sudah persistent volume.
- Redeploy pertama setelah perubahan `nixpacks.toml` mengunduh LibreOffice
  (image membengkak ±400 MB — normal).
