'use client'

import Link from 'next/link'
import { createClient } from '../../supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { UserCircle, Home, BookOpen, Bell, Search, ShieldCheck, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(userData?.role === 'admin' || userData?.role === 'superadmin')
      }
    }
    checkAdmin()
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">PayPerRead</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2">
              Dashboard
            </Link>
            <Link href="/browse" className="px-4 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-2">
              Browse
            </Link>
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-gray-100">
                <UserCircle className="h-6 w-6 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem 
                className="text-gray-700 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                onClick={() => router.push('/dashboard')}
              >
                <User className="w-4 h-4 mr-2" />
                My Dashboard
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem 
                  className="text-purple-600 hover:bg-purple-50 focus:bg-purple-50 cursor-pointer"
                  onClick={() => router.push('/admin')}
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
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
