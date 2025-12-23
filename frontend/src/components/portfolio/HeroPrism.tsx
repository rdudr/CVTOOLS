"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/lib/theme-context";
import { ParticleCard } from "./ParticleCard";
import type { HeroPrismProps, ContactInfo } from "@/types/portfolio";
import { HeroTheme as HeroThemeEnum } from "@/types/portfolio";

/**
 * HeroPrism Component
 * Liquid glass hero section with interactive cursor effects for creative/general professionals
 * Requirements: 2.2 - Render prism hero sections with liquid glass effects
 * Requirements: 1.5 - Apply a cohesive color palette that matches the candidate's professional style
 */

interface PrismThemeConfig {
  gradient: string;
}

// Local theme variations for gradient backgrounds only
// Colors are derived from global theme CSS variables
const themeGradients: Record<string, PrismThemeConfig> = {
  ocean: {
    gradient: "from-cyan-500/20 via-blue-500/20 to-purple-500/20",
  },
  sunset: {
    gradient: "from-orange-500/20 via-pink-500/20 to-purple-500/20",
  },
  forest: {
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
  },
};

function ContactLink({ icon, value, href }: { icon: string; value: string; href?: string }) {
  const content = (
    <span className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
      <span className="text-cyan-400">{icon}</span>
      {value}
    </span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return content;
}

function ContactSection({ contact }: { contact?: ContactInfo }) {
  if (!contact) return null;

  const links = [
    contact.email && { icon: "✉", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { icon: "☎", value: contact.phone, href: `tel:${contact.phone}` },
    contact.linkedin && { icon: "in", value: "LinkedIn", href: contact.linkedin },
    contact.github && { icon: "⌘", value: "GitHub", href: contact.github },
    contact.website && { icon: "◎", value: "Website", href: contact.website },
    contact.location && { icon: "◉", value: contact.location },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex flex-wrap gap-4 mt-6"
    >
      {links.map((link, index) => (
        <ContactLink key={index} {...(link as { icon: string; value: string; href?: string })} />
      ))}
    </motion.div>
  );
}

export function HeroPrism({ theme = HeroThemeEnum.OCEAN, title, subtitle, name, contact }: HeroPrismProps) {
  // Get global theme colors for consistent styling
  const themeColors = useThemeColors();
  
  // Use local gradient variation, but colors come from global theme
  const themeGradient = themeGradients[theme]?.gradient || themeGradients.ocean.gradient;
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Mouse position tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for cursor following
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform mouse position to rotation values
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  // Handle mouse movement
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = React.useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[400px] md:min-h-[500px] overflow-hidden"
    >
      {/* Animated gradient background */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          themeGradient
        )}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating orbs for liquid effect - uses global theme glow color */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: `radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)`,
              left: `${10 + i * 20}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Main glass card with 3D tilt effect */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 flex items-center justify-center min-h-[400px] md:min-h-[500px] p-6 md:p-12"
      >
        <ParticleCard className="rounded-xl max-w-3xl w-full" enableParticles={true} particleCount={10}>
          <Card className="border-white/10 backdrop-blur-xl bg-zinc-950/80 rounded-xl">
            <CardContent className="p-8 md:p-12">
              {/* Name with glow effect - uses global theme glow */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4"
                style={{
                  textShadow: `0 0 40px rgba(34, 211, 238, 0.5)`,
                }}
              >
                {name}
              </motion.h1>

              {/* Title - uses global theme primary color */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl md:text-2xl font-medium mb-4 text-cyan-400"
              >
                {title}
              </motion.h2>

              {/* Subtitle */}
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-base md:text-lg text-white/70 max-w-xl"
                >
                  {subtitle}
                </motion.p>
              )}

              {/* Contact information */}
              <ContactSection contact={contact} />
            </CardContent>
          </Card>
        </ParticleCard>
      </motion.div>

      {/* Interactive cursor glow - uses global theme glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
        style={{
          background: `radial-gradient(circle, rgba(34, 211, 238, 0.5) 0%, transparent 70%)`,
          x: useTransform(smoothX, (v) => `calc(${(v + 0.5) * 100}% - 128px)`),
          y: useTransform(smoothY, (v) => `calc(${(v + 0.5) * 100}% - 128px)`),
        }}
      />
    </div>
  );
}

export default HeroPrism;
