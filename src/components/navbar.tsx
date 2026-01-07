import Link from 'next/link'
import { createClient } from '../../supabase/server'
import UserProfile from './user-profile'

export default async function Navbar() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">PayPerRead</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
            Browse
          </Link>
          <Link href="/pricing" className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
            Pricing
          </Link>
        </div>
        
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign in
              </Link>
              <Link 
                href="/sign-up"
                className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
