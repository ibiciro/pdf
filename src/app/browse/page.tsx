import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContentCard from "@/components/content-card";
import { Search, SlidersHorizontal } from "lucide-react";

// Mock content data
const allContent = [
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
  },
  {
    id: '7',
    title: 'Cryptocurrency Trading Masterclass',
    author: 'John Crypto',
    thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    price: 999,
    sessionDuration: 60,
    rating: 4.8,
    reviewCount: 234,
    readCount: 3200,
    likeCount: 890,
  },
  {
    id: '8',
    title: 'UX Design Principles',
    author: 'Maria Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    price: 449,
    sessionDuration: 30,
    rating: 4.7,
    reviewCount: 145,
    readCount: 1650,
    likeCount: 412,
  },
  {
    id: '9',
    title: 'Leadership in the Digital Age',
    author: 'Robert CEO',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    price: 699,
    sessionDuration: 40,
    rating: 4.6,
    reviewCount: 178,
    readCount: 2100,
    likeCount: 534,
  },
];

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

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 font-display mb-4">Browse Content</h1>
            <p className="text-gray-500">Discover premium articles and documents from top creators</p>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
              />
            </div>
            
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-animation">
            {allContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
          
          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all font-medium">
              Load More Content
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
