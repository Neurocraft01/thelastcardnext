import { requirePolicyPage } from "@/lib/policy";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePolicyPage("/admin");
  return <>{children}</>;
}
