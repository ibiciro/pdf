import DashboardNavbar from "@/components/dashboard-navbar";
import SettingsDashboard from "@/components/settings-dashboard";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <SettingsDashboard user={user} profile={profile} />
    </div>
  );
}
