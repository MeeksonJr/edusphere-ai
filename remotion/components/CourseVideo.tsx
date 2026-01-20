import React from "react";
import { useVideoConfig, useCurrentFrame } from "remotion";

interface CourseVideoProps {
  courseId?: string;
  chapters?: any[];
  style?: string;
}

export const CourseVideo: React.FC<CourseVideoProps> = ({
  courseId = "",
  chapters = [],
  style = "professional",
}) => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate progress
  const progress = frame / durationInFrames;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui",
        color: "#fff",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
        }}
      >
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
        <div
          style={{
            marginTop: "2rem",
            width: "50%",
            height: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "#a855f7",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <p style={{ marginTop: "1rem", fontSize: "1rem", opacity: 0.5 }}>
          Frame {frame} / {durationInFrames} ({Math.round(progress * 100)}%)
        </p>
      </div>
    </div>
  );
};

