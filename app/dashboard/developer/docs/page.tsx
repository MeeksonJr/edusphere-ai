"use client"

export const dynamic = "force-dynamic"

import Link from "next/link"
import { ChevronLeft, Copy, CheckCircle } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

const endpoints = [
    {
        method: "GET",
        path: "/api/v1/courses",
        description: "List your courses with pagination",
        scope: "read",
        params: [
            { name: "limit", type: "number", desc: "Max results (1-50, default 10)" },
            { name: "offset", type: "number", desc: "Pagination offset (default 0)" },
        ],
        example: `curl -H "Authorization: Bearer edusphere_YOUR_KEY" \\
  https://edusphere-ai.vercel.app/api/v1/courses?limit=5`,
        response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Intro to Machine Learning",
      "type": "video",
      "status": "completed",
      "estimated_duration": 300,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 5,
    "offset": 0
  }
}`,
    },
    {
        method: "GET",
        path: "/api/v1/flashcards",
        description: "List your flashcard sets",
        scope: "read",
        params: [
            { name: "limit", type: "number", desc: "Max results (1-50, default 10)" },
            { name: "offset", type: "number", desc: "Pagination offset (default 0)" },
        ],
        example: `curl -H "Authorization: Bearer edusphere_YOUR_KEY" \\
  https://edusphere-ai.vercel.app/api/v1/flashcards`,
        response: `{
  "data": [
    {
      "id": "uuid",
      "title": "Biology Vocab",
      "description": "Key terms for chapter 5",
      "subject": "biology",
      "card_count": 25,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { "total": 8, "limit": 10, "offset": 0 }
}`,
    },
    {
        method: "POST",
        path: "/api/v1/ai/generate",
        description: "Generate AI content (requires write scope)",
        scope: "write",
        params: [
            { name: "prompt", type: "string", desc: "Topic or content to generate from (required)" },
            { name: "type", type: "string", desc: "summary | flashcards | quiz | explanation | essay" },
            { name: "maxTokens", type: "number", desc: "Max response length (default 1000, max 2000)" },
        ],
        example: `curl -X POST \\
  -H "Authorization: Bearer edusphere_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Photosynthesis", "type": "flashcards"}' \\
  https://edusphere-ai.vercel.app/api/v1/ai/generate`,
        response: `{
  "type": "flashcards",
  "content": "[{\\"front\\": \\"What is photosynthesis?\\", \\"back\\": \\"...\\"}]",
  "tokens_used": 450
}`,
    },
]

const methodColors: Record<string, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function ApiDocsPage() {
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

    const copyExample = async (example: string, idx: number) => {
        await navigator.clipboard.writeText(example)
        setCopiedIdx(idx)
        setTimeout(() => setCopiedIdx(null), 2000)
    }

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
            <ScrollReveal direction="up">
                <Link
                    href="/dashboard/developer"
                    className="inline-flex items-center text-foreground/70 hover:text-foreground mb-6 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Developer Console
                </Link>

                <h1 className="text-3xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                        API Documentation
                    </span>
                </h1>
                <p className="text-foreground/60 mb-2">
                    All endpoints require an API key via the <code className="text-emerald-400">Authorization</code> header.
                </p>
                <div className="text-sm text-foreground/40 mb-8">
                    Base URL: <code className="text-cyan-400">https://edusphere-ai.vercel.app</code> · Rate limit: <span className="text-foreground/60">100 requests/day</span>
                </div>
            </ScrollReveal>

            {/* Auth Section */}
            <ScrollReveal direction="up" delay={0.05}>
                <GlassSurface className="p-6 mb-6">
                    <h2 className="text-lg font-bold text-foreground mb-3">Authentication</h2>
                    <p className="text-sm text-foreground/60 mb-3">
                        Include your API key in every request using the <code className="text-emerald-400">Authorization</code> header:
                    </p>
                    <pre className="bg-black/30 rounded-lg p-4 text-sm text-foreground/80 font-mono overflow-x-auto">
                        Authorization: Bearer edusphere_YOUR_API_KEY
                    </pre>
                </GlassSurface>
            </ScrollReveal>

            {/* Endpoints */}
            <div className="space-y-6">
                {endpoints.map((ep, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={0.05 * (idx + 2)}>
                        <GlassSurface className="p-6">
                            {/* Method + Path */}
                            <div className="flex items-center gap-3 mb-3">
                                <Badge className={`${methodColors[ep.method]} font-mono text-xs`}>
                                    {ep.method}
                                </Badge>
                                <code className="text-foreground font-mono text-sm">{ep.path}</code>
                                <Badge className="bg-white/10 text-foreground/50 border-white/10 text-xs">
                                    {ep.scope}
                                </Badge>
                            </div>
                            <p className="text-sm text-foreground/60 mb-4">{ep.description}</p>

                            {/* Parameters */}
                            <div className="mb-4">
                                <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wide mb-2">Parameters</h4>
                                <div className="space-y-1">
                                    {ep.params.map((p) => (
                                        <div key={p.name} className="flex gap-3 text-sm py-1">
                                            <code className="text-cyan-400 font-mono min-w-[100px]">{p.name}</code>
                                            <span className="text-foreground/30 text-xs mt-0.5">{p.type}</span>
                                            <span className="text-foreground/60">{p.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Example */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wide">Example</h4>
                                    <Button
                                        onClick={() => copyExample(ep.example, idx)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-foreground/40 hover:text-foreground"
                                    >
                                        {copiedIdx === idx ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                    </Button>
                                </div>
                                <pre className="bg-black/30 rounded-lg p-3 text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                                    {ep.example}
                                </pre>
                            </div>

                            {/* Response */}
                            <div>
                                <h4 className="text-xs font-semibold text-foreground/40 uppercase tracking-wide mb-2">Response</h4>
                                <pre className="bg-black/30 rounded-lg p-3 text-xs text-foreground/70 font-mono overflow-x-auto whitespace-pre-wrap">
                                    {ep.response}
                                </pre>
                            </div>
                        </GlassSurface>
                    </ScrollReveal>
                ))}
            </div>

            {/* Error codes */}
            <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6 mt-6">
                    <h2 className="text-lg font-bold text-foreground mb-3">Error Codes</h2>
                    <div className="space-y-2 text-sm">
                        {[
                            { code: 401, desc: "Invalid or missing API key" },
                            { code: 403, desc: "Insufficient scope (e.g., write required)" },
                            { code: 429, desc: "Rate limit exceeded (100 req/day)" },
                            { code: 500, desc: "Internal server error" },
                        ].map((e) => (
                            <div key={e.code} className="flex gap-3 py-1">
                                <code className="text-red-400 font-mono min-w-[40px]">{e.code}</code>
                                <span className="text-foreground/60">{e.desc}</span>
                            </div>
                        ))}
                    </div>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
