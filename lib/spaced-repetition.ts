/**
 * EduSphere AI — SM-2 Spaced Repetition Algorithm
 * 
 * Industry-standard algorithm for optimal flashcard review scheduling.
 * Calculates when each card should be reviewed next based on user performance.
 * 
 * Quality ratings (0-5):
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but upon seeing the answer remembered
 * 2 - Incorrect, but the answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response, instant recall
 */

export interface SM2Card {
    id: string
    easeFactor: number      // EF: 1.3 to 2.5+ (how easy the card is)
    interval: number        // Days until next review
    repetitions: number     // Number of successful reviews in a row
    nextReviewDate: string  // ISO date string
    lastReviewDate?: string
    quality?: number        // Last quality rating
}

export interface SM2Result {
    easeFactor: number
    interval: number
    repetitions: number
    nextReviewDate: string
}

/**
 * Core SM-2 Algorithm
 * 
 * @param card - Current card state
 * @param quality - Quality of response (0-5)
 * @returns Updated card scheduling data
 */
export function calculateSM2(card: SM2Card, quality: number): SM2Result {
    // Clamp quality to valid range
    quality = Math.max(0, Math.min(5, Math.round(quality)))

    let { easeFactor, interval, repetitions } = card

    // If quality < 3, restart the learning process
    if (quality < 3) {
        repetitions = 0
        interval = 1
    } else {
        // Successful recall
        if (repetitions === 0) {
            interval = 1
        } else if (repetitions === 1) {
            interval = 6
        } else {
            interval = Math.round(interval * easeFactor)
        }
        repetitions += 1
    }

    // Update ease factor using SM-2 formula
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    // Ease factor must not go below 1.3
    if (easeFactor < 1.3) easeFactor = 1.3

    // Calculate next review date
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + interval)

    return {
        easeFactor: Math.round(easeFactor * 100) / 100,
        interval,
        repetitions,
        nextReviewDate: nextDate.toISOString(),
    }
}

/**
 * Get cards due for review today
 * Sorted by priority: overdue cards first, then by ease factor (harder first)
 */
export function getDueCards<T extends SM2Card>(cards: T[]): T[] {
    const now = new Date()
    now.setHours(23, 59, 59, 999) // Include all cards due today

    return cards
        .filter(card => {
            if (!card.nextReviewDate) return true // New cards are always due
            return new Date(card.nextReviewDate) <= now
        })
        .sort((a, b) => {
            // Overdue cards first (sorted by how overdue they are)
            const aDate = new Date(a.nextReviewDate || 0)
            const bDate = new Date(b.nextReviewDate || 0)
            if (aDate.getTime() !== bDate.getTime()) {
                return aDate.getTime() - bDate.getTime()
            }
            // Then by ease factor (harder cards first)
            return a.easeFactor - b.easeFactor
        })
}

/**
 * Convert a user's "quick" rating to SM-2 quality
 * Maps intuitive ratings to the 0-5 scale
 */
export function mapUserRatingToQuality(rating: 'again' | 'hard' | 'good' | 'easy'): number {
    switch (rating) {
        case 'again': return 1  // Failed recall
        case 'hard': return 3   // Correct but difficult 
        case 'good': return 4   // Correct with some thought
        case 'easy': return 5   // Instant recall
    }
}

/**
 * Calculate review intervals for display to user
 * Shows what interval each button would give
 */
export function getReviewIntervals(card: SM2Card): Record<string, string> {
    const ratings = ['again', 'hard', 'good', 'easy'] as const
    const result: Record<string, string> = {}

    for (const rating of ratings) {
        const quality = mapUserRatingToQuality(rating)
        const sm2Result = calculateSM2(card, quality)
        result[rating] = formatInterval(sm2Result.interval)
    }

    return result
}

/**
 * Format interval days into human-readable string
 */
export function formatInterval(days: number): string {
    if (days === 0) return 'Now'
    if (days === 1) return '1 day'
    if (days < 7) return `${days} days`
    if (days < 30) {
        const weeks = Math.round(days / 7)
        return `${weeks} week${weeks > 1 ? 's' : ''}`
    }
    if (days < 365) {
        const months = Math.round(days / 30)
        return `${months} month${months > 1 ? 's' : ''}`
    }
    const years = Math.round(days / 365 * 10) / 10
    return `${years} year${years > 1 ? 's' : ''}`
}

/**
 * Create a new SM2 card with default values
 */
export function createNewSM2Card(id: string): SM2Card {
    return {
        id,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date().toISOString(),
    }
}

/**
 * Calculate study stats from a collection of cards
 */
export function getStudyStats(cards: SM2Card[]) {
    const now = new Date()
    now.setHours(23, 59, 59, 999)

    const dueToday = cards.filter(c => new Date(c.nextReviewDate) <= now).length
    const mature = cards.filter(c => c.interval >= 21).length // 3+ weeks
    const young = cards.filter(c => c.interval > 0 && c.interval < 21).length
    const newCards = cards.filter(c => c.repetitions === 0).length
    const averageEase = cards.length > 0
        ? Math.round((cards.reduce((sum, c) => sum + c.easeFactor, 0) / cards.length) * 100) / 100
        : 2.5

    return {
        total: cards.length,
        dueToday,
        mature,
        young,
        new: newCards,
        averageEase,
        retention: cards.length > 0 ? Math.round((mature / cards.length) * 100) : 0,
    }
}
