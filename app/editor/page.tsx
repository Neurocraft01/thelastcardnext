import { EditorPageClient } from "@/components/editor-page-client";
import { requirePageUser } from "@/lib/auth";

export default async function EditorPage() {
  await requirePageUser(["customer", "admin"]);
  return <EditorPageClient />;
}
