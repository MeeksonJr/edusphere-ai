"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/components/supabase-provider";
import { Sparkles, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full">
          <ScrollReveal direction="up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-white">Welcome</span>{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Back
                </span>
              </h1>
              <p className="text-white/70">
                Sign in to continue to your dashboard
              </p>
            </div>

            {/* Login Form */}
            <GlassSurface className="p-8">
              {initializing && (
                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-blue-400 text-sm flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </p>
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10 glass-surface border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-white mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 glass-surface border-white/20 text-white placeholder:text-white/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
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
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 bg-transparent"
                    />
                    <span className="text-white/70">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || initializing || !supabase}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
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

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-center text-white/70 text-sm">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
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
