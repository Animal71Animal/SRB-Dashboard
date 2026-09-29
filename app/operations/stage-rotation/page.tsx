"use client";

import { useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function StageRotationPage() {
  useEffect(() => {
    // Open the primary stage rotation window on page load
    window.open("https://torchrotation.abacusai.app/", "torch-rotation", "popup=yes,width=520,height=900");
    // Redirect back to overview to keep layout seamless
    window.location.replace("/");
  }, []);

  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-bold animate-pulse">Launching Stage Rotation Panel...</h2>
        <p className="text-sm text-gray-400 mt-2">Opening controller in a separate popup window.</p>
      </div>
    </div>
  );
}
