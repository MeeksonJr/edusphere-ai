"use client";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Home, ArrowRight, Mail, Sparkles } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl mx-auto w-full">
          <ScrollReveal direction="up">
            {/* Success Icon */}
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-4 -mt-12 ml-8">
                <Icon className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                {currentMessage.title}
              </span>
            </h1>

            {/* Message */}
            <GlassSurface className="p-8 mb-8">
              <p className="text-xl text-white/80 text-center mb-6">
                {currentMessage.message}
              </p>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4">
                  What's Next?
                </h3>
                {currentMessage.nextSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-white/70 flex-1">{step}</p>
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
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-8"
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
                  className="w-full sm:w-auto glass-surface border-white/20 hover:border-cyan-500/50 text-white px-8"
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
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="text-white/50 text-sm">
                Need help?{" "}
                <Link
                  href="/contact"
                  className="text-cyan-400 hover:text-cyan-300 underline"
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </PublicLayout>
    }>
      <ThankYouContent />
    </Suspense>
  );
}

