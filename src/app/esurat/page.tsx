import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/utils/session";
import LoginForm from "./LoginForm";

// Warga yang sudah punya sesi aktif (cookie access_token masih valid) tidak
// perlu melihat halaman login lagi — langsung diarahkan ke dasbor.
export default async function LoginPage() {
  const session = await getSessionUser();
  if (session) redirect("/esurat/dashboard");

  return <LoginForm />;
}
