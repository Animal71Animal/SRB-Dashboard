import React from 'react';
import AnimatedBackground from '../../components/AnimatedBackground';

export default function DjMcCommunicationPage() {
  return (
    <div className="relative min-h-screen p-8 text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">DJ/MC Communications</h1>
        <p className="text-gray-400 mb-8">Internal communication hub for DJs and MCs.</p>
        
        <div className="bg-black/60 backdrop-blur-md border border-red-900/30 rounded-xl p-8">
          <p className="text-xl text-center italic text-gray-500">Messaging module placeholder.</p>
        </div>
      </div>
    </div>
  );
}
