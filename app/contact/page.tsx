"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/components/supabase-provider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
                  <MessageSquare className="h-10 w-10 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                  <span className="text-foreground">Get in</span>{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                    Touch
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Have a question? We'd love to hear from you. Send us a message
                  and we'll respond as soon as possible.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-24 relative z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                        <div className="p-6 flex items-start space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} p-3 flex-shrink-0 shadow-lg`}
                          >
                            <Icon className="h-full w-full text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {method.title}
                            </h3>
                            {method.link ? (
                              <a
                                href={method.link}
                                className="text-foreground/70 hover:text-cyan-400 transition-colors block"
                              >
                                {method.value}
                              </a>
                            ) : (
                              <p className="text-foreground/70">{method.value}</p>
                            )}
                          </div>
                        </div>
                      </AnimatedCard>
                    </ScrollReveal>
                  );
                })}
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <ScrollReveal direction="up" delay={0.2}>
                  <GlassSurface className="p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-foreground mb-8">
                        Send us a Message
                      </h2>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name" className="text-foreground mb-2 block font-medium">
                              Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 h-12"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-foreground mb-2 block font-medium">
                              Email
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              className="glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 h-12"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="subject" className="text-foreground mb-2 block font-medium">
                            Subject
                          </Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 h-12"
                            placeholder="What's this about?"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message" className="text-foreground mb-2 block font-medium">
                            Message
                          </Label>
                          <Textarea
                            id="message"
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                            className="glass-surface border-foreground/20 text-foreground placeholder:text-foreground/40 resize-none min-h-[150px]"
                            placeholder="Tell us more about your inquiry..."
                          />
                        </div>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-6 shadow-lg shadow-cyan-500/20"
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
                    </div>
                  </GlassSurface>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
