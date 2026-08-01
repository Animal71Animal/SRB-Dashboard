"use client";

import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasEl: HTMLCanvasElement = canvas;
    let animationId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number; alpha: number;
      constructor() {
        this.x = Math.random() * canvasEl.width;
        this.y = Math.random() * canvasEl.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvasEl.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvasEl.height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 0, 43, ${this.alpha})`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const count = Math.min(50, Math.floor((canvasEl.width * canvasEl.height) / 20000));
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const drawConnections = () => {
      const maxDist = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 0, 43, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      const gradient = ctx.createLinearGradient(0, 0, canvasEl.width, canvasEl.height);
      gradient.addColorStop(0, "rgba(13, 10, 10, 1)");
      gradient.addColorStop(0.5, "rgba(18, 12, 12, 1)");
      gradient.addColorStop(1, "rgba(13, 10, 10, 1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawConnections();
      animationId = requestAnimationFrame(animate);
    };

    resize(); init(); animate();
    window.addEventListener("resize", () => { resize(); init(); });
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      zIndex: -1, pointerEvents: "none",
    }} />
  );
}
