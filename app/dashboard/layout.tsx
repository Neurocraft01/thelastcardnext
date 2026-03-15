import { DashboardShell } from "@/components/dashboard-shell";
import { requirePageUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser(["customer", "admin"]);
  return <DashboardShell>{children}</DashboardShell>;
}
