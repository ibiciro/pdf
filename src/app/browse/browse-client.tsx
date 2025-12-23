'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, FileText, Filter, X } from 'lucide-react';
import ContentCard from '@/components/content-card';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  thumbnail?: string;
  price: number;
  sessionDuration: number;
  rating: number;
  reviewCount: number;
  readCount: number;
  likeCount: number;
  contentType: 'text' | 'pdf';
}

interface BrowseClientProps {
  initialContent: ContentItem[];
  categories: string[];
}

export default function BrowseClient({ initialContent, categories }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
    
    return true;
  });

  const textCount = initialContent.filter(c => c.contentType === 'text').length;
  const pdfCount = initialContent.filter(c => c.contentType === 'pdf').length;

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-display mb-4">Browse Content</h1>
          <p className="text-gray-500">Discover premium text articles and PDF documents from top creators</p>
        </div>

        {/* Content Type Notice */}
        <div className="mb-8 p-4 bg-gradient-to-r from-violet-50 to-red-50 border border-violet-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-violet-700">{textCount} Text Articles</span>
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium text-red-700">{pdfCount} PDF Documents</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all"
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
              className={`px-4 py-4 rounded-xl font-medium transition-all ${
                contentTypeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setContentTypeFilter('text')}
              className={`px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                contentTypeFilter === 'text'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setContentTypeFilter('pdf')}
              className={`px-4 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                contentTypeFilter === 'pdf'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          </div>
          
          {/* More Filters Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredContent.length}</span> results
            {searchQuery && <span> for "<span className="text-blue-600">{searchQuery}</span>"</span>}
          </p>
        </div>
        
        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters' 
                : 'No content available yet. Check back soon!'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setContentTypeFilter('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-animation">
            {filteredContent.map((content) => (
              <ContentCardWithType key={content.id} {...content} />
            ))}
          </div>
        )}
        
        {/* Load More */}
        {filteredContent.length > 0 && filteredContent.length >= 12 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-200 transition-all font-medium">
              Load More Content
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// ContentCard wrapper (badge is now built into ContentCard)
function ContentCardWithType(props: ContentItem) {
  return <ContentCard {...props} />;
}
