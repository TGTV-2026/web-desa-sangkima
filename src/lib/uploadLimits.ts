// Batas ukuran unggah (dipakai bersama komponen klien & util server, jadi tak
// bergantung sharp/fs). Sengaja dibuat tinggi karena gambar dikompres otomatis
// di server — cukup untuk foto kamera langsung (DSLR/mirrorless 20–30 MB+).
// Ini plafon pengaman agar 1 file raksasa/iseng tak membebani/crash server,
// bukan pembatas foto biasa.
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_LABEL = "50 MB";

export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB (PDF disimpan apa adanya)
export const MAX_DOC_LABEL = "25 MB";
