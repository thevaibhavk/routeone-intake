import { notFound } from "next/navigation";

import { getAdminSession } from "@/lib/auth";
import { getInviteByToken, getInternalForm } from "@/lib/store";
import { InternalForm } from "@/components/internal-form";

export default async function InternalFormPage({ params }: { params: Promise<{ inviteId: string }> }) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    notFound();
  }

  const { inviteId } = await params;
  const form = await getInternalForm(inviteId);

  return <InternalForm inviteId={inviteId} initialData={form} />;
}
