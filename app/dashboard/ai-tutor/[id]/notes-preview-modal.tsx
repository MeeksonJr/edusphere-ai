'use client'

import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink } from 'lucide-react'

interface NotesPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    content: string
    resourcePageLink: string
}

export function NotesPreviewModal({
    open,
    onOpenChange,
    title,
    content,
    resourcePageLink,
}: NotesPreviewModalProps) {
    if (!content) return null

    // Simple Markdown rendering (headings, bold, bullets, code)
    const renderMarkdown = (md: string) => {
        return md.split('\n').map((line, i) => {
            const trimmed = line.trimStart()

            // Heading levels
            if (trimmed.startsWith('### ')) {
                return <h4 key={i} className="text-xs font-bold text-foreground/80 mt-4 mb-1">{trimmed.slice(4)}</h4>
            }
            if (trimmed.startsWith('## ')) {
                return <h3 key={i} className="text-sm font-bold text-foreground/80 mt-4 mb-1">{trimmed.slice(3)}</h3>
            }
            if (trimmed.startsWith('# ')) {
                return <h2 key={i} className="text-base font-bold text-foreground mt-2 mb-2">{trimmed.slice(2)}</h2>
            }

            // Bullet points
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const depth = line.length - line.trimStart().length
                return (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/60" style={{ paddingLeft: `${depth * 4 + 8}px` }}>
                        <span className="text-cyan-400 mt-0.5 flex-shrink-0">•</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
                    </div>
                )
            }

            // Numbered items
            const numMatch = trimmed.match(/^(\d+)\.\s/)
            if (numMatch) {
                return (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/60 pl-2">
                        <span className="text-cyan-400 mt-0.5 flex-shrink-0 font-mono">{numMatch[1]}.</span>
                        <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(numMatch[0].length)) }} />
                    </div>
                )
            }

            // Empty line = spacer
            if (trimmed === '') return <div key={i} className="h-1.5" />

            // Regular paragraph
            return <p key={i} className="text-xs text-foreground/60 pl-1" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        })
    }

    // Inline formatting: **bold**, `code`, *italic*
    const formatInline = (text: string) => {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground/80">$1</strong>')
            .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-foreground/5 text-cyan-400 text-[11px]">$1</code>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-2xl border-white/10 max-h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-400" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        AI-generated study notes from your session
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable notes content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-0.5 min-h-0">
                    {renderMarkdown(content)}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex items-center justify-end pt-3 border-t border-foreground/5">
                    <Link href={resourcePageLink}>
                        <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 gap-1">
                            <ExternalLink className="h-3 w-3" /> View in Resources
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}
