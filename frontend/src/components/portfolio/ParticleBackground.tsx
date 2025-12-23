"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ParticleBackground Component
 * Full-page animated particle background with CSS animations
 * Inspired by React Bits Particles effect
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  delay: number;
}

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  connectParticles?: boolean;
  connectionDistance?: number;
  connectionColor?: string;
}

export function ParticleBackground({
  className,
  particleCount = 50,
  particleColor = "rgba(34, 211, 238, 0.6)", // cyan-400
  minSize = 2,
  maxSize = 4,
  speed = 1,
  connectParticles = true,
  connectionDistance = 150,
  connectionColor = "rgba(34, 211, 238, 0.15)",
}: ParticleBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const animationRef = React.useRef<number | undefined>(undefined);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  // Initialize particles
  const initParticles = React.useCallback(
    (width: number, height: number) => {
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * speed,
          speedY: (Math.random() - 0.5) * speed,
          opacity: Math.random() * 0.5 + 0.3,
          delay: Math.random() * 2,
        });
      }
      particlesRef.current = particles;
    },
    [particleCount, minSize, maxSize, speed]
  );

  // Animation loop
  const animate = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Mouse interaction - particles move away from cursor
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.x -= dx * force * 0.02;
        particle.y -= dy * force * 0.02;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor.replace(
        /[\d.]+\)$/,
        `${particle.opacity})`
      );
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = particleColor;
    });

    // Draw connections between nearby particles
    if (connectParticles) {
      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = connectionColor.replace(
              /[\d.]+\)$/,
              `${opacity * 0.3})`
            );
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [particleColor, connectParticles, connectionDistance, connectionColor]);

  // Handle resize
  const handleResize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);
  }, [initParticles]);

  // Handle mouse move
  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  React.useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, handleMouseMove, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        className
      )}
      style={{ background: "transparent" }}
    />
  );
}

export default ParticleBackground;
