"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { Marquee } from "@/components/shared/Marquee";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    image: "/avatars/sarah.png",
    quote:
      "EduSphere AI transformed how I create courses. What used to take weeks now takes minutes. The quality is incredible!",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "University Professor",
    image: "/avatars/michael.png",
    quote:
      "As someone who's not tech-savvy, I was amazed at how easy it is to create professional video courses. The AI narration is outstanding.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Corporate Trainer",
    image: "/avatars/emily.png",
    quote:
      "The ability to customize styles and export to different formats saved me so much time. My team loves the results!",
    rating: 5,
  },
  {
    name: "James Park",
    role: "Online Educator",
    image: "/avatars/james.png",
    quote:
      "I've tried every course creation tool out there. EduSphere AI is the only one that actually delivers on the promise of AI-powered content.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Learning Designer",
    image: "/avatars/aisha.png",
    quote:
      "The fact that I can go from a topic idea to a fully narrated video course in under an hour is absolutely game-changing.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Startup Founder",
    image: "/avatars/david.png",
    quote:
      "We use EduSphere to onboard new employees. The courses are professional, consistent, and our team actually enjoys watching them.",
    rating: 5,
  },
];

const stats = [
  { value: 10000, suffix: "+", label: "Courses Created" },
  { value: 5000, suffix: "+", label: "Active Users" },
  { value: 4.9, suffix: "", label: "Avg Rating", isDecimal: true },
  { value: 2000000, suffix: "+", label: "Total Views" },
];

export function SocialProof() {
  return (
    <SectionContainer background="subtle">
      <SectionHeader
        badge="Loved by Creators"
        title="Trusted by"
        titleGradient="Educators Worldwide"
        subtitle="Join thousands of educators, creators, and professionals who create amazing courses with AI"
      />

      {/* Stats Row */}
      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card p-6 text-center group hover:border-cyan-500/20 transition-all"
            >
              <div className="text-3xl md:text-4xl font-bold font-display text-foreground mb-1">
                {stat.isDecimal ? (
                  <span>{stat.value}<span className="text-cyan-400">/5</span></span>
                ) : (
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                  />
                )}
              </div>
              <div className="text-sm text-foreground/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Testimonial Marquee */}
      <Marquee speed={50} pauseOnHover>
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="glass-card p-6 w-[350px] shrink-0 group hover:border-foreground/10 transition-all"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-sm text-foreground/60 leading-relaxed mb-4 line-clamp-4">
              &ldquo;{t.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <Image
                src={t.image}
                alt={t.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {t.name}
                </div>
                <div className="text-xs text-foreground/40">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </SectionContainer>
  );
}
