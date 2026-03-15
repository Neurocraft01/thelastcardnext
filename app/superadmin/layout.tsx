import { requirePolicyPage } from "@/lib/policy";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requirePolicyPage("/superadmin");
  return <>{children}</>;
}
