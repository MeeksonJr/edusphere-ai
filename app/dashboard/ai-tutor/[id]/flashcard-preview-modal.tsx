'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Layers, ArrowLeft, ArrowRight, RotateCcw, ExternalLink, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface FlashcardPreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cards: { question: string; answer: string }[]
    title: string
    flashcardPageLink: string
}

export function FlashcardPreviewModal({
    open,
    onOpenChange,
    cards,
    title,
    flashcardPageLink,
}: FlashcardPreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [flipped, setFlipped] = useState(false)

    if (cards.length === 0) return null

    const card = cards[currentIndex]

    const goNext = () => {
        setFlipped(false)
        setCurrentIndex(prev => Math.min(prev + 1, cards.length - 1))
    }

    const goPrev = () => {
        setFlipped(false)
        setCurrentIndex(prev => Math.max(prev - 1, 0))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-2xl border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-400" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {cards.length} cards — Click card to flip
                    </DialogDescription>
                </DialogHeader>

                {/* Card counter */}
                <div className="flex items-center justify-between text-xs text-foreground/40 mb-1">
                    <span>Card {currentIndex + 1} of {cards.length}</span>
                    <button onClick={() => setFlipped(false)} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Reset
                    </button>
                </div>

                {/* Flashcard */}
                <div
                    onClick={() => setFlipped(!flipped)}
                    className="relative cursor-pointer min-h-[200px] perspective-1000"
                    style={{ perspective: '1000px' }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentIndex}-${flipped}`}
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: -90, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className={`rounded-xl border p-6 min-h-[200px] flex flex-col items-center justify-center text-center ${flipped
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-purple-500/5 border-purple-500/20'
                                }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${flipped ? 'text-emerald-400' : 'text-purple-400'
                                }`}>
                                {flipped ? '✅ Answer' : '❓ Question'}
                            </span>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {flipped ? card.answer : card.question}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1">
                    {cards.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setCurrentIndex(i); setFlipped(false) }}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentIndex
                                    ? 'bg-purple-400 scale-125'
                                    : 'bg-foreground/10 hover:bg-foreground/20'
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="text-foreground/50"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Prev
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goNext}
                            disabled={currentIndex === cards.length - 1}
                            className="text-foreground/50"
                        >
                            Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                    <Link href={flashcardPageLink}>
                        <Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 gap-1">
                            <ExternalLink className="h-3 w-3" /> View in Flashcards
                        </Button>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}
