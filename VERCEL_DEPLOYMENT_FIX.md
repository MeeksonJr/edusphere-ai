# Vercel Deployment Fix - Supabase Environment Variables

## Problem
The application is trying to connect to the old Supabase URL (`avzfoqvnvpyvsxtkparn.supabase.co`) instead of the new one (`qyqbqgubsuxepnloduvd.supabase.co`). This happens because:

1. **Next.js bakes `NEXT_PUBLIC_*` variables into the client bundle at build time**
2. Vercel is using a cached build that was created with the old environment variables
3. Even though you updated the env vars in Vercel, the build cache still has the old values

## Solution

### Step 1: Clear Vercel Build Cache

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Scroll down to **Build & Development Settings**
4. Click **Clear Build Cache** (or similar option)
5. Alternatively, you can trigger a new deployment with cache cleared

### Step 2: Verify Environment Variables in Vercel

Make sure these are set correctly in **Settings** → **Environment Variables**:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://qyq..............`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `ey......cm9......U......`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `sb_......_YS...._...j...`

**Important:** Make sure these are set for **ALL environments** (Production, Preview, Development)

### Step 3: Force a New Deployment

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Check **"Use existing Build Cache"** = **OFF** (unchecked)
5. Click **Redeploy**

**Option B: Via Git**
1. Make a small change to any file (e.g., add a comment)
2. Commit and push to your main branch
3. This will trigger a new build automatically

### Step 4: Verify the Fix

After redeployment:

1. Open your deployed site
2. Open browser DevTools (F12)
3. Check the Console for:
   - ✅ Should see: "Supabase Client Initialization" with the new URL
   - ❌ Should NOT see: Any errors about `avz........rn`
4. Try to sign up/login
5. Check Network tab - all requests should go to `qy.........supabase.co`

## Code Changes Made

I've also fixed the following issues in the code:

1. **`components/supabase-provider.tsx`**:
   - Added debug logging to show which URL is being used
   - Added validation to warn if old URL is detected

2. **`contexts/settings-context.tsx`**:
   - Added null checks for Supabase client
   - Prevents "Cannot read properties of null" errors

## Troubleshooting

If the issue persists after clearing cache:

1. **Double-check environment variables** in Vercel match exactly what's in `.env.local`
2. **Check deployment logs** in Vercel to see what values were used during build
3. **Try a different browser** or clear browser cache (Ctrl+Shift+Delete)
4. **Check if you have multiple Vercel projects** - make sure you're updating the correct one

## Quick Test

After redeployment, you can test by:

1. Opening browser console
2. Running: `console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`
3. Should output: `https://qy..........supabase.co`

If it shows the old URL, the build cache wasn't cleared properly.

