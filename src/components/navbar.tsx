import Link from 'next/link'
import { createClient } from '../../supabase/server'
import { Button } from './ui/button'
import { BookOpen, Search, ShieldCheck } from 'lucide-react'
import UserProfile from './user-profile'

export default async function Navbar() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin';
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" prefetch className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display gradient-text">PayPerRead</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/browse" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Browse
          </Link>
          <Link href="/creators" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            For Creators
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            Pricing
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-purple-600 hover:text-purple-700 transition-colors font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Link>
          )}
        </div>
        
        <div className="flex gap-4 items-center">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-500" />
          </button>
          
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="btn-glow text-white font-semibold px-6">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <Button className="btn-glow text-white font-semibold px-6">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
