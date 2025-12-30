import DashboardNavbar from "@/components/dashboard-navbar";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's content for analytics
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch reading sessions for this creator's content
  const contentIds = content?.map(c => c.id) || [];
  const { data: sessions } = contentIds.length > 0 
    ? await supabase
        .from('reading_sessions')
        .select('*')
        .in('content_id', contentIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <AnalyticsDashboard 
        user={user} 
        content={content || []} 
        sessions={sessions || []} 
      />
    </div>
  );
}
