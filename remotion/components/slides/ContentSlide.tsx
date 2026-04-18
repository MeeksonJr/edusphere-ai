import React from "react"
import { useVideoConfig, useCurrentFrame, interpolate, Easing } from "remotion"

interface ContentSlideProps {
  title: string
  content: string
  visualElements?: string[]
  style?: string
}

export const ContentSlide: React.FC<ContentSlideProps> = ({
  title,
  content,
  visualElements = [],
  style = "professional",
}) => {
  const { fps, durationInFrames } = useVideoConfig()
  const frame = useCurrentFrame()

  // Fade in animation
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], {
    easing: Easing.ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Slide in from right
  const translateX = interpolate(frame, [0, fps * 0.5], [100, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Word-by-word reveal for content
  const words = content.split(" ")
  const wordsPerSecond = 3 // Adjust based on narration speed
  const wordsToShow = Math.floor((frame / fps) * wordsPerSecond)

  // Parse markdown-like content (simple implementation)
  const parseContent = (text: string) => {
    // Simple markdown parsing
    const lines = text.split("\n")
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return { type: "h1", text: line.substring(2) }
      } else if (line.startsWith("## ")) {
        return { type: "h2", text: line.substring(3) }
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        return { type: "bullet", text: line.substring(2) }
      } else if (line.trim() === "") {
        return { type: "spacer", text: "" }
      } else {
        return { type: "paragraph", text: line }
      }
    })
  }

  const parsedContent = parseContent(content)
  const visibleWords = words.slice(0, wordsToShow).join(" ")

  // Extract Pollinations Image URL if available
  const imgUrlStr = visualElements.find(el => el.startsWith("IMAGE_URL:"))
  const imageUrl = imgUrlStr ? imgUrlStr.replace("IMAGE_URL:", "") : null

  const getStyleColors = () => {
    switch (style) {
      case "cinematic":
        return {
          bg: "#0a0a0a",
          titleColor: "#ffffff",
          textColor: "rgba(255, 255, 255, 0.9)",
          accent: "#a855f7",
        }
      case "casual":
        return {
          bg: "#f8f9fa",
          titleColor: "#1a1a1a",
          textColor: "#4a4a4a",
          accent: "#f5576c",
        }
      case "academic":
        return {
          bg: "#ffffff",
          titleColor: "#1a1a1a",
          textColor: "#333333",
          accent: "#4facfe",
        }
      default: // professional
        return {
          bg: "#1a1a1a",
          titleColor: "#ffffff",
          textColor: "rgba(255, 255, 255, 0.9)",
          accent: "#667eea",
        }
    }
  }

  const colors = getStyleColors()

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        padding: "4rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: "3.5rem",
          fontWeight: "bold",
          color: colors.titleColor,
          margin: 0,
          marginBottom: "2rem",
          transform: `translateX(${translateX}px)`,
        }}
      >
        {title}
      </h2>

      {/* Content Area - Split if image exists */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          gap: "3rem",
          transform: `translateX(${translateX}px)`,
        }}
      >
        {/* Text Section */}
        <div
          style={{
            flex: imageUrl ? 1 : 2,
            color: colors.textColor,
            fontSize: "2rem",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {parsedContent.map((item, index) => {
            if (item.type === "spacer") {
              return <div key={index} style={{ height: "1rem" }} />
            }

            const itemWords = item.text.split(" ")
            const itemWordsToShow = Math.max(0, wordsToShow - words.slice(0, index).join(" ").split(" ").length)
            const visibleItemText = itemWords.slice(0, itemWordsToShow).join(" ")

            if (item.type === "bullet") {
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: colors.accent,
                      marginRight: "1rem",
                      fontSize: "2rem",
                    }}
                  >
                    •
                  </span>
                  <span>{visibleItemText}</span>
                </div>
              )
            } else if (item.type === "h1") {
              return (
                <h1 key={index} style={{ fontSize: "3rem", marginBottom: "1rem", marginTop: "1rem" }}>
                  {item.text}
                </h1>
              )
            } else if (item.type === "h2") {
              return (
                <h2 key={index} style={{ fontSize: "2.5rem", marginBottom: "1rem", marginTop: "1rem" }}>
                  {item.text}
                </h2>
              )
            } else {
              return (
                <p key={index} style={{ marginBottom: "1rem" }}>
                  {visibleItemText}
                </p>
              )
            }
          })}
        </div>
        
        {/* Image Section */}
        {imageUrl && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "60vh",
                borderRadius: "1.5rem",
                overflow: "hidden",
                border: `2px solid ${colors.accent}40`,
                boxShadow: `0 20px 40px ${colors.accent}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${colors.accent}10`,
              }}
            >
              {/* Note: since Pollinations might take a second to generate the first time, 
                  Remotion will handle the <img/> load automatically during rendering. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt={title} 
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

