import { redirect } from "next/navigation";
import ResetPasswordForm from "./ResetPasswordForm";

type PageProps = {
  searchParams: Promise<{ userId?: string; token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { userId, token } = await searchParams;
  // Tanpa userId+token, link tidak valid — arahkan kembali ke permintaan reset.
  if (!userId || !token) redirect("/esurat/forgot-password");

  return <ResetPasswordForm userId={userId} token={token} />;
}
