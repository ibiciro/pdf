import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <Link href="/" className="text-xl font-bold text-gray-900 mb-2 inline-block">
              PayPerRead
            </Link>
            <p className="text-gray-500 text-sm">
              Content monetization for creators.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex gap-6">
              <Link href="/browse" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Browse</Link>
              <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Pricing</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">About</Link>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Privacy</Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
          © {currentYear} PayPerRead
        </div>
      </div>
    </footer>
  );
}
