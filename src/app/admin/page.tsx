import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin or superadmin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || !['admin', 'superadmin'].includes(userData.role || '')) {
    redirect("/dashboard");
  }

  return <AdminDashboard isSuperAdmin={userData.role === 'superadmin'} />;
}
