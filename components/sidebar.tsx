"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Calendar,
  Home,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Beaker,
  BookOpen,
  BrainCircuit,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [open, setOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

        setUser({ ...data.user, profile })
      }
    }

    getUser()
  }, [supabase])

  useEffect(() => {
    // Close sidebar on mobile by default
    if (isMobile) {
      setOpen(false)
      setCollapsed(false) // Don't allow collapsed state on mobile
    } else {
      setOpen(true) // Always open on desktop
    }
  }, [isMobile])

  // Update body class when sidebar state changes
  useEffect(() => {
    if (!isMobile) {
      document.body.classList.toggle("sidebar-collapsed", collapsed)

      // Add event to dispatch resize event when sidebar state changes
      // This helps components like charts to resize properly
      window.dispatchEvent(new Event("resize"))
    }
  }, [collapsed, isMobile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const toggleSidebar = () => {
    setOpen(!open)
  }

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    // Update layout
    document.querySelector(".md\\:pl-64")?.classList.toggle("md:pl-16", collapsed)
    document.querySelector(".md\\:pl-64")?.classList.toggle("md:pl-64", !collapsed)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setOpen(false)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Assignments", href: "/dashboard/assignments", icon: CheckSquare },
    { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Study Resources", href: "/dashboard/resources", icon: BookOpen },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: BrainCircuit },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  // Overlay for mobile
  const Overlay = () =>
    isMobile && open ? <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar} /> : null

  return (
    <>
      <Overlay />

      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Desktop collapse button */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className={`fixed ${collapsed ? "left-16" : "left-64"} top-4 z-50 hidden md:flex transition-all duration-300`}
          onClick={toggleCollapse}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform bg-gray-900 transition-all duration-300 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed && !isMobile ? "w-16" : "w-64"}`}
      >
        <div className="flex h-full flex-col">
          <div
            className={`flex h-16 items-center justify-center border-b border-gray-800 ${collapsed && !isMobile ? "px-2" : "px-4"}`}
          >
            <Link href="/dashboard" className="flex items-center" onClick={closeSidebar}>
              {collapsed && !isMobile ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20">
                  <span className="text-lg font-bold text-primary">E</span>
                </div>
              ) : (
                <h1 className="text-2xl font-bold neon-text-purple">EduSphere AI</h1>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gray-800 text-white neon-text-purple"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  title={collapsed && !isMobile ? item.name : ""}
                >
                  <item.icon
                    className={`${collapsed && !isMobile ? "mx-auto" : "mr-3"} h-5 w-5 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-white"}`}
                  />
                  {(!collapsed || isMobile) && item.name}
                </Link>
              )
            })}
          </nav>

          <div className={`border-t border-gray-800 p-4 ${collapsed && !isMobile ? "px-2" : ""}`}>
            {user && !collapsed && (
              <div className="flex items-center mb-4 space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.profile?.full_name || user.email}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">
                    {user.profile?.subscription_tier || "free"} Plan
                  </p>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className={`${collapsed && !isMobile ? "w-full justify-center px-0" : "w-full justify-start"} text-gray-300 hover:bg-gray-800 hover:text-white`}
              onClick={handleSignOut}
              title={collapsed && !isMobile ? "Sign out" : ""}
            >
              <LogOut className={`${collapsed && !isMobile ? "mx-auto" : "mr-3"} h-5 w-5 text-gray-400`} />
              {(!collapsed || isMobile) && "Sign out"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
