"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Play } from "lucide-react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlassSurface } from "@/components/shared/GlassSurface";

// Dynamic import for Remotion Player to avoid SSR issues
// Note: @remotion/player needs to be installed first
// Run: pnpm add @remotion/player remotion
let Player: any = null;

if (typeof window !== "undefined") {
  try {
    const remotionPlayer = require("@remotion/player");
    Player = remotionPlayer.Player;
  } catch (e) {
    // Player not installed yet - will use placeholder
    console.log("Remotion Player not installed. Install with: pnpm add @remotion/player remotion");
  }
}

function DemoPlaceholder() {
  return (
    <div className="aspect-video w-full glass-surface rounded-xl flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-pulse" />
        <p className="text-white/60">Loading demo...</p>
      </div>
    </div>
  );
}

export function InteractiveDemo() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    // Simulate generation delay (in real app, this would call an API)
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <section id="demo" className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Try It Now
                </span>
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Enter any topic and see a preview video generated instantly
              </p>
            </div>
          </ScrollReveal>

          {/* Demo Container */}
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-6 md:p-8 lg:p-12">
              {/* Input Section */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Enter a topic... (e.g., 'Introduction to Quantum Computing')"
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setHasGenerated(false);
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 glass-surface border-white/20 text-white placeholder:text-white/40 h-14 text-lg"
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 h-14"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Generate Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Video Player Section */}
              <div className="relative">
                {hasGenerated ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {Player ? (
                      <div className="aspect-video w-full glass-surface rounded-xl overflow-hidden border-2 border-purple-500/30">
                        <Player
                          component={() => (
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background:
                                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "2rem",
                                fontWeight: "bold",
                              }}
                            >
                              Demo Video: {topic}
                            </div>
                          )}
                          durationInFrames={300}
                          compositionWidth={1920}
                          compositionHeight={1080}
                          fps={30}
                          controls
                          loop={false}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full glass-surface rounded-xl overflow-hidden border-2 border-purple-500/30 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="w-32 h-32 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="h-16 w-16 text-white animate-pulse" />
                          </div>
                          <p className="text-white text-lg font-semibold mb-2">
                            Preview: {topic}
                          </p>
                          <p className="text-white/60 text-sm mb-4">
                            Video would play here once Remotion Player is installed
                          </p>
                          <p className="text-white/40 text-xs">
                            Install with: pnpm add @remotion/player remotion
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="aspect-video w-full glass-surface rounded-xl flex items-center justify-center border-2 border-dashed border-white/20">
                    <div className="text-center p-8">
                      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                      <p className="text-white/60 text-lg mb-2">
                        Enter a topic above to generate a preview
                      </p>
                      <p className="text-white/40 text-sm">
                        Watch as AI creates a professional course video in seconds
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              {hasGenerated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 glass-surface p-4 rounded-lg border border-purple-500/30"
                >
                  <p className="text-sm text-white/70 text-center">
                    <span className="text-purple-400 font-semibold">✨ Preview Generated!</span>{" "}
                    This is a browser-based demo. In the full version, you can edit, add narration, and export as MP4.
                  </p>
                </motion.div>
              )}
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

