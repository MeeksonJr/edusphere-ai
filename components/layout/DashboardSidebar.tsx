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
  Brain,
  Target,
  BarChart3,
  Award,
  Bell,
  StickyNote,
  Mic,
  Users,
  Code2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/supabase-provider";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { useSettings } from "@/contexts/settings-context";
import { cn } from "@/lib/utils";


export function DashboardSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hydration fix
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
    }
  }, [collapsed, isMobile]);

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcutsEnabled = settings?.keyboardShortcuts?.sidebarToggle !== false;
      const localStorageEnabled = typeof window !== 'undefined' ? localStorage.getItem("keyboardShortcuts") !== "false" : true;
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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Courses", href: "/dashboard/courses", icon: Sparkles },
    { name: "Assignments", href: "/dashboard/assignments", icon: CheckSquare },
    { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker },
    { name: "AI Tutor", href: "/dashboard/ai-tutor", icon: Brain },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: BrainCircuit },
    { name: "Podcasts", href: "/dashboard/podcasts", icon: Mic },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Study Resources", href: "/dashboard/resources", icon: BookOpen },
    { name: "Notes", href: "/dashboard/notes", icon: StickyNote },
    { name: "Skills", href: "/dashboard/skills", icon: Target },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Certificates", href: "/dashboard/certificates", icon: Award },
    { name: "Family Hub", href: "/dashboard/family", icon: Users },
    { name: "Developer", href: "/dashboard/developer", icon: Code2 },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <AnimatePresence>
        {(mobileOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: -300 } : undefined}
            animate={isMobile ? { x: mobileOpen ? 0 : -300 } : undefined}
            exit={isMobile ? { x: -300 } : undefined}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed left-0 top-0 h-screen z-40 transition-all duration-300 border-r border-foreground/5 bg-background/50 backdrop-blur-xl",
              collapsed ? "w-16" : "w-64",
              isMobile && "w-64 shadow-2xl"
            )}
            role="navigation"
            aria-label="Dashboard navigation"
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="h-16 flex items-center px-4 border-b border-foreground/5">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 focus:outline-none"
                  aria-label="Dashboard home"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  {!collapsed && (
                    <span className="text-lg font-bold font-display text-foreground">
                      EduSphere
                    </span>
                  )}
                </Link>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-foreground/10" aria-label="Main navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        active
                          ? "bg-cyan-500/10 text-cyan-500 font-medium"
                          : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                      )}
                      // Close mobile menu on click
                      onClick={() => isMobile && setMobileOpen(false)}
                    >
                      {active && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-r-full"
                        />
                      )}
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors",
                          active ? "text-cyan-500" : "text-foreground/50 group-hover:text-foreground/80"
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed && (
                        <span className="text-sm flex-1">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Collapse Toggle (Desktop Only) */}
              {!isMobile && (
                <div className="p-3 border-t border-foreground/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-start text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                  >
                    <ChevronLeft
                      className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
                    />
                    {!collapsed && <span className="ml-2">Collapse</span>}
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}


