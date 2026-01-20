"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { useSettings } from "@/contexts/settings-context";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useSupabase();
  const { settings } = useSettings();
  const [open, setOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          setUser({ ...data.user, profile });
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
      setCollapsed(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      window.dispatchEvent(new Event("resize"));
    }
  }, [collapsed, isMobile]);

  // Keyboard shortcut: Ctrl+B to toggle sidebar (check settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if shortcuts are enabled from settings context (default to true)
      const shortcutsEnabled = settings?.keyboardShortcuts?.sidebarToggle !== false;
      
      // Also check localStorage as fallback (for instant updates)
      const localStorageEnabled = localStorage.getItem("keyboardShortcuts") !== "false";
      const enabled = shortcutsEnabled !== false && localStorageEnabled;
      
      if (enabled && (e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        if (!isMobile) {
          setCollapsed((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, settings]);

  const handleSignOut = async () => {
    if (!supabase) {
      router.push("/");
      return;
    }
    try {
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Courses", href: "/dashboard/courses", icon: Sparkles },
    { name: "Assignments", href: "/dashboard/assignments", icon: CheckSquare },
    { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Study Resources", href: "/dashboard/resources", icon: BookOpen },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: BrainCircuit },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-surface border-white/20 text-white hover:border-purple-500/50 transition-all"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(open || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -300 } : false}
            animate={isMobile ? { x: open ? 0 : -300 } : false}
            exit={isMobile ? { x: -300 } : false}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed left-0 top-0 h-screen z-40 transition-all duration-300",
              collapsed ? "w-16" : "w-64",
              isMobile && "w-64"
            )}
            role="navigation"
            aria-label="Dashboard navigation"
          >
            <GlassSurface className="h-full w-full rounded-none border-r border-white/10 flex flex-col">
              {/* Logo */}
              <div className="p-4 border-b border-white/10">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg"
                  aria-label="Dashboard home"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {!collapsed && (
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      EduSphere
                    </span>
                  )}
                </Link>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Main navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black",
                        active
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          active ? "text-purple-400" : "text-white/60 group-hover:text-white"
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span className="text-sm font-medium flex-1">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="p-4 border-t border-white/10">
                {user && !collapsed && (
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                      <AvatarImage src={user.profile?.avatar_url} alt={user.email || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.profile?.full_name || user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-white/60 truncate">{user.email}</p>
                    </div>
                  </div>
                )}
                {user && collapsed && (
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                      <AvatarImage src={user.profile?.avatar_url} alt={user.email || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {/* Collapse Toggle (Desktop Only) */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-start text-white/70 hover:text-white mb-2"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  >
                    <ChevronLeft
                      className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
                      aria-hidden="true"
                    />
                    {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
                  </Button>
                )}

                {/* Sign Out */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {!collapsed && <span className="ml-2 text-sm">Sign Out</span>}
                </Button>
              </div>
            </GlassSurface>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

