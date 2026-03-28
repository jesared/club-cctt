"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const LOTTIE_SRC =
  "https://lottie.host/9a47b8f6-1abb-4358-80f7-7c5aec54cc0d/NPiylbWoSJ.lottie";

export default function NotFoundAnimation() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-primary-foreground p-3 shadow-sm ">
        <DotLottieReact src={LOTTIE_SRC} loop autoplay />
      </div>
    </div>
  );
}
