"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/components/supabase-provider";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Wait a bit for Supabase to initialize
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 500);

    const checkUser = async () => {
      if (!supabase) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.push("/dashboard");
        }
      } catch (error) {
        // Ignore errors during initial check
      } finally {
        setInitializing(false);
      }
    };
    checkUser();

    return () => clearTimeout(timer);
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Authentication service is not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          // Email not verified, redirect to verification page
          router.push(`/verify-email?email=${encodeURIComponent(data.user.email || "")}`)
        } else {
          // Email verified, go to dashboard
          router.push("/dashboard")
          router.refresh()
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout navbarVariant="default">
      <div className="min-h-screen relative flex items-center justify-center py-20 px-4 overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground variant="subtle" />

        <div className="max-w-md w-full relative z-10">
          <ScrollReveal direction="up">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-6 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-3">
                <span className="text-foreground">Welcome</span>{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Back
                </span>
              </h1>
              <p className="text-foreground/70 text-lg">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Form */}
            <GlassSurface className="p-8 md:p-10 shadow-xl backdrop-blur-xl">
              {initializing && (
                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-blue-400 text-sm flex items-center font-medium">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 block font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 h-12 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground mb-2 block font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-foreground/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-foreground/70 group-hover:text-foreground transition-colors">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || initializing || !supabase}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold h-12 shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-foreground/10 text-center">
                <p className="text-foreground/70 text-sm">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}
