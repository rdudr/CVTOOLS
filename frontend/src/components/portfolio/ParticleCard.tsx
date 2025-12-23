"use client";

import * as React from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import "@/components/MagicBento.css";

/**
 * ParticleCard Component
 * Reusable card wrapper with MagicBento particle and glow effects
 */

const DEFAULT_GLOW_COLOR = "34, 211, 238"; // cyan-400

interface ParticleCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  enableParticles?: boolean;
  particleCount?: number;
}

export function ParticleCard({
  children,
  className = "",
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  enableMagnetism = true,
  enableParticles = true,
  particleCount = 8,
}: ParticleCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const particlesRef = React.useRef<HTMLDivElement[]>([]);
  const isHoveredRef = React.useRef(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearParticles = React.useCallback(() => {
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const createParticles = React.useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || !enableParticles) return;

    const { width, height } = cardRef.current.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const particle = document.createElement("div");
        particle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(${glowColor}, 1);
          box-shadow: 0 0 6px rgba(${glowColor}, 0.6);
          pointer-events: none;
          z-index: 100;
          left: ${Math.random() * width}px;
          top: ${Math.random() * height}px;
        `;

        cardRef.current.appendChild(particle);
        particlesRef.current.push(particle as unknown as HTMLDivElement);

        gsap.fromTo(
          particle,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(particle, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, i * 100);
    }
  }, [glowColor, enableParticles, particleCount]);

  React.useEffect(() => {
    if (!isMounted) return;
    
    const element = cardRef.current;
    if (!element) return;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      createParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearParticles();

      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      element.style.setProperty("--glow-intensity", "0");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Update glow position
      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;
      element.style.setProperty("--glow-x", `${relativeX}%`);
      element.style.setProperty("--glow-y", `${relativeY}%`);
      element.style.setProperty("--glow-intensity", "1");

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.03;
        const magnetY = (y - centerY) * 0.03;
        gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      clearParticles();
    };
  }, [isMounted, createParticles, clearParticles, enableTilt, enableMagnetism]);

  return (
    <div
      ref={cardRef}
      className={cn(className, "particle-container magic-bento-card--border-glow")}
      style={{
        position: "relative",
        overflow: "hidden",
        "--glow-color": glowColor,
        "--glow-x": "50%",
        "--glow-y": "50%",
        "--glow-intensity": "0",
        "--glow-radius": "200px",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default ParticleCard;
