"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ParticleCard } from "./ParticleCard";
import type { SkillRadarProps, Skill } from "@/types/portfolio";

/**
 * SkillRadar Component
 * Hexagonal spider chart for comprehensive skill visualization for technical professionals
 * Requirements: 3.4 - Implement radar charts for comprehensive skill visualization
 */

interface RadarDataPoint {
  skill: string;
  value: number;
  fullMark: number;
}

// Custom tooltip component
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RadarDataPoint }>;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-black/80 border border-white/20 backdrop-blur-xl px-3 py-2 rounded-lg">
      <p className="text-sm font-medium text-white">{data.skill}</p>
      <p className="text-xs text-cyan-400">
        Level: {data.value}%
      </p>
    </div>
  );
}

// Group skills by category for multiple radar charts
function groupSkillsByCategory(skills: Skill[]): Map<string, Skill[]> {
  const grouped = new Map<string, Skill[]>();

  skills.forEach((skill) => {
    const category = skill.category || "General";
    const existing = grouped.get(category) || [];
    grouped.set(category, [...existing, skill]);
  });

  return grouped;
}

// Convert skills to radar chart data format
function skillsToRadarData(skills: Skill[]): RadarDataPoint[] {
  return skills.map((skill) => ({
    skill: skill.name,
    value: skill.level, // Assuming 0-100 scale
    fullMark: 100,
  }));
}

interface SkillRadarChartProps {
  skills: Skill[];
  category: string;
  index: number;
}

function SkillRadarChart({ skills, category, index }: SkillRadarChartProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [animatedData, setAnimatedData] = React.useState<RadarDataPoint[]>([]);

  const radarData = React.useMemo(() => skillsToRadarData(skills), [skills]);

  // Animate data entry
  React.useEffect(() => {
    if (isInView) {
      // Start with zero values
      setAnimatedData(radarData.map((d) => ({ ...d, value: 0 })));

      // Animate to actual values
      const timer = setTimeout(() => {
        setAnimatedData(radarData);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isInView, radarData]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.2, duration: 0.5 }}
    >
      <ParticleCard className="rounded-xl h-full" enableParticles={true} particleCount={6}>
        <Card className="border-white/10 backdrop-blur-xl bg-zinc-950/80 h-full rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={animatedData}
                >
                  <PolarGrid
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeDasharray="3 3"
                  />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{
                      fill: "rgba(255, 255, 255, 0.6)",
                      fontSize: 11,
                    }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{
                      fill: "rgba(255, 255, 255, 0.4)",
                      fontSize: 10,
                    }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Skill list below chart */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between text-xs px-2 py-1 rounded bg-white/5"
                >
                  <span className="text-white/70 truncate">{skill.name}</span>
                  <span className="text-cyan-400 font-mono ml-2">
                    {skill.level}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </ParticleCard>
    </motion.div>
  );
}

export function SkillRadar({ skills, theme }: SkillRadarProps) {
  const groupedSkills = React.useMemo(() => groupSkillsByCategory(skills), [skills]);
  const categories = Array.from(groupedSkills.keys());

  // If only one category or few skills, show single radar
  const showSingleRadar = categories.length === 1 || skills.length <= 8;

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
            Technical Skills
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
        </motion.div>

        {/* Radar charts */}
        {showSingleRadar ? (
          <div className="max-w-xl mx-auto">
            <SkillRadarChart
              skills={skills}
              category="All Skills"
              index={0}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <SkillRadarChart
                key={category}
                skills={groupedSkills.get(category) || []}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Overall proficiency indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-zinc-950/80 border border-white/10 backdrop-blur-xl px-6 py-3 rounded-full">
            <span className="text-sm text-white/60">Average Proficiency</span>
            <span className="text-lg font-bold text-cyan-400">
              {Math.round(
                skills.reduce((acc, s) => acc + s.level, 0) / skills.length
              )}
              %
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SkillRadar;
