import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "../../../supabase/server";
import BrowseClient from "./browse-client";

export default async function BrowsePage() {
  const supabase = await createClient();
  
  // Fetch content with category info
  const { data: content } = await supabase
    .from('content')
    .select(`
      *,
      category:categories(id, name, slug, color)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, color')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  
  // Transform content for display
  const transformedContent = (content || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    author: item.creator_name || 'Creator',
    authorAvatar: item.creator_avatar,
    thumbnail: item.thumbnail_url,
    price: item.price_cents,
    sessionDuration: item.session_duration_minutes,
    rating: 4.5,
    reviewCount: item.total_reads || 0,
    readCount: item.total_reads || 0,
    likeCount: item.total_likes || 0,
    contentType: item.content_type || 'text',
    category: item.category?.name,
    categoryColor: item.category?.color,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <BrowseClient initialContent={transformedContent} categories={categories || []} />
      <Footer />
    </div>
  );
}
