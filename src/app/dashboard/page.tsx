import DashboardNavbar from "@/components/dashboard-navbar";
import CreatorDashboard from "@/components/creator-dashboard";
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

  // Fetch user's content from database
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <CreatorDashboard user={user} initialContent={content || []} />
    </div>
  );
}
