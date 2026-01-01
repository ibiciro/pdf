import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContentDetailClient from "@/components/content-detail-client";
import { createClient } from "../../../../supabase/server";
import { getContentByIdAction } from "@/app/actions";
import { notFound } from "next/navigation";

// Fallback mock content for demo IDs
const fallbackContent = {
  id: 'demo',
  title: 'The Future of AI in Content Creation',
  description: 'Explore how artificial intelligence is revolutionizing the way we create, distribute, and consume content. This comprehensive guide covers the latest trends, tools, and techniques that are shaping the future of digital content.',
  author: 'Sarah Chen',
  authorBio: 'AI researcher and tech writer with 10+ years of experience in the field.',
  thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  price: 499,
  sessionDuration: 30,
  rating: 4.8,
  reviewCount: 124,
  readCount: 1520,
  likeCount: 342,
  contentType: 'text',
  createdAt: '2024-01-15',
};

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if this is a demo ID
  const isDemoId = params.id.startsWith('demo-');
  
  let contentData;
  
  if (isDemoId) {
    // Use fallback content for demo IDs
    contentData = {
      ...fallbackContent,
      id: params.id,
    };
  } else {
    // Fetch real content from database
    const { content } = await getContentByIdAction(params.id);
    
    if (!content) {
      // If content not found, try fallback for demo purposes
      contentData = {
        ...fallbackContent,
        id: params.id,
      };
    } else {
      // Transform database content to match the expected format
      contentData = {
        id: content.id,
        title: content.title,
        description: content.description || 'No description available.',
        author: content.users?.full_name || 'Anonymous',
        authorBio: 'Content creator on PayPerRead',
        thumbnail: content.thumbnail_url || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&q=80',
        price: content.price_cents,
        sessionDuration: content.session_duration_minutes,
        rating: content.avgRating || 0,
        reviewCount: content.reviewCount || 0,
        readCount: content.total_reads || 0,
        likeCount: content.likeCount || 0,
        contentType: content.content_type,
        createdAt: content.created_at,
      };
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ContentDetailClient content={contentData} user={user} />
      <Footer />
    </div>
  );
}
