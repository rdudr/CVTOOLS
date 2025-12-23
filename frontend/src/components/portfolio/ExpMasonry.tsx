"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ParticleCard } from "./ParticleCard";
import type { ExpMasonryProps, Experience, Project } from "@/types/portfolio";

/**
 * ExpMasonry Component
 * Staggered masonry grid layout for creative professionals
 * Requirements: 2.3 - Use staggered grid layouts for visual impact
 */

interface MasonryCardProps {
  item: Experience | Project;
  index: number;
  type: "experience" | "project";
}

function isExperience(item: Experience | Project): item is Experience {
  return "company" in item;
}

function MasonryCard({ item, index, type }: MasonryCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Determine card size based on content and position
  const isLarge = index % 5 === 0 || index % 7 === 0;
  const isMedium = index % 3 === 0;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      }}
      className={cn(
        "break-inside-avoid mb-4",
        isLarge && "row-span-2",
        isMedium && "col-span-1"
      )}
    >
      <ParticleCard className="rounded-xl" enableParticles={true} particleCount={6}>
        <Card
          className={cn(
            "border-white/10 backdrop-blur-xl bg-zinc-950/80",
            "hover:bg-zinc-900/90 hover:border-cyan-500/30",
            "transition-all duration-300 overflow-hidden group rounded-xl",
            isLarge && "min-h-[280px]",
            !isLarge && !isMedium && "min-h-[180px]"
          )}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardHeader className="relative z-10 pb-2">
            {type === "experience" && isExperience(item) ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base md:text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-cyan-400">
                    {item.company}
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {formatDate(item.startDate)} —{" "}
                    {item.endDate ? formatDate(item.endDate) : "Present"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <CardTitle className="text-base md:text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                  {"name" in item ? item.name : ""}
                </CardTitle>
                {"url" in item && item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View Project →
                  </a>
                )}
              </>
            )}
          </CardHeader>

          <CardContent className="relative z-10">
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-3">
              {item.description}
            </p>

            {/* Technologies/Highlights */}
            {"technologies" in item && item.technologies && item.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.technologies.slice(0, 4).map((tech, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs bg-white/5 border-white/20 text-white/70 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                  >
                    {tech}
                  </Badge>
                ))}
                {item.technologies.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/5 border-white/20 text-white/50"
                  >
                    +{item.technologies.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Highlights for experiences */}
            {isExperience(item) && item.highlights && item.highlights.length > 0 && isLarge && (
              <ul className="mt-3 space-y-1">
                {item.highlights.slice(0, 3).map((highlight, i) => (
                  <li
                    key={i}
                    className="text-xs text-white/50 flex items-start gap-1.5"
                  >
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span className="line-clamp-1">{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/20 to-transparent transform rotate-45 translate-x-16 -translate-y-16 group-hover:from-cyan-500/30 transition-colors" />
          </div>
        </Card>
      </ParticleCard>
    </motion.div>
  );
}

export function ExpMasonry({ experiences, projects, theme }: ExpMasonryProps) {
  // Combine and interleave experiences and projects
  const items = React.useMemo(() => {
    const combined: Array<{ item: Experience | Project; type: "experience" | "project" }> = [];

    const maxLength = Math.max(experiences.length, projects?.length || 0);
    for (let i = 0; i < maxLength; i++) {
      if (i < experiences.length) {
        combined.push({ item: experiences[i], type: "experience" });
      }
      if (projects && i < projects.length) {
        combined.push({ item: projects[i], type: "project" });
      }
    }

    return combined;
  }, [experiences, projects]);

  return (
    <section className={cn("w-full py-12 md:py-16", theme)}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Experience & Projects
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
          {items.map(({ item, type }, index) => (
            <MasonryCard
              key={item.id}
              item={item}
              index={index}
              type={type}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExpMasonry;
