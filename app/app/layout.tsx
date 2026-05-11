import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell
      user={{ id: user.id, name: user.name, email: user.email, plan: user.plan }}
    >
      {children}
    </DashboardShell>
  );
}
