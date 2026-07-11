const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-06-10T..." (atau objek Date) -> "10 Juni 2026" */
export function formatTanggal(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/** 25000 -> "Rp25.000" (tanpa desimal). 0/null -> "" agar bisa disembunyikan. */
export function formatRupiah(value: number | null | undefined): string {
  if (value == null || value <= 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** "2026-06-10T08:30:00Z" (atau objek Date) -> "10 Juni 2026, 16.30" (waktu lokal) */
export function formatTanggalWaktu(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  const jam = String(d.getHours()).padStart(2, "0");
  const menit = String(d.getMinutes()).padStart(2, "0");
  return `${formatTanggal(iso)}, ${jam}.${menit}`;
}
