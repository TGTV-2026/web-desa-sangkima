import { redirect } from "next/navigation";
import { getPendingVerificationUserId } from "@/server/utils/session";
import { userRepository } from "@/server/repositories/user.repository";
import VerifyOtpForm from "./VerifyOtpForm";

// Halaman verifikasi OTP digerakkan oleh cookie httpOnly "pending_verification"
// (di-set saat registrasi / login akun belum-aktif). Karena cookie bertahan
// walau tab ditutup, user bisa kembali kapan saja untuk menyelesaikan verifikasi.
export default async function VerifyOtpPage() {
  const userId = await getPendingVerificationUserId();
  if (!userId) redirect("/esurat");

  const user = await userRepository.findById(userId);
  // Tidak ada user, akun nonaktif, atau email sudah terverifikasi → tidak perlu di sini.
  if (!user || user.deletedAt || user.emailVerifiedAt) redirect("/esurat");

  return <VerifyOtpForm userId={user.id} email={user.email} />;
}
