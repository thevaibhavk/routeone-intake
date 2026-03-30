import { AdminDashboard } from "@/components/admin-dashboard";
import { getAdminSession } from "@/lib/auth";
import { listInvites } from "@/lib/store";

export default async function AdminPage() {
  const session = await getAdminSession();
  const invites = session?.role === "admin" ? await listInvites() : [];
  return <AdminDashboard authenticated={Boolean(session)} initialInvites={invites} />;
}
