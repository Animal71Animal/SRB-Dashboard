"use client";

import AnimatedBackground from "@/components/AnimatedBackground";

export default function Page() {
  return (
    <div className="relative min-h-screen p-4 md:p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-full mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Schedules</h1>
        <div className="bg-black/60 backdrop-blur-md border border-red-900/30 rounded-xl overflow-hidden">
          <iframe
            src="https://torch-dj-scheduler-hdb9g8.abacusai.app/dashboard/schedule"
            title="Torch DJ Scheduler"
            style={{ width: '100%', height: 'calc(100vh - 120px)', border: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
