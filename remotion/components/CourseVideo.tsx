import React from "react"
import { useVideoConfig, useCurrentFrame, Sequence, Audio, staticFile } from "remotion"
import { TitleSlide } from "./slides/TitleSlide"
import { ContentSlide } from "./slides/ContentSlide"
import { TransitionSlide } from "./slides/TransitionSlide"

interface CourseVideoProps {
  courseId?: string
  chapters?: any[]
  style?: string
}

export const CourseVideo: React.FC<CourseVideoProps> = ({
  courseId = "",
  chapters = [],
  style = "professional",
}) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  // Calculate slide sequences
  const sequences: Array<{
    from: number
    duration: number
    slide: any
    chapter: any
    audioUrl?: string
  }> = []

  let currentFrame = 0

  chapters.forEach((chapter) => {
    chapter.slides?.forEach((slide: any) => {
      const slideDuration = (slide.estimatedDuration || 30) * fps // Convert seconds to frames

      sequences.push({
        from: currentFrame,
        duration: slideDuration,
        slide,
        chapter,
        audioUrl: slide.audioUrl,
      })

      currentFrame += slideDuration
    })
  })

  // Get current slide based on frame
  const currentSlide = sequences.find(
    (seq) => frame >= seq.from && frame < seq.from + seq.duration
  )

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      {/* Render all slide sequences */}
      {sequences.map((sequence, index) => {
        const SlideComponent =
          sequence.slide.type === "title-slide"
            ? TitleSlide
            : sequence.slide.type === "transition-slide"
              ? TransitionSlide
              : ContentSlide

        return (
          <Sequence
            key={`${sequence.chapter.chapterId}-${sequence.slide.slideId}-${index}`}
            from={sequence.from}
            durationInFrames={sequence.duration}
          >
            {/* Audio for this slide */}
            {sequence.audioUrl && (
              <Audio src={sequence.audioUrl} startFrom={0} />
            )}

            {/* Slide component */}
            <SlideComponent
              title={sequence.slide.content?.title || ""}
              subtitle={
                sequence.slide.type === "title-slide"
                  ? sequence.chapter.title
                  : undefined
              }
              content={sequence.slide.content?.body || ""}
              visualElements={sequence.slide.content?.visualElements || []}
              style={style}
            />
          </Sequence>
        )
      })}

      {/* Fallback if no slides */}
      {sequences.length === 0 && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "3rem",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                background: "linear-gradient(to right, #a855f7, #3b82f6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Course Video
            </h1>
            <p style={{ fontSize: "1.5rem", opacity: 0.7 }}>
              {chapters.length > 0
                ? `Chapter 1: ${chapters[0]?.title || "Loading..."}`
                : "No content yet"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
