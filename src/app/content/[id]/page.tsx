import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContentDetailClient from "@/components/content-detail-client";
import { createClient } from "../../../../supabase/server";

// Mock content data
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
  contentType: 'text',
  createdAt: '2024-01-15',
};

export default async function ContentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ContentDetailClient content={mockContent} user={user} />
      <Footer />
    </div>
  );
}
