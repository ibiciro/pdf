'use client'
import { UserCircle } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { createClient } from '../../supabase/client'
import { useRouter } from 'next/navigation'

export default function UserProfile() {
    const supabase = createClient()
    const router = useRouter()

    return (
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

    )
}