import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContentDetailClient from "@/components/content-detail-client";
import { createClient } from "../../../../supabase/server";
import { notFound } from "next/navigation";

// Fallback mock content for demo
const mockContent = {
  id: '1',
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
  contentType: 'text' as const,
  createdAt: '2024-01-15',
  allowDownload: false,
  downloadPrice: 0,
};

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Try to fetch real content from database
  const { data: dbContent } = await supabase
    .from('content')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'published')
    .single();

  // Transform database content to display format
  const content = dbContent ? {
    id: dbContent.id,
    title: dbContent.title,
    description: dbContent.description || '',
    author: 'Creator',
    authorBio: '',
    thumbnail: dbContent.thumbnail_url || null,
    price: dbContent.price_cents,
    sessionDuration: dbContent.session_duration_minutes,
    rating: 0,
    reviewCount: 0,
    readCount: dbContent.total_reads || 0,
    likeCount: 0,
    contentType: dbContent.content_type as 'text' | 'pdf',
    createdAt: dbContent.created_at,
    allowDownload: dbContent.allow_download || false,
    downloadPrice: dbContent.download_price_cents || 0,
  } : mockContent;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ContentDetailClient content={content} user={user} />
      <Footer />
    </div>
  );
}
