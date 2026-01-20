"use client"

import { useParams } from "next/navigation"
import Link from "next/link"

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
          <p className="mb-6">Sorry, the job position you're looking for doesn't exist.</p>
          <Link
            href="/careers"
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Back to Careers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-900/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
              EduSphere AI
            </span>
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="/" className="hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="/careers" className="text-purple-400 transition-colors">
              Careers
            </a>
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <a href="/" className="hover:text-purple-400 transition-colors">
            Home
          </a>
          <span>/</span>
          <a href="/careers" className="hover:text-purple-400 transition-colors">
            Careers
          </a>
          <span>/</span>
          <span className="text-purple-400">{job.title}</span>
        </div>
      </div>

      {/* Job Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text">
            {job.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{job.salary}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg mb-8">{job.description}</p>

            <h2 className="text-xl font-semibold text-purple-400 mt-8 mb-4">Key Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              {job.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-purple-400 mt-8 mb-4">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2">
              {job.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2 className="text-xl font-semibold text-purple-400 mt-8 mb-4">Benefits</h2>
            <ul className="list-disc pl-5 space-y-2">
              {job.benefits.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <Link
              href={`/careers/${id}/apply`}
              className="inline-block px-8 py-4 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-colors text-lg font-semibold"
            >
              Apply for this Position
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-purple-900/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
