import React from "react";
import { Composition } from "remotion";
import { CourseVideo } from "./components/CourseVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CourseVideo"
        component={CourseVideo}
        durationInFrames={1800} // 60 seconds at 30fps (default)
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          courseId: "",
          chapters: [],
          style: "professional",
        }}
      />
    </>
  );
};

