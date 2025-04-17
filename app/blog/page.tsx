import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, User, ArrowRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function BlogPage() {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "How AI is Transforming Education in 2023",
      excerpt:
        "Explore the latest trends in AI-powered educational tools and how they're changing the way students learn.",
      date: "June 15, 2023",
      author: "Dr. Jane Doe",
      category: "AI in Education",
      image: "/placeholder.svg?height=200&width=400",
      slug: "how-ai-is-transforming-education",
    },
    {
      id: 2,
      title: "5 Study Techniques Backed by Cognitive Science",
      excerpt:
        "Discover evidence-based study methods that can help you retain information better and improve your academic performance.",
      date: "May 28, 2023",
      author: "John Smith",
      category: "Study Tips",
      image: "/placeholder.svg?height=200&width=400",
      slug: "study-techniques-backed-by-science",
    },
    {
      id: 3,
      title: "The Future of Personalized Learning",
      excerpt:
        "How AI and machine learning are enabling truly personalized educational experiences tailored to each student's needs.",
      date: "April 12, 2023",
      author: "Alice Rodriguez",
      category: "Educational Technology",
      image: "/placeholder.svg?height=200&width=400",
      slug: "future-of-personalized-learning",
    },
    {
      id: 4,
      title: "Managing Academic Stress: A Student's Guide",
      excerpt:
        "Practical strategies for handling the pressures of academic life and maintaining your mental well-being.",
      date: "March 5, 2023",
      author: "Michael Chen",
      category: "Student Wellness",
      image: "/placeholder.svg?height=200&width=400",
      slug: "managing-academic-stress",
    },
    {
      id: 5,
      title: "How to Make the Most of AI Study Tools",
      excerpt: "Tips and tricks for leveraging AI-powered study assistants to maximize your learning efficiency.",
      date: "February 20, 2023",
      author: "Dr. Jane Doe",
      category: "AI in Education",
      image: "/placeholder.svg?height=200&width=400",
      slug: "making-the-most-of-ai-study-tools",
    },
    {
      id: 6,
      title: "The Science of Memory: How to Remember What You Learn",
      excerpt:
        "Understanding how memory works and applying scientific principles to improve your retention and recall.",
      date: "January 15, 2023",
      author: "John Smith",
      category: "Learning Science",
      image: "/placeholder.svg?height=200&width=400",
      slug: "science-of-memory",
    },
  ]

  // Categories for filtering
  const categories = [
    "All Categories",
    "AI in Education",
    "Study Tips",
    "Educational Technology",
    "Student Wellness",
    "Learning Science",
  ]

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
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6 neon-text-purple">EduSphere AI Blog</h1>
              <p className="text-xl text-gray-300 mb-8">
                Insights, tips, and the latest news on AI in education and effective learning strategies.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input placeholder="Search articles..." className="pl-10 bg-gray-900 border-gray-700" />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  className={index === 0 ? "bg-primary" : "border-gray-700"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <article className="glass-card overflow-hidden transition-all hover:neon-border-purple">
                    <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <span className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="mx-2">•</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{post.date}</span>
                      </div>
                      <h2 className="text-xl font-bold mb-3 hover:neon-text-purple transition-all">{post.title}</h2>
                      <p className="text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-900/50 rounded-full mr-2 flex items-center justify-center">
                            <User className="h-4 w-4 text-purple-300" />
                          </div>
                          <span className="text-sm text-gray-300">{post.author}</span>
                        </div>
                        <span className="text-purple-400 text-sm flex items-center">
                          Read more <ArrowRight className="ml-1 h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" className="border-gray-700">
                Load More Articles
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 neon-text-blue">Stay Updated</h2>
              <p className="text-xl text-gray-300 mb-8">
                Subscribe to our newsletter to receive the latest articles and updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <Input placeholder="Your email address" className="bg-gray-800 border-gray-700" />
                <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">We respect your privacy. Unsubscribe at any time.</p>
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
