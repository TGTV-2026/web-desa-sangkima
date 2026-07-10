// Batas ukuran unggah (dipakai bersama komponen klien & util server, jadi tak
// bergantung sharp/fs). Sengaja dibuat tinggi karena gambar dikompres otomatis
// di server — cukup untuk foto kamera langsung (DSLR/mirrorless 20–30 MB+).
// Ini plafon pengaman agar 1 file raksasa/iseng tak membebani/crash server,
// bukan pembatas foto biasa.
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_LABEL = "50 MB";

export const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB (PDF disimpan apa adanya)
export const MAX_DOC_LABEL = "25 MB";

// Video latar hero. Plafon pengaman agar 1 berkas raksasa tak menghabiskan
// disk/RAM VPS — BUKAN target. Video ini tak dikompres di server (tidak ada
// ffmpeg di build produksi), jadi apa pun yang diunggah akan diunduh apa adanya
// oleh SETIAP pengunjung beranda lewat kuota mereka sendiri.
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_VIDEO_LABEL = "200 MB";
// Di atas ini, CMS memperingatkan operator (tetap boleh diunggah). ~3 MB masih
// wajar untuk klip 30 detik 720p yang sudah dikompres.
export const WARN_VIDEO_BYTES = 5 * 1024 * 1024; // 5 MB
export const WARN_VIDEO_LABEL = "5 MB";
// Durasi hanya bisa dicek di browser (server tak punya ffprobe).
export const MAX_VIDEO_SECONDS = 30;
