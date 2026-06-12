import { redirect } from "next/navigation";
import Sidebar from "@/components/esurat/Sidebar";
import { getSessionUser } from "@/server/utils/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 px-5 py-8 md:px-12 md:py-10 max-w-5xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
