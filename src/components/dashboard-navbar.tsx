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
import { UserCircle, Home, BookOpen, Bell, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DashboardNavbar() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center glow-cyan group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">PayPerRead</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <button className="p-2 rounded-lg glass hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg glass hover:bg-white/10 transition-colors text-gray-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg glass hover:bg-white/10">
                <UserCircle className="h-6 w-6 text-gray-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-strong border-white/10">
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white focus:text-white focus:bg-white/10"
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
