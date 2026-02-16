"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 1,
    title: "How AI is Transforming Education in 2026",
    excerpt:
      "Explore the latest trends in AI-powered educational tools and how they're revolutionizing the way courses are created and delivered.",
    date: "January 15, 2026",
    author: "Dr. Jane Doe",
    category: "AI in Education",
    image: "/placeholder.svg?height=300&width=600",
    slug: "how-ai-is-transforming-education",
    featured: true,
  },
  {
    id: 2,
    title: "5 Study Techniques Backed by Cognitive Science",
    excerpt:
      "Discover evidence-based study methods that can help students retain information better and improve academic performance.",
    date: "January 10, 2026",
    author: "John Smith",
    category: "Study Tips",
    image: "/placeholder.svg?height=200&width=400",
    slug: "study-techniques-backed-by-science",
    featured: false,
  },
  {
    id: 3,
    title: "The Future of Personalized Learning",
    excerpt:
      "How AI and machine learning are enabling truly personalized educational experiences tailored to each learner's needs.",
    date: "January 5, 2026",
    author: "Alice Rodriguez",
    category: "Educational Technology",
    image: "/placeholder.svg?height=200&width=400",
    slug: "future-of-personalized-learning",
    featured: false,
  },
  {
    id: 4,
    title: "Creating Engaging Video Courses with AI",
    excerpt:
      "Learn how to leverage AI tools to create professional video courses that captivate and educate your audience effectively.",
    date: "December 28, 2025",
    author: "Michael Chen",
    category: "Course Creation",
    image: "/placeholder.svg?height=200&width=400",
    slug: "creating-engaging-video-courses",
    featured: false,
  },
  {
    id: 5,
    title: "Best Practices for Online Course Design",
    excerpt:
      "Essential tips and strategies for designing online courses that maximize learner engagement and knowledge retention.",
    date: "December 20, 2025",
    author: "Dr. Jane Doe",
    category: "Course Creation",
    image: "/placeholder.svg?height=200&width=400",
    slug: "best-practices-online-course-design",
    featured: false,
  },
  {
    id: 6,
    title: "The Science of Memory: How to Remember What You Learn",
    excerpt:
      "Understanding how memory works and applying scientific principles to improve retention and recall in educational content.",
    date: "December 15, 2025",
    author: "John Smith",
    category: "Learning Science",
    image: "/placeholder.svg?height=200&width=400",
    slug: "science-of-memory",
    featured: false,
  },
];

const categories = [
  "All Categories",
  "AI in Education",
  "Study Tips",
  "Educational Technology",
  "Course Creation",
  "Learning Science",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All Categories" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <PublicLayout>
      <div className="min-h-screen relative overflow-hidden">
        {/* Ambient Background */}
        <AmbientBackground />

        {/* Hero */}
        <section className="pt-32 lg:pt-48 pb-20 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 mb-8 shadow-lg shadow-cyan-500/20"
                >
                  <BookOpen className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Our</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Blog
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Insights, tips, and updates about AI-powered education and course creation
                </p>

                {/* Search */}
                <div className="max-w-2xl mx-auto relative z-20">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 text-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-foreground/5 bg-background/50 backdrop-blur-sm sticky top-[72px] z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md shadow-cyan-500/20"
                        : "glass-surface border-foreground/10 text-foreground/70 hover:text-foreground hover:border-cyan-500/30 hover:bg-foreground/5"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12 relative z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal direction="up">
                <Link href={`/blog/${featuredPost.slug}`}>
                  <GlassSurface className="overflow-hidden group cursor-pointer hover:border-cyan-500/30 transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-full min-h-[300px] bg-gradient-to-br from-cyan-500/20 to-pink-500/20 overflow-hidden">
                        {/* Placeholder gradient if image fails/missing */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-pink-900/40" />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <Image
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <Badge className="absolute top-6 left-6 bg-gradient-to-r from-cyan-500 to-pink-500 text-white border-0 px-3 py-1 text-sm shadow-lg">
                          Featured
                        </Badge>
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center">
                        <Badge className="w-fit mb-4 glass-surface border-foreground/20 text-foreground/80 hover:bg-foreground/5 transition-colors">
                          {featuredPost.category}
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-cyan-400 transition-colors leading-tight">
                          {featuredPost.title}
                        </h2>
                        <p className="text-foreground/70 mb-6 text-lg leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center space-x-6 text-foreground/60 text-sm">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{featuredPost.author}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{featuredPost.date}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="h-5 w-5 text-cyan-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassSurface>
                </Link>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="py-12 pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <ScrollReveal
                    key={post.id}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <AnimatedCard variant="3d" delay={0.1 * index} className="h-full group cursor-pointer">
                        <div className="p-0 h-full flex flex-col">
                          <div className="relative h-56 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 overflow-hidden rounded-t-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-pink-900/40" />
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="glass-surface border-white/20 text-white backdrop-blur-md bg-black/30">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h3>
                            <p className="text-foreground/70 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-foreground/5 mt-auto">
                              <div className="flex flex-col space-y-1 text-foreground/50 text-xs">
                                <div className="flex items-center space-x-1 font-medium text-foreground/70">
                                  <User className="h-3 w-3" />
                                  <span>{post.author}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{post.date}</span>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </AnimatedCard>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ScrollReveal direction="up">
                <GlassSurface className="p-16 text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-6">
                    <Search className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
                  <p className="text-foreground/70">
                    We couldn't find any articles matching your search. Try different keywords or categories.
                  </p>
                </GlassSurface>
              </ScrollReveal>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
