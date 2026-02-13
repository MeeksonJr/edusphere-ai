# 🎬 Course & Video Generation Workflow

> **⚠️ Important Note:** This project uses **pnpm** as the package manager for all installations and dependency management. Always use `pnpm` instead of `npm` or `yarn`.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Technical Stack](#technical-stack)
3. [Workflow Pipeline](#workflow-pipeline)
4. [Implementation Details](#implementation-details)
5. [Advanced Features](#advanced-features)
6. [Performance Optimizations](#performance-optimizations)
7. [Error Handling & Monitoring](#error-handling--monitoring)
8. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This document outlines the complete workflow for generating AI-powered educational courses with programmatic video rendering. The system transforms user prompts into fully narrated, captioned, and animated video courses using a multi-stage pipeline that leverages AI, cloud storage, and video rendering technologies.

**Key Capabilities:**
- AI-generated course layouts and content structures
- Automated slide creation with HTML/Tailwind CSS templates
- Text-to-speech voiceover synthesis
- Automatic captioning with timestamp synchronization
- Programmatic video rendering and composition
- Real-time preview and editing capabilities

---

## 🛠 Technical Stack

### Core Technologies
- **Framework:** Next.js 15+ (App Router)
- **Video Engine:** [Remotion](https://www.remotion.dev/docs/) (`@remotion/player`, `@remotion/lambda`)
- **Database & Auth:** Supabase (PostgreSQL, Authentication)
- **Storage:** Supabase Storage (S3-compatible buckets)
- **Package Manager:** pnpm

### AI & ML Services
- **Layout Generation:** Google Gemini 1.5 Flash / Hugging Face Inference
- **Text-to-Speech:** Google Cloud Text-to-Speech API
- **Transcription & Captioning:** Replicate (Whisper models) / Google Speech-to-Text
- **Content Enhancement:** Gemini / Hugging Face for slide content generation

### Infrastructure
- **Frontend Deployment:** Vercel (Next.js App Router)
- **Database & Storage:** Supabase (PostgreSQL, Authentication, Storage buckets)
- **Rendering Options:**
  - **Option 1 (Recommended):** Node.js renderer on Railway/Render/Fly.io (no AWS needed)
  - **Option 2 (Advanced):** Remotion Lambda (AWS) for high-scale parallel rendering
  - **Option 3 (MVP):** Browser-only with Remotion Player (no server rendering)
- **Note:** Vercel and Supabase Edge Functions have timeout limits unsuitable for video rendering (10-60 seconds max). Use a dedicated render service for production rendering.

---

## 🔄 Workflow Pipeline

### Stage 1: User Input & Layout Generation

**Process Flow:**
1. **User Authentication:** Verify user is logged in via Supabase Auth
2. **Input Collection:** 
   - User enters a **topic prompt** (e.g., "Introduction to Quantum Computing")
   - User selects **course type**:
     - `full-course`: Comprehensive multi-chapter course (5-20 chapters)
     - `quick-explainer`: Single-topic focused video (1-3 chapters)
     - `tutorial-series`: Step-by-step instructional content
   - Optional: User selects **style preset**:
     - Corporate / Professional
     - Educational Minimalist
     - Cinematic / Storytelling
     - Modern Tech

3. **AI Layout Generation:**
   - Send prompt to Gemini API with structured system prompt
   - AI generates comprehensive **CourseLayout JSON**:
   ```json
   {
     "courseId": "uuid",
     "title": "Course Title",
     "type": "full-course",
     "style": "professional",
     "estimatedDuration": 1200,
     "chapters": [
       {
         "chapterId": "uuid",
         "title": "Chapter Title",
         "order": 1,
         "slides": [
           {
             "slideId": "uuid",
             "type": "title-slide" | "content-slide" | "transition-slide",
             "content": {
               "title": "Slide Title",
               "body": "Slide content in markdown format",
               "visualElements": ["bullet-list", "diagram", "code-block"]
             },
             "narrationScript": "Full narration text for this slide",
             "estimatedDuration": 45
           }
         ]
       }
     ]
   }
   ```

4. **Database Storage:**
   - Save course layout to Supabase `courses` table
   - Status: `pending` → `processing`
   - Store user_id, created_at, metadata

**Improvements:**
- **Recursive Detail Generation:** Generate high-level syllabus first, then recursively expand each chapter to avoid token limits
- **Validation Schema:** Use Zod to validate AI-generated JSON before saving
- **Draft Mode:** Allow users to save incomplete layouts as drafts
- **Template Library:** Pre-defined templates for common course types (science, business, tech)

---

### Stage 2: Content & Narration Development

**Parallel Processing Architecture:**
For each chapter, the system performs multiple concurrent AI tasks using Supabase Edge Functions or Next.js API routes.

#### 2.1 Slide Creation

**Process:**
1. **Component Registry:** AI selects from pre-designed React/Remotion components:
   - `BulletListSlide` - Bullet point presentations
   - `ComparisonTableSlide` - Side-by-side comparisons
   - `CodeBlockSlide` - Syntax-highlighted code examples
   - `TitleSlide` - Chapter/section introductions
   - `ImageSlide` - Image-focused content
   - `TimelineSlide` - Sequential process flows
   - `QuoteSlide` - Highlighted quotes or key points

2. **Template Generation:**
   - Convert AI descriptions into HTML/Tailwind CSS templates
   - Apply selected style preset (colors, fonts, spacing)
   - Inject user branding (logo, color scheme from profile)
   - Generate responsive layouts for different video dimensions

3. **Animation Definition:**
   - Define entrance/exit animations per slide type
   - Set transition timings aligned with narration pace
   - Configure text reveal animations (word-by-word, line-by-line)

4. **Storage:**
   - Save slide templates to Supabase `course_slides` table
   - Reference: course_id, chapter_id, slide_id
   - Store Tailwind classes, animation configs, content

**Enhancements:**
- **Dynamic Theming:** AI generates color palette based on topic (e.g., biology → green/earth tones)
- **Image Generation:** Integrate with Hugging Face FLUX or Stability AI for custom slide backgrounds
- **Brand Kit Injection:** User-defined colors/logos applied before rendering
- **Responsive Templates:** Ensure slides work across 16:9, 9:16, 1:1 aspect ratios

#### 2.2 Voiceover Synthesis

**Process:**
1. **Script Preparation:**
   - Extract narration scripts from course layout
   - Segment by slide (each slide has its own audio clip)
   - Apply SSML enhancements for pronunciation, pauses, emphasis

2. **Google Cloud TTS API:**
   ```typescript
   // Example implementation
   const ttsClient = new textToSpeech.TextToSpeechClient();
   
   const request = {
     input: { text: narrationScript },
     voice: {
       languageCode: 'en-US',
       name: 'en-US-Neural2-D', // or user-selected voice
       ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE'
     },
     audioConfig: {
       audioEncoding: 'MP3',
       speakingRate: 1.0, // Adjustable (0.25 - 4.0)
       pitch: 0.0, // Adjustable (-20.0 to 20.0)
       volumeGainDb: 0.0
     }
   };
   
   const [response] = await ttsClient.synthesizeSpeech(request);
   ```

3. **Audio Processing:**
   - Convert response to MP3 format
   - Normalize audio levels
   - Add subtle fade-in/fade-out
   - Calculate exact duration

4. **Storage:**
   - Upload MP3 files to Supabase Storage bucket
   - Path structure: `/courses/{course_id}/chapters/{chapter_id}/narration_{slide_id}.mp3`
   - Generate public URL for Remotion player
   - Store metadata (duration, file_size, voice_used) in database

**Optimizations:**
- **Batch Processing:** Generate multiple audio files concurrently
- **Voice Selection:** Allow users to choose from multiple voices (professional, friendly, authoritative)
- **Emotional Tone:** Adjust speaking rate and pitch based on content type (excited vs. serious)
- **Caching:** Reuse audio if same script appears in multiple courses

#### 2.3 Media Storage Management

**Structure:**
```
supabase-storage/
├── courses/
│   ├── {course_id}/
│   │   ├── chapters/
│   │   │   ├── {chapter_id}/
│   │   │   │   ├── narration_*.mp3
│   │   │   │   ├── slides/
│   │   │   │   │   ├── {slide_id}.json
│   │   │   │   │   └── assets/
│   │   │   │   │       ├── images/
│   │   │   │   │       └── animations/
│   │   ├── renders/
│   │   │   ├── preview_*.mp4
│   │   │   └── final_{course_id}.mp4
│   │   └── captions/
│   │       └── {chapter_id}_captions.json
```

**Access Control:**
- Private bucket with Row Level Security (RLS)
- Generate signed URLs for temporary access during rendering
- Public URLs only for final rendered videos (user-controlled)

---

### Stage 3: Captioning & Synchronization

**Process Flow:**
1. **Audio Transcription:**
   - For each audio file, use Replicate Whisper or Google Speech-to-Text
   - Generate word-level timestamps (not just sentence-level)
   ```json
   {
     "segments": [
       {
         "id": 0,
         "start": 0.0,
         "end": 2.5,
         "text": "Welcome to this course",
         "words": [
           {"word": "Welcome", "start": 0.0, "end": 0.5},
           {"word": "to", "start": 0.6, "end": 0.7},
           {"word": "this", "start": 0.8, "end": 1.0},
           {"word": "course", "start": 1.1, "end": 2.5}
         ]
       }
     ]
   }
   ```

2. **Timestamp Normalization:**
   - Compare total audio duration with last timestamp
   - Apply "Jitter Fix" algorithm to correct drift
   - Ensure all timestamps align with actual audio

3. **Caption Format Conversion:**
   - Convert to Remotion-compatible caption format
   - Use `@remotion/captions` package structure
   - Generate SRT/WebVTT files for accessibility

4. **Synchronization with Slides:**
   - Map captions to slide transitions
   - Ensure caption appears when corresponding slide is visible
   - Handle overlapping captions for smooth transitions

**Advanced Features:**
- **Active Word Highlighting:** TikTok-style word-by-word highlighting
- **Multi-Language Support:** Generate captions in multiple languages
- **Accessibility Options:** Font size, color contrast, positioning controls
- **Smart Caption Positioning:** Avoid overlapping with important visual elements

---

### Stage 4: Programmatic Video Rendering

**Architecture Options:**
- **Development/Preview:** Remotion Player (browser-based) - No server needed
- **Production Rendering:** Multiple options available (see below)

#### 4.1 Local Preview with Remotion Player

**Setup:**
```typescript
import { Player } from '@remotion/player';
import { CourseVideo } from './components/CourseVideo';

<Player
  component={CourseVideo}
  durationInFrames={totalFrames}
  compositionWidth={1920}
  compositionHeight={1080}
  fps={30}
  controls
  loop={false}
/>
```

**Features:**
- Real-time preview during editing
- Hot reload when content changes
- Timeline scrubbing
- Frame-accurate navigation

#### 4.2 Production Rendering Options

> **⚡ Important:** AWS Lambda is **NOT required**. You have multiple rendering options based on your needs and constraints.

##### Option A: Node.js Renderer (Recommended for Vercel/Supabase Setup)

**Best For:** Projects deployed on Vercel without AWS access, MVP/development phase, avoiding credit card requirements.

**Setup:**
1. **Render Service:** Create a separate render service on a platform that supports long-running Node.js processes:
   - **Railway** (railway.app) - Simple, pay-as-you-go, accepts credit cards or PayPal
   - **Render** (render.com) - Free tier available, supports background workers
   - **Fly.io** (fly.io) - Generous free tier
   - **DigitalOcean App Platform** - Simple VPS option

2. **API Route:** Create a render API endpoint that triggers the external service:
   ```typescript
   // app/api/render/route.ts
   import { renderMedia } from '@remotion/renderer';
   import path from 'path';
   import { createClient } from '@supabase/supabase-js';
   
   export async function POST(request: Request) {
     const { courseId } = await request.json();
     
     // Fetch course data from Supabase
     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );
     
     const { data: course } = await supabase
       .from('courses')
       .select('*')
       .eq('id', courseId)
       .single();
     
     // Render video
     const outputPath = path.join('/tmp', `course-${courseId}.mp4`);
     
     await renderMedia({
       composition: {
         id: 'CourseVideo',
         width: 1920,
         height: 1080,
         fps: 30,
         durationInFrames: course.estimated_duration * 30,
       },
       serveUrl: process.env.REMOTION_SERVE_URL!, // Your Remotion bundle URL
       codec: 'h264',
       outputLocation: outputPath,
       inputProps: {
         courseId: courseId,
         chapters: course.layout.chapters,
       },
       onProgress: ({ renderedFrames, encodedFrames }) => {
         // Update progress in Supabase
         const progress = Math.round((encodedFrames / (course.estimated_duration * 30)) * 100);
         supabase
           .from('render_jobs')
           .update({ progress })
           .eq('course_id', courseId);
       }
     });
     
     // Upload to Supabase Storage
     const { data: videoBuffer } = await fs.readFile(outputPath);
     const { data: uploadData } = await supabase.storage
       .from('course-videos')
       .upload(`courses/${courseId}/final.mp4`, videoBuffer, {
         contentType: 'video/mp4',
         upsert: true
       });
     
     // Update course with final video URL
     const { data: { publicUrl } } = supabase.storage
       .from('course-videos')
       .getPublicUrl(`courses/${courseId}/final.mp4`);
     
     await supabase
       .from('courses')
       .update({ final_video_url: publicUrl, status: 'completed' })
       .eq('id', courseId);
     
     return Response.json({ success: true, videoUrl: publicUrl });
   }
   ```

**Pros:**
- ✅ No AWS account needed
- ✅ No credit card required (depending on platform choice)
- ✅ Works perfectly with Vercel + Supabase
- ✅ More control over rendering process
- ✅ Can use cheaper alternatives (Railway, Render free tier)

**Cons:**
- ❌ Slower than AWS Lambda (single process vs. parallel)
- ❌ Requires separate service for rendering (can't use Vercel serverless)

##### Option B: AWS Lambda (For Production Scale)

**Best For:** Production apps requiring fast, parallel rendering, high traffic.

**AWS Requirements:**
- ⚠️ **Credit card required** for AWS account (even for Free Tier)
- ⚠️ **Free Tier:** 1M requests/month, 400K GB-seconds compute
- ⚠️ Video rendering is compute-intensive and may exceed free tier quickly

**Setup:**
1. **AWS Account:** Sign up at aws.amazon.com (requires credit card)
2. **Lambda Function:** Deploy Remotion Lambda function
3. **Trigger from Vercel:** Use API route to trigger Lambda render:
   ```typescript
   import { renderMediaOnLambda } from '@remotion/lambda';
   
   const renderId = await renderMediaOnLambda({
     region: 'us-east-1',
     functionName: 'remotion-render',
     composition: 'CourseVideo',
     inputProps: { courseId, chapters, style },
     codec: 'h264',
     imageFormat: 'jpeg',
     framesPerLambda: 120,
     s3OutputProvider: {
       region: 'us-east-1',
       bucketName: 'your-bucket',
       key: `courses/${courseId}/final.mp4`
     }
   });
   ```

**Pros:**
- ✅ Fast parallel rendering (100+ videos simultaneously)
- ✅ Auto-scaling
- ✅ Pay-per-render pricing

**Cons:**
- ❌ Requires credit card
- ❌ More complex setup
- ❌ AWS account management overhead

##### Option C: Browser-Only (Remotion Player) - For MVP

**Best For:** MVP, demos, development, avoiding server rendering costs entirely.

**Implementation:**
- Use `@remotion/player` only - videos play in browser
- No server-side rendering needed
- Users can export/screen record if they want MP4 files

**When to use:**
- Early development phase
- Proof of concept
- Low-budget MVP
- Interactive previews only

**Progress Tracking (All Options):**
- Update database with render status (queued → rendering → completed)
- Store progress percentage in `render_jobs` table
- Handle errors and retries
- Send notification to user when complete

**Completion (All Options):**
- Final video URL stored in database
- Update course status to `completed`
- Send notification to user
- Generate thumbnail from first frame

**Calculations:**
- **Total Duration:** Sum of all audio clip durations + transition times
- **Frame Count:** `duration * fps` (e.g., 1200 seconds * 30 fps = 36,000 frames)
- **Render Time:** 
  - Node.js Renderer: ~1-5 minutes per video (depending on server specs)
  - AWS Lambda: ~30 seconds - 2 minutes (parallel processing)
  - Browser: Real-time playback only

**Advanced Rendering Features (All Options):**
- **Dynamic Watermarking:** Inject user logo/watermark during render
- **Multi-Format Export:** Generate 16:9 (YouTube), 9:16 (TikTok), 1:1 (Instagram)
- **Resolution Options:** 1080p, 1440p, 4K based on subscription tier
- **Batch Rendering:** Queue multiple courses for efficient processing

---

## 🚀 Implementation Details

### ⚡ MVP Strategy: Browser-Only Rendering (Option C)

**Current Implementation:** Browser-Only with Remotion Player

**Why This Approach for MVP:**
- ✅ **Zero Infrastructure Costs** - No AWS, no render services needed
- ✅ **Fastest to Implement** - No server-side rendering complexity
- ✅ **Perfect for Demo/POC** - Interactive previews work immediately
- ✅ **No Credit Card Required** - Works entirely in browser
- ✅ **Vercel + Supabase** - Use existing infrastructure for frontend and data

**How It Works:**
1. Users create courses in the browser
2. Remotion Player renders video in real-time (client-side)
3. Videos play interactively in the browser
4. Course data stored in Supabase
5. Users can preview, edit, and share browser-based videos
6. (Future) Server-side rendering for MP4 export when needed

**Limitations (MVP Phase):**
- ❌ No MP4 file export (users can screen record if needed)
- ❌ Requires modern browser with good performance
- ❌ Limited to client-side rendering

**Migration Path (Later):**
When ready for production MP4 exports:
- Add `@remotion/renderer` for server-side rendering
- Use Railway/Render/Fly.io for render service
- Or upgrade to AWS Lambda for high-scale parallel rendering

**MVP Setup:**
```
Frontend (Vercel) + Remotion Player (Browser) → Supabase (Data/Storage)
```

---

### Remotion Setup with Next.js (Brownfield Integration)

> **📚 Reference:** [Installing Remotion in an existing project](https://www.remotion.dev/docs/brownfield)

**Installation:**
```bash
# Core Remotion packages (Required)
pnpm add remotion @remotion/cli

# For embedding Remotion videos in your React app (Required for preview/editing)
pnpm add @remotion/player

# For server-side rendering (Required for production rendering)
# Use this if you're NOT using AWS Lambda
pnpm add @remotion/renderer

# For triggering renders on Remotion Lambda (AWS) - OPTIONAL
# Only install if you plan to use AWS Lambda for rendering
# Requires AWS account with credit card
pnpm add @remotion/lambda

# ESLint plugin (optional but recommended)
pnpm add -D @remotion/eslint-plugin
```

> **💡 Recommendation for Vercel/Supabase Setup:** 
> - Start with `@remotion/renderer` (Node.js renderer) - **No AWS needed**
> - Use a separate render service (Railway, Render, Fly.io) that supports long-running processes
> - Vercel handles your Next.js frontend
> - Supabase handles database, auth, and video storage
> - Only add `@remotion/lambda` later if you need AWS-level scale

**Setting Up Folder Structure:**

Create a `remotion` folder in the root of your project. Inside this folder, create three essential files:

**1. Composition Component** (`remotion/Composition.tsx`):
```tsx
export const MyComposition = () => {
  return null;
};
```

**2. Root Component** (`remotion/Root.tsx`):
```tsx
import React from 'react';
import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
```

**3. Entry Point** (`remotion/index.ts`):
```ts
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
```

The file that calls `registerRoot()` is your Remotion **entry point**.

> **⚠️ Important Note:** Watch out for import aliases in your `tsconfig.json` that might resolve `import {...} from "remotion"` to the `remotion` folder. We recommend not using `paths` without a prefix to avoid conflicts.

**Starting the Remotion Studio:**
```bash
npx remotion studio remotion/index.ts
```
Replace `remotion/index.ts` with your entry point path if you used a different location.

**Rendering a Video:**
```bash
npx remotion render remotion/index.ts MyComp out.mp4
```
Replace the entry point, composition name (`MyComp`), and output filename (`out.mp4`) with values that correspond to your use case.

**ESLint Plugin Setup:**

Add the ESLint plugin configuration to your `.eslintrc` or `eslint.config.js`:

```json
{
  "plugins": ["@remotion"],
  "overrides": [
    {
      "files": ["remotion/*.{ts,tsx}"],
      "extends": ["plugin:@remotion/recommended"]
    }
  ]
}
```

This enables Remotion-specific linting rules only for files in the `remotion` folder.

**File Structure:**
```
project-root/
├── app/
│   ├── api/
│   │   └── render/
│   │       └── route.ts          # Trigger render jobs
│   ├── courses/
│   │   └── [id]/
│   │       ├── page.tsx          # Course preview page
│   │       └── edit/
│   │           └── page.tsx      # Remotion Player editor
├── remotion/                     # Remotion folder (can be anywhere in project)
│   ├── index.ts                  # Entry point (calls registerRoot)
│   ├── Root.tsx                  # Root component (defines compositions)
│   ├── Composition.tsx           # Example composition
│   ├── components/
│   │   ├── CourseVideo.tsx       # Main course composition
│   │   ├── slides/
│   │   │   ├── TitleSlide.tsx
│   │   │   ├── ContentSlide.tsx
│   │   │   └── ...
│   │   └── Captions.tsx
│   └── utils/
│       ├── audio.ts
│       └── timeline.ts
└── remotion.config.ts            # Optional: Remotion config (if needed)
```

**Configuration (Optional):**

If you need custom Remotion configuration, create `remotion.config.ts` at the project root:

```typescript
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Add other configurations as needed
```

### Database Schema

**Supabase Tables:**
```sql
-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'full-course', 'quick-explainer', etc.
  style TEXT, -- 'professional', 'cinematic', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  layout JSONB NOT NULL,
  estimated_duration INTEGER, -- in seconds
  final_video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Render jobs table
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  render_id TEXT, -- Remotion Lambda render ID
  status TEXT DEFAULT 'queued', -- 'queued', 'rendering', 'completed', 'failed'
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course slides table
CREATE TABLE course_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id),
  chapter_id UUID,
  slide_id UUID,
  slide_type TEXT NOT NULL,
  content JSONB NOT NULL,
  template_data JSONB,
  audio_url TEXT,
  audio_duration INTEGER,
  caption_data JSONB,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Routes

**Course Generation Endpoint:**
```typescript
// app/api/courses/generate/route.ts
export async function POST(request: Request) {
  const { topic, courseType, style } = await request.json();
  
  // 1. Generate layout
  const layout = await generateCourseLayout(topic, courseType, style);
  
  // 2. Save to database
  const course = await saveCourseLayout(layout);
  
  // 3. Trigger async processing
  await processCourseChapters(course.id);
  
  return Response.json({ courseId: course.id, status: 'processing' });
}
```

**Render Trigger Endpoint:**
```typescript
// app/api/render/route.ts
export async function POST(request: Request) {
  const { courseId } = await request.json();
  
  // Verify all assets are ready
  const isReady = await verifyCourseAssets(courseId);
  if (!isReady) {
    return Response.json({ error: 'Assets not ready' }, { status: 400 });
  }
  
  // Trigger Remotion Lambda render
  const renderJob = await triggerRender(courseId);
  
  return Response.json({ jobId: renderJob.id, status: 'queued' });
}
```

---

## ✨ Advanced Features

### 1. Interactive Quizzes
- Overlay interactive buttons during playback
- Pause video until user answers
- Track completion and scores
- Store results in database

### 2. Multi-Language Dubbing
- Automatically translate course content
- Generate TTS in target language
- Re-sync captions for new audio
- Maintain same slide templates

### 3. Style Presets & Customization
- Pre-defined themes (Professional, Creative, Cyberpunk)
- User-customizable color palettes
- Font selection (inter, geist, instrument serif)
- Animation speed preferences

### 4. AI Virtual Presenters
- Integration with HeyGen or ElevenLabs
- Talking-head avatar in corner of slides
- Synchronized with narration
- Optional feature (user-selectable)

### 5. Social Media Optimization
- One-click export for TikTok (9:16)
- LinkedIn format (16:9)
- Instagram square (1:1)
- Automatic reformatting of slides

### 6. Live Edit Mode
- Real-time editing of slide text
- Instant preview with Remotion Player
- Auto-save to database
- Version history

---

## ⚡ Performance Optimizations

### Rendering Optimization
- **Frame Caching:** Cache static frames to avoid re-rendering
- **Lazy Loading:** Load audio/captions only when needed
- **Concurrent Processing:** Process multiple chapters in parallel
- **Lambda Batching:** Queue multiple render jobs for batch processing

### Storage Optimization
- **CDN Integration:** Serve audio/video from Supabase CDN
- **Compression:** Optimize audio files (MP3 quality vs. size)
- **Cleanup Jobs:** Archive old courses, delete temporary files
- **Asset Deduplication:** Reuse identical audio files across courses

### Database Optimization
- **Indexing:** Index course_id, user_id, status fields
- **JSONB Indexing:** Index frequently queried JSON fields
- **Connection Pooling:** Use Supabase connection pooling
- **Query Optimization:** Use efficient queries, avoid N+1 problems

---

## 🔍 Error Handling & Monitoring

### Error Scenarios
1. **AI Generation Failures:**
   - Retry with exponential backoff
   - Fallback to simpler model
   - Log errors for debugging

2. **TTS Generation Errors:**
   - Retry failed audio generation
   - Use fallback voice if selected unavailable
   - Validate audio file before saving

3. **Rendering Failures:**
   - Retry render job up to 3 times
   - Notify user of failure
   - Store error details for support

4. **Storage Errors:**
   - Retry uploads with exponential backoff
   - Verify file integrity after upload
   - Handle quota exceeded errors gracefully

### Monitoring & Logging
- **Render Progress:** Real-time updates via WebSocket or polling
- **Usage Metrics:** Track API calls, render times, storage usage
- **Error Tracking:** Integrate Sentry or similar for error monitoring
- **Performance Metrics:** Track render times, generation speeds

---

## 🔮 Future Enhancements

### Short-term (Q1 2026)
- [ ] User voice cloning for personalized narration
- [ ] AI-generated slide backgrounds and illustrations
- [ ] Advanced animation library (more transition effects)
- [ ] Collaborative editing (multiple users per course)

### Medium-term (Q2-Q3 2026)
- [ ] Mobile app for course viewing and editing
- [ ] Integration with learning management systems (LMS)
- [ ] Analytics dashboard (views, engagement, completion rates)
- [ ] Course marketplace (users can share/publish courses)

### Long-term (Q4 2026+)
- [ ] AI course optimization (improve based on engagement data)
- [ ] Live streaming capabilities
- [ ] VR/AR course viewing
- [ ] White-label solutions for educational institutions

---

## 📚 Resources & Documentation

### Remotion
- [Remotion Documentation](https://www.remotion.dev/docs/)
- [Installing Remotion in an existing project (Brownfield)](https://www.remotion.dev/docs/brownfield)
- [Remotion Player Integration](https://www.remotion.dev/docs/player/integration)
- [Remotion Renderer API (Node.js)](https://www.remotion.dev/docs/renderer)
- [Remotion Lambda with Supabase (AWS)](https://www.remotion.dev/docs/lambda/supabase) - *Requires AWS account*

### Alternative Render Services (No AWS)
- [Railway](https://railway.app/) - Simple Node.js deployment
- [Render](https://render.com/) - Free tier available
- [Fly.io](https://fly.io/) - Generous free tier

### AI & Storage Services
- [Google Cloud TTS API](https://cloud.google.com/text-to-speech/docs)
- [Replicate Whisper](https://replicate.com/openai/whisper)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### Important Notes
- **Vercel Limitations:** Serverless functions have 10s (free) to 60s (Pro) timeout limits - not suitable for video rendering
- **Supabase Limitations:** Edge Functions have timeout/memory limits - use for triggering jobs, not rendering
- **AWS Requirements:** AWS Lambda requires credit card even for Free Tier (1M requests/month, 400K GB-seconds)

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Maintainer:** EduSphere AI Team

