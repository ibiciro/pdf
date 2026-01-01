import DashboardNavbar from "@/components/dashboard-navbar";
import CreatorDashboard from "@/components/creator-dashboard";
import ReaderDashboard from "@/components/reader-dashboard";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's role from the database
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = userData?.role || 'reader';

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      {userRole === 'creator' || userRole === 'admin' || userRole === 'superadmin' ? (
        <CreatorDashboard user={user} />
      ) : (
        <ReaderDashboard user={user} />
      )}
    </div>
  );
}
