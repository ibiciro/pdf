'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home, BookOpen, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import NotificationBell from './notification-bell'

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">PayPerRead</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/browse" className="px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Browse
            </Link>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
            <Search className="w-5 h-5" />
          </button>
          
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-gray-100">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="text-gray-700 hover:text-gray-900">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-gray-700 hover:text-gray-900"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/')
                  router.refresh()
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
