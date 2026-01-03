import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DashboardNavbar from "@/components/dashboard-navbar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import NotificationsPage from "@/components/notifications-page";

export default async function NotificationsDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex pt-16">
        <DashboardSidebar user={user} activePage="notifications" />
        <main className="flex-1 lg:ml-64 p-6 lg:p-8">
          <NotificationsPage notifications={notifications || []} />
        </main>
      </div>
    </div>
  );
}
