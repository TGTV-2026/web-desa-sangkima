/**
 * Penanda "error ini aman ditampilkan ke pengguna".
 *
 * Masalah yang dipecahkannya: service melempar `new Error("Email atau password
 * salah")` yang MEMANG untuk dibaca warga, sementara Drizzle/bcrypt/jose juga
 * melempar `Error` — berisi teks query SQL, nama tabel, dan potongan data.
 * Keduanya `Error` polos, jadi sisi penangkap tak bisa membedakannya dan
 * terpaksa meneruskan `error.message` apa adanya. Query SQL beserta NIK warga
 * pernah tampil di form login CMS dan form register karena ini.
 *
 * Aturannya sekarang: hanya `AppError` yang boleh sampai ke layar. Sisanya
 * dicatat ke log server dan diganti pesan generik.
 */
export class AppError extends Error {
  /** Nama field form yang salah, agar klien bisa menandai input yang tepat. */
  readonly field?: string;
  /** Kode mesin untuk percabangan di klien (mis. "EMAIL_NOT_VERIFIED"). */
  readonly code?: string;
  /** Konteks tambahan yang menyertai `code`. */
  readonly userId?: string;

  constructor(
    message: string,
    opts?: { field?: string; code?: string; userId?: string },
  ) {
    super(message);
    this.name = "AppError";
    this.field = opts?.field;
    this.code = opts?.code;
    this.userId = opts?.userId;
  }
}

/**
 * `redirect()` dan `notFound()` milik Next.js bekerja dengan cara MELEMPAR.
 * Bila tertangkap `catch` biasa, pengalihan halaman batal dan pengguna malah
 * melihat pesan "NEXT_REDIRECT;replace;/admin/login;307". Setiap catch yang
 * membungkus guard sesi wajib melempar ulang error jenis ini.
 */
export function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }
  const digest = (error as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}

/**
 * Pesan yang aman dikirim ke klien. `AppError` diteruskan apa adanya; error
 * lain dicatat ke log server lalu diganti `fallback` — jangan pernah
 * mengembalikan `error.message` mentah dari sini.
 */
export function pesanAman(error: unknown, fallback: string): string {
  if (error instanceof AppError) return error.message;
  console.error("[error tak terduga]", error);
  return fallback;
}

/**
 * Versi `pesanAman` untuk Server Action. Bedanya: MELEMPAR ULANG error kontrol
 * Next (redirect/notFound) alih-alih menelannya — kalau tidak, `redirect()` di
 * dalam guard sesi yang terbungkus `try` akan batal dan operator malah melihat
 * toast "NEXT_REDIRECT". Pakai ini di `catch` server action, bukan `err.message`.
 */
export function pesanAksi(error: unknown, fallback: string): string {
  if (isNextControlFlowError(error)) throw error;
  return pesanAman(error, fallback);
}
