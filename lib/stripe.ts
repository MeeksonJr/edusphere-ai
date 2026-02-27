import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
})

// Stripe Price IDs for each subscription tier
export const STRIPE_PRICES = {
    student: "price_1T4qEsJzOvokj1Rm2J6zDh0T",
    pro: "price_1T4qEtJzOvokj1Rm2AQTtv5i",
    family: "price_1T4qEtJzOvokj1RmCnCKxytw",
} as const

// Map Stripe product IDs to tier names
export const PRODUCT_TO_TIER: Record<string, string> = {
    prod_U2w7ZgOW0IvOSE: "student",
    prod_U2w7TuLwMBaXc5: "pro",
    prod_U2w7k8sf6B7U7Y: "family",
}

// Tier feature limits
export const TIER_LIMITS = {
    free: {
        aiRequestsPerDay: 5,
        maxCourses: 3,
        calendarSync: false,
        videoNarration: false,
        podcastGeneration: false,
        apiAccess: false,
        apiCallsPerDay: 0,
        marketplaceSelling: false,
        childAccounts: 0,
    },
    student: {
        aiRequestsPerDay: Infinity,
        maxCourses: 20,
        calendarSync: true,
        videoNarration: false,
        podcastGeneration: true,
        apiAccess: false,
        apiCallsPerDay: 0,
        marketplaceSelling: false,
        childAccounts: 0,
    },
    pro: {
        aiRequestsPerDay: Infinity,
        maxCourses: Infinity,
        calendarSync: true,
        videoNarration: true,
        podcastGeneration: true,
        apiAccess: true,
        apiCallsPerDay: 100,
        marketplaceSelling: true,
        childAccounts: 0,
    },
    family: {
        aiRequestsPerDay: Infinity,
        maxCourses: Infinity,
        calendarSync: true,
        videoNarration: true,
        podcastGeneration: true,
        apiAccess: true,
        apiCallsPerDay: 100,
        marketplaceSelling: true,
        childAccounts: 5,
    },
} as const

export type SubscriptionTier = keyof typeof TIER_LIMITS

export function getTierLimits(tier: string) {
    return TIER_LIMITS[tier as SubscriptionTier] || TIER_LIMITS.free
}
