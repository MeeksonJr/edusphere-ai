"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, DollarSign, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export const dynamic = 'force-dynamic';

export default function CareerDetailPage() {
  const params = useParams()
  const id = params.id as string

  // This would typically come from an API or database
  const jobDetails = {
    "frontend-developer": {
      title: "Frontend Developer",
      location: "Remote (US/Europe)",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      description:
        "We're looking for a talented Frontend Developer to join our team and help build the next generation of educational AI tools.",
      responsibilities: [
        "Develop and maintain responsive web applications using Next.js and React",
        "Collaborate with designers to implement UI/UX designs",
        "Write clean, maintainable, and efficient code",
        "Optimize applications for maximum speed and scalability",
        "Implement state management solutions",
      ],
      requirements: [
        "3+ years of experience with React and modern JavaScript",
        "Experience with Next.js and TypeScript",
        "Strong understanding of responsive design principles",
        "Familiarity with state management libraries (Redux, Zustand, etc.)",
        "Experience with CSS frameworks like Tailwind CSS",
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible remote work policy",
        "Health, dental, and vision insurance",
        "401(k) matching",
        "Professional development budget",
      ],
    },
    "ai-engineer": {
      title: "AI Engineer",
      location: "Remote (US/Europe)",
      type: "Full-time",
      salary: "$120,000 - $160,000",
      description:
        "We're seeking an experienced AI Engineer to help develop and improve our AI-powered educational tools and features.",
      responsibilities: [
        "Design and implement AI models for educational applications",
        "Integrate with various LLM APIs (OpenAI, Anthropic, etc.)",
        "Optimize AI performance and response quality",
        "Develop custom fine-tuned models for specific educational domains",
        "Collaborate with product and engineering teams to implement AI features",
      ],
      requirements: [
        "3+ years of experience in machine learning or AI development",
        "Strong Python programming skills",
        "Experience with LLMs and prompt engineering",
        "Familiarity with NLP concepts and techniques",
        "Understanding of educational technology is a plus",
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible remote work policy",
        "Health, dental, and vision insurance",
        "401(k) matching",
        "Professional development budget",
      ],
    },
    "product-manager": {
      title: "Product Manager",
      location: "Remote (US/Europe)",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      description:
        "We're looking for a Product Manager to help shape the future of our AI-powered educational platform.",
      responsibilities: [
        "Define product vision, strategy, and roadmap",
        "Gather and prioritize product requirements",
        "Work closely with engineering, design, and marketing teams",
        "Analyze market trends and competitive landscape",
        "Collect and analyze user feedback to inform product decisions",
      ],
      requirements: [
        "3+ years of experience in product management",
        "Experience with educational technology or AI products",
        "Strong analytical and problem-solving skills",
        "Excellent communication and stakeholder management abilities",
        "Data-driven approach to decision making",
      ],
      benefits: [
        "Competitive salary and equity options",
        "Flexible remote work policy",
        "Health, dental, and vision insurance",
        "401(k) matching",
        "Professional development budget",
      ],
    },
  }

  const job = jobDetails[id as keyof typeof jobDetails]

  if (!job) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          <AmbientBackground />
          <div className="text-center relative z-10 p-8 glass-surface rounded-2xl max-w-md mx-4">
            <h1 className="text-3xl font-bold mb-4 text-foreground">Job Not Found</h1>
            <p className="mb-6 text-foreground/70">Sorry, the job position you're looking for doesn't exist.</p>
            <Link href="/careers">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
                Back to Careers
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground />

        {/* Header */}
        <section className="pt-32 lg:pt-40 pb-12 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto">
                <Link href="/careers" className="inline-flex items-center text-foreground/60 hover:text-cyan-400 transition-colors mb-8 group">
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Careers
                </Link>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  <span className="text-foreground">{job.title}</span>
                </h1>

                <div className="flex flex-wrap gap-4 mb-8">
                  <span className="inline-flex items-center px-4 py-2 rounded-full glass-surface border-foreground/10 text-foreground/80 text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full glass-surface border-foreground/10 text-foreground/80 text-sm font-medium">
                    <Clock className="w-4 h-4 mr-2 text-cyan-400" />
                    {job.type}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full glass-surface border-foreground/10 text-foreground/80 text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-2 text-cyan-400" />
                    {job.salary}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Job Details */}
        <section className="pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-8 md:p-12">
                  <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground">
                    <p className="text-xl leading-relaxed mb-12">{job.description}</p>

                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="bg-cyan-500/10 p-2 rounded-lg mr-4">
                        <CheckCircle className="w-6 h-6 text-cyan-500" />
                      </span>
                      Key Responsibilities
                    </h2>
                    <ul className="space-y-4 mb-12 list-none pl-0">
                      {job.responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2.5 mr-4 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="bg-purple-500/10 p-2 rounded-lg mr-4">
                        <CheckCircle className="w-6 h-6 text-purple-500" />
                      </span>
                      Requirements
                    </h2>
                    <ul className="space-y-4 mb-12 list-none pl-0">
                      {job.requirements.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-purple-400 mt-2.5 mr-4 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="bg-green-500/10 p-2 rounded-lg mr-4">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </span>
                      Benefits
                    </h2>
                    <ul className="space-y-4 mb-12 list-none pl-0">
                      {job.benefits.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 rounded-full bg-green-400 mt-2.5 mr-4 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-16 pt-8 border-t border-foreground/10 flex justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white px-12 py-6 text-lg shadow-lg shadow-cyan-500/20 w-full sm:w-auto"
                    >
                      Apply for this Position
                    </Button>
                  </div>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
