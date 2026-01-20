import React from "react"
import { useVideoConfig, useCurrentFrame, interpolate, Easing } from "remotion"

interface TitleSlideProps {
  title: string
  subtitle?: string
  style?: string
}

export const TitleSlide: React.FC<TitleSlideProps> = ({ title, subtitle, style = "professional" }) => {
  const { fps, durationInFrames } = useVideoConfig()
  const frame = useCurrentFrame()

  // Fade in animation
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], {
    easing: Easing.ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Slide up animation
  const translateY = interpolate(frame, [0, fps * 0.5], [50, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Scale animation for title
  const scale = interpolate(frame, [0, fps * 0.5, fps * 1], [0.8, 1, 1], {
    easing: Easing.out(Easing.back(1.2)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Get style-specific colors
  const getStyleColors = () => {
    switch (style) {
      case "cinematic":
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          titleColor: "#ffffff",
          subtitleColor: "rgba(255, 255, 255, 0.9)",
        }
      case "casual":
        return {
          bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          titleColor: "#ffffff",
          subtitleColor: "rgba(255, 255, 255, 0.9)",
        }
      case "academic":
        return {
          bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          titleColor: "#ffffff",
          subtitleColor: "rgba(255, 255, 255, 0.9)",
        }
      default: // professional
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          titleColor: "#ffffff",
          subtitleColor: "rgba(255, 255, 255, 0.9)",
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
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          textAlign: "center",
          maxWidth: "1200px",
        }}
      >
        <h1
          style={{
            fontSize: "5rem",
            fontWeight: "bold",
            color: colors.titleColor,
            margin: 0,
            marginBottom: subtitle ? "2rem" : 0,
            lineHeight: 1.2,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "2rem",
              color: colors.subtitleColor,
              margin: 0,
              fontWeight: 300,
              opacity: interpolate(frame, [fps * 0.5, fps * 1], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

