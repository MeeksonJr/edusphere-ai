"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
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
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BarChart3,
  Calendar,
  Award,
  Bell,
  CreditCard,
  FileText,
  Mic,
  Heart,
  Code,
  Lightbulb,
  type LucideIcon,
  BookMarked,
  Headphones,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  name: string
  icon: LucideIcon
  items: NavItem[]
  condition?: boolean // If false, group is hidden
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { supabase } = useSupabase()
  const [open, setOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [user, setUser] = useState<any>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        setUser({ ...data.user, profile })
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (isMobile) {
      setOpen(false)
      setCollapsed(false)
    } else {
      setOpen(true)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.toggle("sidebar-collapsed", collapsed)
      window.dispatchEvent(new Event("resize"))
    }
  }, [collapsed, isMobile])

  // Define grouped navigation
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        name: "Study",
        icon: BookOpen,
        items: [
          { name: "Assignments", href: "/dashboard/assignments", icon: CheckSquare },
          { name: "Courses", href: "/dashboard/courses", icon: BookMarked },
          { name: "Flashcards", href: "/dashboard/flashcards", icon: BrainCircuit },
          { name: "Notes", href: "/dashboard/notes", icon: FileText },
          { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
          { name: "Skills", href: "/dashboard/skills", icon: Lightbulb },
        ],
      },
      {
        name: "AI Tools",
        icon: Sparkles,
        items: [
          { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker },
          { name: "AI Tutor", href: "/dashboard/ai-tutor", icon: Headphones },
          { name: "Podcasts", href: "/dashboard/podcasts", icon: Mic },
        ],
      },
      {
        name: "Social",
        icon: Users,
        items: [
          { name: "Community", href: "/dashboard/community", icon: Users },
          ...(user?.profile?.institution_role
            ? [{ name: "Institution", href: "/dashboard/institution", icon: GraduationCap }]
            : []),
        ],
      },
      {
        name: "Analytics",
        icon: BarChart3,
        items: [
          { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          { name: "Certificates", href: "/dashboard/certificates", icon: Award },
          { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        ],
      },
      {
        name: "Account",
        icon: User,
        items: [
          { name: "Profile", href: "/dashboard/profile", icon: User },
          { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
          { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
          { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ],
      },
      {
        name: "Manage",
        icon: Code,
        items: [
          { name: "Family Hub", href: "/dashboard/family", icon: Heart },
          { name: "Developer", href: "/dashboard/developer", icon: Code },
        ],
      },
    ],
    [user]
  )

  // Auto-expand the group containing the active page
  useEffect(() => {
    if (pathname === "/dashboard") {
      setExpandedGroup(null)
      return
    }
    for (const group of navGroups) {
      if (group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))) {
        setExpandedGroup(group.name)
        return
      }
    }
  }, [pathname, navGroups])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const toggleSidebar = () => setOpen(!open)

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
    document.querySelector(".md\\:pl-64")?.classList.toggle("md:pl-16", collapsed)
    document.querySelector(".md\\:pl-64")?.classList.toggle("md:pl-64", !collapsed)
  }

  const closeSidebar = () => {
    if (isMobile) setOpen(false)
  }

  const toggleGroup = (groupName: string) => {
    // If collapsed, expand sidebar first
    if (collapsed && !isMobile) {
      setCollapsed(false)
      document.querySelector(".md\\:pl-64")?.classList.remove("md:pl-16")
      document.querySelector(".md\\:pl-64")?.classList.add("md:pl-64")
      document.body.classList.remove("sidebar-collapsed")
      window.dispatchEvent(new Event("resize"))
    }
    setExpandedGroup((prev) => (prev === groupName ? null : groupName))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const isDashboardActive = pathname === "/dashboard"

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
        className={`fixed inset-y-0 left-0 z-40 transform bg-gray-900 transition-all duration-300 ease-in-out md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          } ${collapsed && !isMobile ? "w-16" : "w-64"}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className={`flex h-16 items-center justify-center border-b border-gray-800 ${collapsed && !isMobile ? "px-2" : "px-4"
              }`}
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

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            {/* Dashboard — always-visible top link */}
            <Link
              href="/dashboard"
              onClick={closeSidebar}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all mb-1 ${isDashboardActive
                  ? "bg-gray-800 text-white neon-text-purple"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              title={collapsed && !isMobile ? "Dashboard" : ""}
            >
              <Home
                className={`${collapsed && !isMobile ? "mx-auto" : "mr-3"} h-5 w-5 ${isDashboardActive ? "text-primary" : "text-gray-400 group-hover:text-white"
                  }`}
              />
              {(!collapsed || isMobile) && "Dashboard"}
            </Link>

            {/* Divider */}
            {(!collapsed || isMobile) && <div className="border-t border-gray-800 my-2 mx-1" />}

            {/* Grouped nav */}
            {navGroups.map((group) => {
              const isGroupExpanded = expandedGroup === group.name
              const hasActiveChild = group.items.some((item) => isActive(item.href))

              return (
                <div key={group.name} className="mb-0.5">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`w-full group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all ${hasActiveChild
                        ? "text-white bg-gray-800/50"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                      }`}
                    title={collapsed && !isMobile ? group.name : ""}
                  >
                    <group.icon
                      className={`${collapsed && !isMobile ? "mx-auto" : "mr-3"} h-5 w-5 transition-colors ${hasActiveChild ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                        }`}
                    />
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="flex-1 text-left">{group.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isGroupExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Group items — animated expand/collapse */}
                  {(!collapsed || isMobile) && (
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-in-out ${isGroupExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <div className="ml-3 border-l border-gray-800 pl-2 py-0.5">
                        {group.items.map((item) => {
                          const itemActive = isActive(item.href)
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeSidebar}
                              className={`group flex items-center rounded-md px-2 py-1.5 text-sm transition-all ${itemActive
                                  ? "bg-gray-800 text-white neon-text-purple"
                                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                              <item.icon
                                className={`mr-2.5 h-4 w-4 ${itemActive ? "text-primary" : "text-gray-500 group-hover:text-white"
                                  }`}
                              />
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User footer */}
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
              className={`${collapsed && !isMobile ? "w-full justify-center px-0" : "w-full justify-start"
                } text-gray-300 hover:bg-gray-800 hover:text-white`}
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
