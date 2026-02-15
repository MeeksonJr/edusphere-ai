"use client";

export const dynamic = 'force-dynamic';

import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle } from "lucide-react";
import { useState } from "react";

const faqCategories = [
  {
    title: "Getting Started",
    icon: "🚀",
    questions: [
      {
        question: "How do I create my first course?",
        answer:
          "Simply sign up for a free account, enter your topic, and our AI will generate a complete course structure with slides, narration, and captions. You can then preview and edit everything in real-time before finalizing.",
      },
      {
        question: "Do I need any technical skills?",
        answer:
          "Not at all! EduSphere AI is designed for everyone. No coding, video editing, or design skills required. Just enter your topic and let AI do the work.",
      },
      {
        question: "Is there a free trial?",
        answer:
          "Yes! We offer a free tier that allows you to create and preview courses. You can upgrade anytime to export videos and access premium features.",
      },
    ],
  },
  {
    title: "Account & Billing",
    icon: "💳",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact our support team for a full refund.",
      },
    ],
  },
  {
    title: "Features & Usage",
    icon: "✨",
    questions: [
      {
        question: "What video formats can I export?",
        answer:
          "You can export videos in multiple formats: 16:9 for YouTube, 9:16 for TikTok, and 1:1 for Instagram. All exports are in high-quality MP4 format.",
      },
      {
        question: "Can I customize the course style?",
        answer:
          "Yes! Choose from professional, creative, cinematic, or minimalist styles. You can also customize colors, fonts, and add your own branding.",
      },
      {
        question: "How long does it take to generate a course?",
        answer:
          "Course generation typically takes 2-5 minutes depending on the length and complexity. You'll receive real-time updates on the progress.",
      },
      {
        question: "Can I edit the generated content?",
        answer:
          "Absolutely! All generated content is fully editable. You can modify slides, change narration, adjust timing, and customize everything to your liking.",
      },
    ],
  },
  {
    title: "Technical Support",
    icon: "🔧",
    questions: [
      {
        question: "What browsers are supported?",
        answer:
          "EduSphere AI works best on Chrome, Firefox, Safari, and Edge (latest versions). We recommend using Chrome for the best experience.",
      },
      {
        question: "Do I need to install any software?",
        answer:
          "No installation required! EduSphere AI runs entirely in your browser. Just sign up and start creating courses immediately.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your content with third parties.",
      },
    ],
  },
  {
    title: "Course Creation",
    icon: "🎬",
    questions: [
      {
        question: "What topics can I create courses about?",
        answer:
          "You can create courses on any topic! From technical subjects like programming and science to creative topics like art and design. Our AI adapts to any subject matter.",
      },
      {
        question: "How long can my courses be?",
        answer:
          "Courses can range from quick 5-minute explainers to comprehensive multi-hour courses. There's no strict limit - create what works best for your audience.",
      },
      {
        question: "Can I add my own images or videos?",
        answer:
          "Yes! You can upload your own images, videos, and audio files to enhance your courses. We also provide AI-generated visuals if you prefer.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    icon: "🛠️",
    questions: [
      {
        question: "Why is my video not generating?",
        answer:
          "This could be due to several reasons: check your internet connection, ensure you have sufficient credits, or try refreshing the page. If issues persist, contact our support team.",
      },
      {
        question: "Can I download my courses?",
        answer:
          "Yes! With a paid subscription, you can download your courses as MP4 files. Free tier users can preview courses in the browser.",
      },
      {
        question: "What if I'm not satisfied with the generated content?",
        answer:
          "You can regenerate any section of your course, edit it manually, or request a refund if you're not happy with the service. We're here to help!",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <PublicLayout>
      <div className="min-h-screen py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-white">Frequently Asked</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  Questions
                </span>
              </h1>
              <p className="text-xl text-white/70">
                Find answers to common questions about EduSphere AI
              </p>
            </div>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 glass-surface border-white/20 text-white placeholder:text-white/40 text-lg"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* FAQ Categories */}
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <ScrollReveal
                key={category.title}
                direction="up"
                delay={0.1 * categoryIndex}
              >
                <GlassSurface className="p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-white">
                      {category.title}
                    </h2>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="space-y-4"
                    value={selectedCategory || undefined}
                    onValueChange={setSelectedCategory}
                  >
                    {category.questions.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.title}-${index}`}
                        className="border-white/10"
                      >
                        <AccordionTrigger className="text-left text-white hover:text-cyan-400 transition-colors">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/70 leading-relaxed pt-2">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </GlassSurface>
              </ScrollReveal>
            ))}
          </div>

          {/* Still Have Questions */}
          <ScrollReveal direction="up" delay={0.5}>
            <div className="max-w-2xl mx-auto mt-16">
              <GlassSurface className="p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Still have questions?
                </h3>
                <p className="text-white/70 mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg transition-all"
                  >
                    Contact Support
                  </a>
                  <a
                    href="/support"
                    className="inline-flex items-center justify-center px-6 py-3 glass-surface border-white/20 hover:border-cyan-500/50 text-white rounded-lg transition-all"
                  >
                    Visit Help Center
                  </a>
                </div>
              </GlassSurface>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PublicLayout>
  );
}

