import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import AdminDashboard from "@/components/admin-dashboard";
import DashboardNavbar from "@/components/dashboard-navbar";

// List of admin emails (in production, use database roles)
const ADMIN_EMAILS = ['admin@example.com'];

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user is admin (for demo, first user becomes admin)
  // In production, check against database roles
  const { data: allUsers } = await supabase.from('users').select('id').order('created_at', { ascending: true }).limit(1);
  const isFirstUser = allUsers?.[0]?.id === user.id;
  const isAdmin = ADMIN_EMAILS.includes(user.email || '') || isFirstUser;

  if (!isAdmin) {
    return redirect("/dashboard");
  }

  // Fetch platform statistics
  const { data: content } = await supabase.from('content').select('*');
  const { data: users } = await supabase.from('users').select('*');
  const { data: sessions } = await supabase.from('reading_sessions').select('*');
  const { data: gatewaySettings } = await supabase.from('payment_gateway_settings').select('*');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <AdminDashboard 
        user={user}
        stats={{
          totalContent: content?.length || 0,
          totalUsers: users?.length || 0,
          totalSessions: sessions?.length || 0,
          totalRevenue: sessions?.reduce((acc, s) => acc + (s.amount_paid_cents || 0), 0) || 0,
        }}
        gatewaySettings={gatewaySettings || []}
      />
    </div>
  );
}
