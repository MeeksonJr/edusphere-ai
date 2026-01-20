import React from "react"
import { useVideoConfig, useCurrentFrame, interpolate, Easing } from "remotion"

interface TransitionSlideProps {
  title: string
  style?: string
}

export const TransitionSlide: React.FC<TransitionSlideProps> = ({ title, style = "professional" }) => {
  const { fps } = useVideoConfig()
  const frame = useCurrentFrame()

  // Fade in/out animation
  const opacity = interpolate(
    frame,
    [0, fps * 0.2, fps * 0.8, fps],
    [0, 1, 1, 0],
    {
      easing: Easing.ease,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  )

  // Scale pulse animation
  const scale = interpolate(
    frame,
    [0, fps * 0.3, fps * 0.7, fps],
    [0.9, 1, 1, 0.9],
    {
      easing: Easing.inOut(Easing.ease),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  )

  const getStyleColors = () => {
    switch (style) {
      case "cinematic":
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "#ffffff",
        }
      case "casual":
        return {
          bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          textColor: "#ffffff",
        }
      case "academic":
        return {
          bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          textColor: "#ffffff",
        }
      default: // professional
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          textColor: "#ffffff",
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
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "bold",
            color: colors.textColor,
            margin: 0,
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}

