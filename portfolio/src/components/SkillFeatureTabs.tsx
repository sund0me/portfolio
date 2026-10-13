"use client";

import { Tabs } from "@base-ui/react/tabs";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { skillDescriptions } from "@/lib/skill-descriptions";

type SkillFeatureTabsProps = {
  skill: string;
  items: string[];
  label: string;
  language: "ru" | "en";
  variant: "hard" | "ai" | "soft";
};

const cycleDuration = 5600;

// One filled outline owns both the panel and the selected tab. There is no joining edge.
function surfacePath(width: number, height: number, seam: number, top: number, bottom: number) {
  const r = 16;
  const right = width - 1;
  const floor = height - 1;
  top = Math.max(1, top);
  bottom = Math.min(floor, bottom);
  // At either boundary, collapse the seam curves into a straight shared edge.
  // Keep the same path commands so intermediate animation frames stay continuous.
  const upperRadius = Math.min(r, (top - 1) / 2);
  const lowerRadius = Math.min(r, (floor - bottom) / 2);
  return `M ${seam + upperRadius} 1 H ${right - r} A ${r} ${r} 0 0 1 ${right} ${r + 1}
    V ${floor - r} A ${r} ${r} 0 0 1 ${right - r} ${floor}
    H ${seam + lowerRadius} A ${lowerRadius} ${lowerRadius} 0 0 1 ${seam} ${floor - lowerRadius}
    V ${bottom + lowerRadius} A ${lowerRadius} ${lowerRadius} 0 0 0 ${seam - lowerRadius} ${bottom}
    H ${r + 1} A ${r} ${r} 0 0 1 1 ${bottom - r}
    V ${top + r} A ${r} ${r} 0 0 1 ${r + 1} ${top}
    H ${seam - upperRadius} A ${upperRadius} ${upperRadius} 0 0 0 ${seam} ${top - upperRadius}
    V ${upperRadius + 1} A ${upperRadius} ${upperRadius} 0 0 1 ${seam + upperRadius} 1 Z`;
}

export default function SkillFeatureTabs({ skill, items, label, language }: SkillFeatureTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [surface, setSurface] = useState<{ width: number; height: number; path: string } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Array<HTMLElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const componentId = useId();
  const paused = hovered || focused || Boolean(reduceMotion);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const tab = tabsRef.current[activeIndex];
    if (!root || !stage || !tab) return;
    const measure = () => {
      const bounds = root.getBoundingClientRect();
      const tabBounds = tab.getBoundingClientRect();
      const seam = stage.getBoundingClientRect().left - bounds.left;
      setSurface(seam > 0 ? {
        width: bounds.width,
        height: bounds.height,
        path: surfacePath(bounds.width, bounds.height, seam, tabBounds.top - bounds.top, tabBounds.bottom - bounds.top),
      } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(tab);
    return () => observer.disconnect();
  }, [activeIndex, items]);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const timer = window.setTimeout(() => {
      setDirection(1);
      setActiveIndex(index => (index + 1) % items.length);
    }, cycleDuration);
    return () => window.clearTimeout(timer);
  }, [activeIndex, items.length, paused]);

  if (!items.length) return null;

  return (
    <Tabs.Root
      ref={rootRef}
      className="skill-feature-tabs"
      value={activeIndex}
      orientation="vertical"
      onValueChange={value => {
        const index = Number(value);
        setDirection(index >= activeIndex ? 1 : -1);
        setActiveIndex(index);
      }}
      style={{ "--skill-feature-direction": direction } as CSSProperties}
      data-paused={paused}
      onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {surface ? (
        <svg className="skill-feature-surface" width={surface.width} height={surface.height} aria-hidden="true" focusable="false">
          <motion.path
            key={`${surface.width}-${surface.height}`}
            initial={false}
            animate={{ d: surface.path }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      ) : null}
      <Tabs.List className="skill-feature-tablist" aria-label={label} activateOnFocus>
        {items.map((item, index) => (
          <Tabs.Tab
            ref={node => { tabsRef.current[index] = node; }}
            className="skill-feature-tab"
            value={index}
            key={item}
          >
            {index === activeIndex ? (
              <motion.span
                className="skill-feature-mobile-active"
                layoutId={`skill-feature-${componentId}`}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              />
            ) : null}
            <span className="skill-feature-tab-label">{item}</span>
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <div ref={stageRef} className="skill-feature-stage">
        {items.map((item, index) => (
          <Tabs.Panel
            className="skill-feature-panel"
            value={index}
            key={item}
            keepMounted
            aria-hidden={index !== activeIndex}
          >
            <h3>{item}</h3>
            <p>{skillDescriptions[language][skill][index]}</p>
          </Tabs.Panel>
        ))}
      </div>
    </Tabs.Root>
  );
}
