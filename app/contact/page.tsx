"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/components/supabase-provider";
import { useRouter } from "next/navigation";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    value: "support@edusphere.ai",
    link: "mailto:support@edusphere.ai",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (555) 123-4567",
    link: "tel:+15551234567",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "123 Education St, Tech City",
    link: null,
    gradient: "from-cyan-500 to-pink-500",
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Store in database if we have one
      if (user) {
        await supabase.from("contact_messages").insert([
          {
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            status: "new",
          },
        ]);
      }

      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you within 24 hours.",
      });

      // Redirect to thank you page
      router.push("/thank-you?type=contact");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="pt-20 lg:pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-background to-background" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 mb-6">
                  <MessageSquare className="h-8 w-8 text-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-foreground">Get in</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Touch
                  </span>
                </h1>
                <p className="text-xl text-foreground/70">
                  Have a question? We'd love to hear from you. Send us a message 
                  and we'll respond as soon as possible.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-6">
              <ScrollReveal direction="up">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Contact Information
                </h2>
              </ScrollReveal>
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <ScrollReveal
                    key={method.title}
                    direction="up"
                    delay={0.1 * index}
                  >
                    <AnimatedCard variant="3d" delay={0.1 * index}>
                      <div className="p-6">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} p-3 mb-4`}
                        >
                          <Icon className="h-full w-full text-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {method.title}
                        </h3>
                        {method.link ? (
                          <a
                            href={method.link}
                            className="text-foreground/70 hover:text-cyan-400 transition-colors"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="text-foreground/70">{method.value}</p>
                        )}
                      </div>
                    </AnimatedCard>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-8 md:p-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-foreground mb-2 block">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-foreground mb-2 block">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-foreground mb-2 block">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                        placeholder="What's this about?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-foreground mb-2 block">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40 resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-foreground"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
