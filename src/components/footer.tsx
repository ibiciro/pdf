import Link from 'next/link';
import { Twitter, Linkedin, Github, BookOpen } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gray-200 bg-gray-50">
      <div className="relative container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display gradient-text">PayPerRead</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              The premium content monetization platform for creators who value their work.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/browse" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Browse Content</Link></li>
              <li><Link href="/creators" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">For Creators</Link></li>
              <li><Link href="/pricing" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Pricing</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">API</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">About</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Blog</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Careers</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Press</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Privacy</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Terms</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Security</Link></li>
              <li><Link href="#" className="text-gray-500 hover:text-blue-600 transition-colors text-sm">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} PayPerRead. All rights reserved.
          </div>
          <div className="text-gray-500 text-sm">
            Built with ❤️ for creators worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}
