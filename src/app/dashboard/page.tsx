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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <CreatorDashboard user={user} />
    </div>
  );
}
