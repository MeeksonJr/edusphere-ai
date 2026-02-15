"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, BookOpen, Code, Palette } from "lucide-react";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeader } from "@/components/shared/SectionHeader";

const presets = [
  { label: "Machine Learning", icon: Sparkles, topic: "Introduction to Machine Learning" },
  { label: "Web Dev 101", icon: Code, topic: "Web Development Fundamentals" },
  { label: "Creative Writing", icon: Palette, topic: "Creative Writing Workshop" },
  { label: "Biology", icon: BookOpen, topic: "Cell Biology for Beginners" },
];

const sampleOutputs: Record<string, string[]> = {
  "Introduction to Machine Learning": [
    "📋 Generating course outline...",
    "",
    "Module 1: What is Machine Learning?",
    "  → Types of ML: Supervised, Unsupervised, Reinforcement",
    "  → Real-world applications and use cases",
    "",
    "Module 2: Data Preprocessing",
    "  → Cleaning and normalizing datasets",
    "  → Feature engineering techniques",
    "",
    "Module 3: Building Your First Model",
    "  → Linear regression step-by-step",
    "  → Training, testing, and validation",
    "",
    "Module 4: Neural Networks",
    "  → Architecture and layers",
    "  → Activation functions explained",
    "",
    "✅ 4 modules • 12 lessons • ~2h 30m estimated",
    "🎙️ Narration: English (Natural)",
    "📹 Format: 16:9 HD Video",
  ],
  default: [
    "📋 Generating course outline...",
    "",
    "Module 1: Introduction & Overview",
    "  → Core concepts and terminology",
    "  → Why this topic matters",
    "",
    "Module 2: Fundamentals",
    "  → Key principles and theories",
    "  → Hands-on examples",
    "",
    "Module 3: Advanced Topics",
    "  → Deep-dive analysis",
    "  → Best practices & patterns",
    "",
    "Module 4: Practical Projects",
    "  → Real-world applications",
    "  → Assessment & certification",
    "",
    "✅ 4 modules • 10 lessons • ~2h estimated",
    "🎙️ Narration: English (Natural)",
    "📹 Format: 16:9 HD Video",
  ],
};

export function InteractiveDemo() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isGenerating || currentLine >= output.length) {
      if (currentLine >= output.length && output.length > 0) {
        setIsGenerating(false);
      }
      return;
    }

    const timer = setTimeout(
      () => setCurrentLine((prev) => prev + 1),
      output[currentLine] === "" ? 200 : Math.random() * 80 + 40
    );

    return () => clearTimeout(timer);
  }, [isGenerating, currentLine, output]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentLine]);

  const handleGenerate = (selectedTopic?: string) => {
    const t = selectedTopic || topic;
    if (!t.trim()) return;

    setTopic(t);
    const lines = sampleOutputs[t] || sampleOutputs.default;
    setOutput(lines);
    setCurrentLine(0);
    setIsGenerating(true);
  };

  return (
    <SectionContainer id="demo" background="gradient">
      <SectionHeader
        badge="Try It Now"
        title="See AI Course Creation"
        titleGradient="In Action"
        subtitle="Enter any topic and watch as AI generates a full course structure in real-time"
      />

      <div className="max-w-3xl mx-auto">
        {/* Preset Topic Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.label}
                onClick={() => handleGenerate(preset.topic)}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface text-sm text-foreground/60 hover:text-foreground/90 hover:border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon className="h-3.5 w-3.5" />
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Or type any topic... (e.g., 'Introduction to Quantum Computing')"
            className="flex-1 h-12 px-4 rounded-xl bg-foreground/[0.04] border border-foreground/10 text-foreground placeholder:text-foreground/25 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm"
            disabled={isGenerating}
          />
          <Button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !topic.trim()}
            className="h-12 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white border-0 disabled:opacity-40 group"
          >
            <Play className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>

        {/* Output Terminal */}
        <div className="glass-surface rounded-xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="text-xs text-foreground/20 font-mono ml-2">edusphere-ai — course-generator</span>
            {isGenerating && (
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400/80 font-mono">Generating...</span>
              </div>
            )}
          </div>

          {/* Terminal body */}
          <div
            ref={outputRef}
            className="p-5 h-[300px] overflow-y-auto font-mono text-sm"
          >
            {output.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-foreground/20">
                <Sparkles className="h-8 w-8 mb-3 text-cyan-500/40" />
                <p>Select a topic or type your own to see the magic</p>
                <p className="text-xs mt-1 text-foreground/10">
                  AI generates a complete course outline in seconds
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {output.slice(0, currentLine).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${line.startsWith("Module")
                        ? "text-cyan-300 font-semibold"
                        : line.startsWith("  →")
                          ? "text-foreground/50 pl-2"
                          : line.startsWith("✅")
                            ? "text-emerald-400 mt-2 font-semibold"
                            : line.startsWith("🎙️") || line.startsWith("📹")
                              ? "text-cyan-300/70"
                              : line.startsWith("📋")
                                ? "text-amber-300/80"
                                : "text-foreground/40"
                      }`}
                  >
                    {line || "\u00A0"}
                  </motion.div>
                ))}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
