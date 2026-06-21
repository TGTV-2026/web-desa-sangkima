import { redirect } from "next/navigation";
import Sidebar from "@/components/esurat/Sidebar";
import { getSessionUser } from "@/server/utils/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

return (
  <div className="min-h-screen bg-paper flex flex-col md:flex-row">
    <Sidebar role={session.role} name={session.name} />
    <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[80px] pt-[8px] pb-[32px]">
      {children}
    </main>
  </div>
);
}
