'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, FileText, X } from 'lucide-react';
import ContentCard from '@/components/content-card';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  price: number;
  sessionDuration: number;
  rating: number;
  reviewCount: number;
  readCount: number;
  likeCount: number;
  contentType: 'text' | 'pdf';
  category?: string;
  categoryColor?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface BrowseClientProps {
  initialContent: ContentItem[];
  categories: CategoryItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  green: 'bg-green-100 text-green-700 hover:bg-green-200',
  violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200',
  amber: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  red: 'bg-red-100 text-red-700 hover:bg-red-200',
  pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  cyan: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  teal: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  rose: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
};

export default function BrowseClient({ initialContent, categories }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'text' | 'pdf'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter content based on search and filters
  const filteredContent = initialContent.filter((item) => {
    // Search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Content type filter
    if (contentTypeFilter !== 'all' && item.contentType !== contentTypeFilter) {
      return false;
    }

    // Category filter
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category && item.category !== category.name) {
        return false;
      }
    }
    
    return true;
  });

  const textCount = initialContent.filter(c => c.contentType === 'text').length;
  const pdfCount = initialContent.filter(c => c.contentType === 'pdf').length;

  return (
    <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">Browse Content</h1>
          <p className="text-gray-500">Discover premium text articles and PDF documents from top creators</p>
        </div>

        {/* Content Type Stats */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{textCount} Articles</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{pdfCount} PDFs</span>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Content Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setContentTypeFilter('all')}
              className={`px-4 py-3.5 rounded-xl font-medium transition-all ${
                contentTypeFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setContentTypeFilter('text')}
              className={`px-4 py-3.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                contentTypeFilter === 'text'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Articles
            </button>
            <button
              onClick={() => setContentTypeFilter('pdf')}
              className={`px-4 py-3.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                contentTypeFilter === 'pdf'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDFs
            </button>
          </div>
        </div>
        
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.slug
                    ? CATEGORY_COLORS[category.color || 'blue'] + ' shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredContent.length}</span> results
            {searchQuery && <span> for "<span className="text-blue-600">{searchQuery}</span>"</span>}
            {selectedCategory && <span> in {categories.find(c => c.slug === selectedCategory)?.name}</span>}
          </p>
        </div>
        
        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters' 
                : 'No content available yet. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory || contentTypeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setContentTypeFilter('all');
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
        )}
        
        {/* Load More */}
        {filteredContent.length > 0 && filteredContent.length >= 12 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm">
              Load More Content
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
