"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Calendar,
  Tag,
  Share2,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { useSupabase } from "@/components/supabase-provider";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      }
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);

        // In a real app, you would fetch from a blog_posts table
        // For now, we'll use mock data
        const mockPost = {
          id: params.id,
          title: "The Future of AI in Education",
          slug: "future-of-ai-in-education",
          content: `
# The Future of AI in Education

Artificial intelligence is transforming education in profound ways. From personalized learning experiences to automated grading systems, AI technologies are helping educators and students alike.

## Personalized Learning

One of the most significant impacts of AI in education is the ability to personalize learning experiences. AI algorithms can analyze a student's performance, identify strengths and weaknesses, and tailor content to meet individual needs.

- Adaptive learning platforms adjust difficulty based on student performance
- Content recommendations based on learning style and preferences
- Real-time feedback to help students understand concepts

## AI Tutoring Systems

AI-powered tutoring systems provide students with on-demand assistance, answering questions and explaining concepts in a way that's tailored to their understanding.

### Benefits of AI Tutors:
1. 24/7 availability
2. Personalized explanations
3. Patience and adaptability
4. Data-driven insights

## Challenges and Considerations

While AI offers tremendous potential for education, there are important considerations:

- **Privacy concerns**: Protecting student data is paramount
- **Equity and access**: Ensuring all students have access to AI-enhanced education
- **Teacher training**: Preparing educators to work alongside AI tools
- **Maintaining human connection**: Balancing technology with human interaction

## The Future Landscape

As AI continues to evolve, we can expect to see:

- More sophisticated personalization
- Improved natural language processing for better human-AI interaction
- Integration with virtual and augmented reality
- AI-assisted curriculum development

The future of education will likely be a blend of human expertise and AI capabilities, creating more effective, engaging, and equitable learning experiences for all students.
          `,
          excerpt:
            "Explore how artificial intelligence is revolutionizing education through personalized learning, AI tutors, and more.",
          featured_image: "/placeholder.svg?height=600&width=1200",
          author: {
            name: "Dr. Sarah Johnson",
            avatar: "/placeholder.svg?height=100&width=100",
            title: "Education Technology Researcher",
          },
          published_at: "2023-09-15T10:30:00Z",
          updated_at: "2023-09-20T14:15:00Z",
          categories: [
            "Education Technology",
            "Artificial Intelligence",
            "Future of Learning",
          ],
          tags: ["AI", "EdTech", "Personalized Learning", "Education"],
          reading_time: 8, // minutes
          comments_count: 24,
          likes_count: 156,
        };

        setPost(mockPost);

        // Mock related posts
        setRelatedPosts([
          {
            id: "ai-tools-for-students",
            title: "Top 10 AI Tools Every Student Should Know About",
            excerpt:
              "Discover the essential AI tools that can help students excel in their academic journey.",
            featured_image: "/placeholder.svg?height=300&width=500",
            published_at: "2023-08-28T09:15:00Z",
            author: { name: "Michael Chen" },
            categories: ["Education Technology"],
          },
          {
            id: "ai-ethics-education",
            title: "Teaching AI Ethics in the Classroom",
            excerpt:
              "Why it's crucial to incorporate AI ethics into modern education curriculum.",
            featured_image: "/placeholder.svg?height=300&width=500",
            published_at: "2023-09-05T11:45:00Z",
            author: { name: "Dr. Emily Rodriguez" },
            categories: ["AI Ethics", "Education"],
          },
          {
            id: "virtual-reality-learning",
            title: "Virtual Reality: The Next Frontier in Education",
            excerpt:
              "How VR technology is creating immersive learning experiences for students worldwide.",
            featured_image: "/placeholder.svg?height=300&width=500",
            published_at: "2023-09-10T14:20:00Z",
            author: { name: "James Wilson" },
            categories: ["Virtual Reality", "Education Technology"],
          },
        ]);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive",
        });
        router.push("/blog");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id, router, supabase, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 w-1/2 bg-gray-800 rounded mb-4"></div>
            <div className="h-4 w-1/4 bg-gray-800 rounded mb-8"></div>
            <div className="h-96 bg-gray-800 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black p-6 md:p-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-gray-400 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <Button className="bg-primary hover:bg-primary/80">
              Return to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Function to render markdown content
  const renderMarkdown = (content: string) => {
    // This is a simple implementation - in a real app, you'd use a markdown parser
    const sections = content.split("\n\n");
    return sections.map((section, index) => {
      if (section.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold my-6">
            {section.replace("# ", "")}
          </h1>
        );
      } else if (section.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold my-5">
            {section.replace("## ", "")}
          </h2>
        );
      } else if (section.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-bold my-4">
            {section.replace("### ", "")}
          </h3>
        );
      } else if (section.startsWith("- ")) {
        const items = section.split("\n").map((item) => item.replace("- ", ""));
        return (
          <ul key={index} className="list-disc pl-6 my-4 space-y-2">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      } else if (section.includes("\n1. ")) {
        const items = section
          .split("\n")
          .filter((item) => item.match(/^\d+\. /));
        return (
          <ol key={index} className="list-decimal pl-6 my-4 space-y-2">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\. /, "")}</li>
            ))}
          </ol>
        );
      } else if (section.startsWith("**")) {
        return (
          <p key={index} className="font-bold my-4">
            {section.replace(/\*\*/g, "")}
          </p>
        );
      } else {
        return (
          <p key={index} className="my-4">
            {section}
          </p>
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 py-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2 bg-cyan-600 rounded-lg p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-foreground"
              >
                <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z" />
                <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8" />
                <path d="M15 2v5h5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold neon-text-purple">
              EduSphere AI
            </h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/#features"
              className="hover:neon-text-purple transition-all"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="hover:neon-text-purple transition-all"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:neon-text-purple transition-all"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="hover:neon-text-purple transition-all"
            >
              Contact
            </Link>
          </nav>
          <div className="flex space-x-4">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/80">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-primary hover:neon-border-purple transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/80">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-400 hover:text-foreground mb-6"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Blog
        </Link>

        <article className="glass-card p-8 mb-12">
          <h1 className="text-4xl font-bold mb-4 neon-text-blue">
            {post.title}
          </h1>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-400">{post.author.title}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(post.published_at).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span>{post.reading_time} min read</span>
            </div>
          </div>

          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.categories.map((category: string) => (
              <Badge key={category} className="bg-primary/20 text-primary">
                {category}
              </Badge>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            {renderMarkdown(post.content)}
          </div>

          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-800">
            {post.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-gray-800 text-gray-300"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                {post.comments_count} Comments
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </article>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 neon-text-purple">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Card key={relatedPost.id} className="glass-card overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img
                    src={relatedPost.featured_image || "/placeholder.svg"}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <span>
                      {new Date(relatedPost.published_at).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{relatedPost.author.name}</span>
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {relatedPost.excerpt}
                  </p>
                  <Link href={`/blog/${relatedPost.id}`}>
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-background/80 border-t border-cyan-900/50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div>
              <a
                href="/"
                className="flex items-center gap-2 mb-4"
                aria-label="EduSphere AI Home"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-pink-500">
                  EduSphere AI
                </span>
              </a>
              <p className="text-gray-400 mb-4">
                Empowering students with AI-powered learning tools and
                productivity solutions.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=100011003917426"
                  className="text-gray-400 hover:text-cyan-400 transition"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Facebook */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  className="text-gray-400 hover:text-cyan-400 transition"
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* Twitter */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="https://github.com/MeeksonJr"
                  className="text-gray-400 hover:text-cyan-400 transition"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* GitHub */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/mohamed-datt-b60907296"
                  className="text-gray-400 hover:text-cyan-400 transition"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* LinkedIn */}
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="/blog"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/documentation"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="/roadmap"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Roadmap
                  </a>
                </li>
                <li>
                  <a
                    href="/features"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/terms"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cookies"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/licenses"
                    className="text-gray-400 hover:text-cyan-400 transition"
                  >
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="border-t border-cyan-900/50 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} EduSphere AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
