"use client";

import {
  BadgeCheck,
  BrainCircuit,
  ChartSpline,
  CloudCog,
  CodeXml,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Heart,
  HeartHandshake,
  MessageCircle,
  MessagesSquare,
  Network,
  PanelsTopLeft,
  RefreshCw,
  ScanSearch,
  Server,
  Shield,
  ShieldCheck,
  Table2,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  siClaude,
  siDocker,
  siGodotengine,
  siGnubash,
  siJavascript,
  siLinux,
  siN8n,
  siPrometheus,
  siPython,
  type SimpleIcon,
} from "simple-icons";

type SkillBentoProps = {
  items: string[];
  variant: "hard" | "ai" | "soft";
  label: string;
  onItemClick: (skill: string) => void;
};

type SkillVisual = {
  brand?: SimpleIcon;
  icon?: LucideIcon;
};

const visuals: Record<SkillBentoProps["variant"], SkillVisual[]> = {
  hard: [
    { brand: siPython },
    { brand: siJavascript },
    { icon: Code2 },
    { brand: siGodotengine },
    { brand: siLinux },
    { brand: siGnubash },
    { icon: CloudCog },
    { brand: siDocker },
    { brand: siN8n },
    { brand: siPrometheus },
    { icon: Server },
    { icon: ShieldCheck },
    { icon: Webhook },
    { icon: Network },
    { icon: Table2 },
    { icon: Database },
    { icon: ChartSpline },
  ],
  ai: [
    { brand: siClaude },
    { icon: BrainCircuit },
    { icon: Cpu },
    { icon: CodeXml },
    { icon: GitBranch },
    { icon: Network },
    { icon: PanelsTopLeft },
    { icon: MessageCircle },
    { icon: RefreshCw },
    { icon: Code2 },
  ],
  soft: [
    { icon: Shield },
    { icon: HeartHandshake },
    { icon: MessagesSquare },
    { icon: Users },
    { icon: Heart },
    { icon: BadgeCheck },
    { icon: ScanSearch },
  ],
};

function SkillCard({ item, visual, onItemClick }: { item: string; visual: SkillVisual; onItemClick: (skill: string) => void }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 170, damping: 20, mass: 0.65 });
  const smoothY = useSpring(y, { stiffness: 170, damping: 20, mass: 0.65 });
  const rotate = useTransform(smoothX, [-24, 24], [-7, 7]);
  const VisualIcon = visual.icon;

  const moveVisual = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 24);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 8);
  };

  const resetVisual = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type="button"
      className="skill-bento-item"
      onClick={() => onItemClick(item)}
      onPointerMove={moveVisual}
      onPointerLeave={resetVisual}
      onBlur={resetVisual}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="skill-bento-visual-anchor" aria-hidden="true">
        <motion.span className="skill-bento-visual" style={reduceMotion ? undefined : { x: smoothX, y: smoothY, rotate }}>
          {visual.brand ? (
            <svg viewBox="0 0 24 24" fill="currentColor" role="presentation">
              <path d={visual.brand.path} />
            </svg>
          ) : VisualIcon ? (
            <VisualIcon strokeWidth={1.25} />
          ) : null}
        </motion.span>
      </span>
      <span className="skill-bento-label">{item}</span>
    </motion.button>
  );
}

export default function SkillBento({ items, variant, label, onItemClick }: SkillBentoProps) {
  return (
    <div className={`skill-bento skill-bento--${variant}`} aria-label={label}>
      {items.map((item, index) => (
        <SkillCard
          key={item}
          item={item}
          visual={visuals[variant][index]}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}
