import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Sparkles, Award, Lightbulb, GraduationCap, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 bg-purple-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">EduSphere AI</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/#features" className="hover:neon-text-purple transition-all">
              Features
            </Link>
            <Link href="/#pricing" className="hover:neon-text-purple transition-all">
              Pricing
            </Link>
            <Link href="/#testimonials" className="hover:neon-text-purple transition-all">
              Testimonials
            </Link>
            <Link href="/blog" className="hover:neon-text-purple transition-all">
              Blog
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-primary hover:neon-border-purple transition-all">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/80">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-700/50">
                <span className="text-sm font-medium text-purple-300 flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Our Story
                </span>
              </div>
              <h1 className="text-5xl font-bold mb-6 neon-text-purple">About EduSphere AI</h1>
              <p className="text-xl text-gray-300 mb-8">
                We're on a mission to transform education through the power of artificial intelligence.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 neon-text-blue">Our Story</h2>
              <div className="space-y-6 text-gray-300">
                <p>
                  EduSphere AI was founded in 2023 by a team of educators, AI researchers, and students who recognized
                  the transformative potential of artificial intelligence in education.
                </p>
                <p>
                  Our journey began when our founder, a computer science professor, noticed that students were
                  struggling to manage their academic workload effectively. Many were overwhelmed by assignments,
                  deadlines, and the sheer volume of information they needed to process.
                </p>
                <p>
                  We set out to create a platform that would leverage the power of AI to help students organize their
                  academic lives, study more effectively, and ultimately achieve better results. After months of
                  development and testing with real students, EduSphere AI was born.
                </p>
                <p>
                  Today, we're proud to serve thousands of students worldwide, helping them transform their learning
                  experience through our innovative AI-powered tools.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 neon-text-green">Our Mission</h2>
              <div className="space-y-6 text-gray-300">
                <p>
                  At EduSphere AI, our mission is to democratize access to high-quality educational support through
                  artificial intelligence. We believe that every student deserves personalized assistance that adapts to
                  their unique learning style and needs.
                </p>
                <p>
                  We're committed to developing AI tools that are not just technologically advanced, but also
                  pedagogically sound. Our platform is designed in collaboration with educators to ensure that it aligns
                  with established educational principles and practices.
                </p>
                <p>
                  We envision a future where AI serves as a powerful complement to human teachers, providing students
                  with 24/7 support, personalized feedback, and innovative learning experiences that would be impossible
                  to deliver at scale without technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center neon-text-purple">Our Values</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="glass-card p-6">
                  <div className="bg-purple-900/30 p-3 rounded-lg w-fit mb-4">
                    <Award className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Excellence</h3>
                  <p className="text-gray-400">
                    We strive for excellence in everything we do, from the algorithms we develop to the user experience
                    we deliver.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <div className="bg-green-900/30 p-3 rounded-lg w-fit mb-4">
                    <Lightbulb className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Innovation</h3>
                  <p className="text-gray-400">
                    We're constantly pushing the boundaries of what's possible with AI in education, exploring new ways
                    to enhance learning.
                  </p>
                </div>

                <div className="glass-card p-6">
                  <div className="bg-blue-900/30 p-3 rounded-lg w-fit mb-4">
                    <GraduationCap className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Student-Centered</h3>
                  <p className="text-gray-400">
                    We put students at the center of everything we do, designing our platform to address their real
                    needs and challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center neon-text-blue">Our Team</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="glass-card p-6 text-center">
                  <div className="w-24 h-24 bg-blue-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-400">MD</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mohamed Datt</h3>
                  <p className="text-gray-400 mb-4">Founder & CEO</p>
                  <p className="text-sm text-gray-500">
                    Former Engineering student with 1 years of experience in CAD, arduino.
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="w-24 h-24 bg-green-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">ML.D</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Mohamed L. Datt</h3>
                  <p className="text-gray-400 mb-4">CTO</p>
                  <p className="text-sm text-gray-500">
                    AI researcher with a background in natural language processing and machine learning.
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <div className="w-24 h-24 bg-purple-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-400">MJ</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">MeeksonJr</h3>
                  <p className="text-gray-400 mb-4">Head of Education</p>
                  <p className="text-sm text-gray-500">
                    Former high school student with a passion for educational technology and helping other students.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text-purple">Join Our Mission</h2>
              <p className="text-xl text-gray-300 mb-8">
                Be part of the educational revolution. Start using EduSphere AI today and transform your learning
                experience.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/80">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-2 bg-purple-600 rounded-lg p-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold neon-text-purple">EduSphere AI</h3>
              </div>
              <p className="text-gray-400 mb-4">Revolutionizing student productivity with AI-powered tools.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="hover:text-white">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/documentation" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduSphere AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
