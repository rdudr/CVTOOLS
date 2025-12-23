"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ParticleCard } from "./ParticleCard";
import type { ExpTimelineProps, Experience } from "@/types/portfolio";

/**
 * ExpTimeline Component
 * Vertical timeline layout with connected glass cards for technical professionals
 * Requirements: 3.3 - Use vertical timeline layouts with connected elements
 */

interface TimelineItemProps {
  experience: Experience;
  index: number;
  isLast: boolean;
}

function TimelineItem({ experience, index, isLast }: TimelineItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    <div ref={ref} className="relative flex gap-6 md:gap-8">
      {/* Timeline connector line */}
      <div className="flex flex-col items-center">
        {/* Timeline dot */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: index * 0.2, duration: 0.4, type: "spring" }}
          className="relative z-10 w-4 h-4 rounded-full bg-cyan-400 shadow-lg"
          style={{
            boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)",
          }}
        >
          {/* Pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Connecting line */}
        {!isLast && (
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : {}}
            transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
            className="w-0.5 flex-1 bg-gradient-to-b from-cyan-400 to-white/10"
          />
        )}
      </div>

      {/* Experience card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.2 + 0.1, duration: 0.5 }}
        className="flex-1 pb-8"
      >
        <ParticleCard className="rounded-xl" enableParticles={true} particleCount={6}>
          <Card className="border-white/10 backdrop-blur-xl bg-zinc-950/80 hover:bg-zinc-900/90 transition-all duration-300 group rounded-xl">
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <CardTitle className="text-lg md:text-xl text-white group-hover:text-cyan-400 transition-colors">
                  {experience.title}
                </CardTitle>
                <span className="text-sm text-white/50 font-mono">
                  {formatDate(experience.startDate)} —{" "}
                  {experience.endDate ? formatDate(experience.endDate) : "Present"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-cyan-400">
                <span>{experience.company}</span>
                {experience.location && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">{experience.location}</span>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                {experience.description}
              </p>

              {/* Highlights */}
              {experience.highlights && experience.highlights.length > 0 && (
                <>
                  <Separator className="my-4 bg-white/10" />
                  <ul className="space-y-2">
                    {experience.highlights.map((highlight, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.2 + 0.3 + i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-white/60"
                      >
                        <span className="text-cyan-400 mt-1">▸</span>
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </ParticleCard>
      </motion.div>
    </div>
  );
}

export function ExpTimeline({ experiences, theme }: ExpTimelineProps) {
  // Handle empty experiences array
  const displayExperiences = experiences && experiences.length > 0 
    ? experiences 
    : [{
        id: 'placeholder',
        company: 'Your Company',
        title: 'Your Role',
        startDate: '2020-01',
        endDate: 'Present',
        description: 'Add your experience details here.',
        highlights: ['Key achievement or responsibility']
      }];

  return (
    <section className={cn("w-full py-12 md:py-16", theme)}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Experience
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {displayExperiences.map((exp, index) => (
            <TimelineItem
              key={exp.id}
              experience={exp}
              index={index}
              isLast={index === displayExperiences.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExpTimeline;
