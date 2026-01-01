import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ContentCard from "@/components/content-card";
import { ArrowRight, BookOpen, Clock, DollarSign, Shield, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { createClient } from "../../supabase/server";
import Link from "next/link";

// Mock featured content for demo
const featuredContent = [
  {
    id: '1',
    title: 'The Future of AI in Content Creation',
    author: 'Sarah Chen',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    price: 499,
    sessionDuration: 30,
    rating: 4.8,
    reviewCount: 124,
    readCount: 1520,
    likeCount: 342,
    contentType: 'text' as const,
  },
  {
    id: '2',
    title: 'Mastering Web3 Development',
    author: 'Alex Rivera',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    price: 699,
    sessionDuration: 45,
    rating: 4.9,
    reviewCount: 89,
    readCount: 980,
    likeCount: 256,
    contentType: 'pdf' as const,
  },
  {
    id: '3',
    title: 'Investment Strategies for 2024',
    author: 'Michael Park',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    price: 899,
    sessionDuration: 60,
    rating: 4.7,
    reviewCount: 203,
    readCount: 2340,
    likeCount: 567,
    contentType: 'pdf' as const,
  },
  {
    id: '4',
    title: 'The Psychology of Success',
    author: 'Emma Watson',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    price: 399,
    sessionDuration: 25,
    rating: 4.6,
    reviewCount: 156,
    readCount: 1890,
    likeCount: 423,
    contentType: 'text' as const,
  },
  {
    id: '5',
    title: 'Advanced Machine Learning Techniques',
    author: 'David Kim',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    price: 799,
    sessionDuration: 45,
    rating: 4.9,
    reviewCount: 67,
    readCount: 720,
    likeCount: 189,
    contentType: 'text' as const,
  },
  {
    id: '6',
    title: 'Building Sustainable Businesses',
    author: 'Lisa Green',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    price: 599,
    sessionDuration: 35,
    rating: 4.5,
    reviewCount: 98,
    readCount: 1120,
    likeCount: 298,
    contentType: 'pdf' as const,
  },
];

const features = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Timed Sessions",
    description: "Readers pay for time-limited access, creating urgency and value"
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Instant Earnings",
    description: "Get paid immediately when readers purchase access to your content"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Content Protection",
    description: "Your content is protected with our secure reading environment"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description: "Track reads, earnings, and engagement with detailed analytics"
  },
];

const testimonials = [
  {
    quote: "PayPerRead transformed how I monetize my research. I've earned more in 3 months than a year of ad revenue.",
    author: "Dr. James Miller",
    role: "Tech Researcher",
    avatar: "JM",
    rating: 5,
  },
  {
    quote: "The timed access model creates real value. My readers are more engaged knowing their time is limited.",
    author: "Sarah Chen",
    role: "Finance Writer",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "Finally, a platform that respects creators. The analytics help me understand what content resonates.",
    author: "Alex Rivera",
    role: "Tech Blogger",
    avatar: "AR",
    rating: 5,
  },
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      
      {/* Featured Content Section */}
      <section className="py-24 relative bg-gray-50">
        <div className="container mx-auto px-6 relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 font-display mb-2">Featured Content</h2>
              <p className="text-gray-500">Discover premium articles from top creators</p>
            </div>
            <Link href="/browse" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-animation">
            {featuredContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Why Creators Choose PayPerRead</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our platform is designed to maximize your earnings while providing readers with premium experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all group border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-r from-blue-50 via-violet-50 to-blue-50">
        <div className="container mx-auto px-6 relative">
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: "$2.5M+", label: "Paid to Creators", icon: <DollarSign className="w-6 h-6" /> },
                { value: "50K+", label: "Active Readers", icon: <Users className="w-6 h-6" /> },
                { value: "10K+", label: "Premium Articles", icon: <BookOpen className="w-6 h-6" /> },
                { value: "4.9", label: "Average Rating", icon: <Star className="w-6 h-6" /> },
              ].map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold font-mono gradient-text mb-2">{stat.value}</div>
                  <div className="text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-display mb-4">Loved by Creators</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Join thousands of creators who are already monetizing their content.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative bg-gradient-to-br from-blue-600 to-violet-600">
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white font-display mb-4">Ready to Monetize Your Content?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join PayPerRead today and start earning from your premium content. No upfront costs, just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors">
              Start Creating
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/browse" className="inline-flex items-center justify-center px-8 py-4 text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all text-lg font-medium">
              Explore Content
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
