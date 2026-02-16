"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Menu, LogOut, Settings, User } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommandPalette } from "@/components/dashboard/CommandPalette"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardNavbarProps {
    onMenuClick: () => void
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()

    // Get current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Get current page title based on path
    const getPageTitle = (path: string) => {
        const segment = path.split('/').pop();
        if (!segment || segment === 'dashboard') return 'Dashboard';
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    }

    useEffect(() => {
        const getUser = async () => {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single()
                setUser({ ...user, profile })
            }
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase?.auth.signOut()
        window.location.href = "/"
    }

    return (
        <header className="h-16 border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
            {/* Left: Mobile Menu & Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-foreground/70"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="hidden md:flex flex-col">
                    <h2 className="text-lg font-semibold text-foreground capitalize">
                        {getPageTitle(pathname)}
                    </h2>
                    <p className="text-xs text-foreground/50">
                        {currentDate}
                    </p>
                </div>
            </div>

            {/* Center: Search (Desktop) */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
                <CommandPalette />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Search Trigger (Mobile) */}
                <div className="md:hidden">
                    <CommandPalette />
                </div>

                <ThemeToggle />

                <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8 border border-foreground/10">
                                <AvatarImage src={user?.profile?.avatar_url} alt={user?.email} />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-pink-500 text-white">
                                    {user?.email?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.profile?.full_name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile" className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-100 dark:focus:bg-red-900/20 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
