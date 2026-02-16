"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Home, ArrowRight, Mail, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "contact"; // contact, subscription, course

  const messages = {
    contact: {
      title: "Thank You for Contacting Us!",
      message:
        "We've received your message and will get back to you within 24 hours. Our team is excited to help you!",
      icon: Mail,
      nextSteps: [
        "Check your email for a confirmation message",
        "Our team will review your inquiry",
        "You'll receive a response within 24 hours",
      ],
    },
    subscription: {
      title: "Welcome to EduSphere AI!",
      message:
        "Your subscription is now active. You can start creating amazing courses right away!",
      icon: Sparkles,
      nextSteps: [
        "Access your dashboard to create your first course",
        "Explore all premium features",
        "Join our community for tips and support",
      ],
    },
    course: {
      title: "Course Created Successfully!",
      message:
        "Your course is being generated. You'll receive a notification when it's ready to preview.",
      icon: CheckCircle,
      nextSteps: [
        "Your course is processing in the background",
        "You'll receive an email when it's ready",
        "Preview and edit your course from the dashboard",
      ],
    },
  };

  const currentMessage = messages[type as keyof typeof messages] || messages.contact;
  const Icon = currentMessage.icon;

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground variant="subtle" />

        <div className="max-w-2xl mx-auto w-full relative z-10">
          <ScrollReveal direction="up">
            {/* Success Icon */}
            <motion.div
              className="text-center mb-8 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-lg shadow-green-500/30">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 shadow-md border-4 border-background"
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                {currentMessage.title}
              </span>
            </h1>

            {/* Message */}
            <GlassSurface className="p-8 md:p-10 mb-8 shadow-xl">
              <p className="text-xl text-foreground/80 text-center mb-8 leading-relaxed">
                {currentMessage.message}
              </p>

              {/* Next Steps */}
              <div className="space-y-4 bg-foreground/5 p-6 rounded-xl border border-foreground/5">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-cyan-500" />
                  What's Next?
                </h3>
                {currentMessage.nextSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <span className="text-white text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-foreground/70 flex-1 font-medium">{step}</p>
                  </motion.div>
                ))}
              </div>
            </GlassSurface>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {type === "subscription" || type === "course" ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8 py-6 text-lg shadow-lg shadow-cyan-500/20"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : null}
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground px-8 py-6 text-lg hover:bg-foreground/5"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-12 text-center"
            >
              <p className="text-foreground/50 text-sm">
                Need help?{" "}
                <Link
                  href="/contact"
                  className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                  Contact our support team
                </Link>
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AmbientBackground />
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
            <div className="text-foreground font-medium">Loading...</div>
          </div>
        </div>
      </PublicLayout>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
