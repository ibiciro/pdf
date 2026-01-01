import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getBrowseContentAction } from "@/app/actions";
import BrowseClient from "./browse-client";

const categories = [
  'All',
  'Technology',
  'Business',
  'Finance',
  'Science',
  'Health',
  'Education',
  'Entertainment',
  'Lifestyle',
];

export default async function BrowsePage() {
  const { content } = await getBrowseContentAction();
  
  // Transform content for display
  const transformedContent = content.map((item: any) => ({
    id: item.id,
    title: item.title,
    author: 'Creator',
    thumbnail: item.thumbnail_url,
    price: item.price_cents,
    sessionDuration: item.session_duration_minutes,
    rating: 0,
    reviewCount: 0,
    readCount: item.total_reads || 0,
    likeCount: 0,
    contentType: item.content_type || 'text',
  }));
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <BrowseClient initialContent={transformedContent} categories={categories} />
      <Footer />
    </div>
  );
}
