"use client";
import AnimatedBackground from "@/components/AnimatedBackground";
export default function Page() {
  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Equipment Reports</h1>
        <div className="bg-black/60 backdrop-blur-md border border-red-900/30 rounded-xl p-12 text-center">
          <p className="text-gray-500 italic">Page content coming soon.</p>
        </div>
      </div>
    </div>
  );
}
