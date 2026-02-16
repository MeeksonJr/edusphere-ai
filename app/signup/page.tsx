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
import { Sparkles, Mail, Lock, User, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          router.push("/dashboard");
        }
      } catch (error) {
        // Ignore errors during initial check
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError("Authentication service is not available. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email already confirmed, go to dashboard
          router.push("/dashboard")
        } else {
          // Email confirmation required, go to verification page
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    {
      text: "Contains a number",
      met: /\d/.test(formData.password),
    },
    {
      text: "Contains a letter",
      met: /[a-zA-Z]/.test(formData.password),
    },
  ];

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
                <span className="text-foreground">Create Your</span>{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Account
                </span>
              </h1>
              <p className="text-foreground/70 text-lg">
                Start creating amazing courses in minutes
              </p>
            </div>

            {/* Signup Form */}
            <GlassSurface className="p-8 md:p-10 shadow-xl backdrop-blur-xl">
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground mb-2 block font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pl-10 h-12 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground mb-2 block font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
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
                  {formData.password && (
                    <div className="mt-3 space-y-2 p-3 rounded-lg bg-foreground/5">
                      {passwordRequirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <CheckCircle
                            className={`h-3 w-3 ${req.met ? "text-cyan-400" : "text-foreground/20"
                              }`}
                          />
                          <span
                            className={
                              req.met ? "text-cyan-400 font-medium" : "text-foreground/50"
                            }
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground mb-2 block font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-12 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 rounded border-foreground/20 bg-transparent text-cyan-500 focus:ring-cyan-500"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-foreground/70 cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold h-12 shadow-lg shadow-cyan-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-foreground/10 text-center">
                <p className="text-foreground/70 text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors hover:underline"
                  >
                    Sign in
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
