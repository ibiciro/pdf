import DashboardNavbar from "@/components/dashboard-navbar";
import EarningsDashboard from "@/components/earnings-dashboard";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function EarningsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's content with earnings
  const { data: content } = await supabase
    .from('content')
    .select('*')
    .eq('creator_id', user.id)
    .order('total_earnings_cents', { ascending: false });

  // Fetch payment transactions
  const contentIds = content?.map(c => c.id) || [];
  const { data: transactions } = contentIds.length > 0 
    ? await supabase
        .from('reading_sessions')
        .select('*')
        .in('content_id', contentIds)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <EarningsDashboard 
        user={user} 
        content={content || []} 
        transactions={transactions || []} 
      />
    </div>
  );
}
