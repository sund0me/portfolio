"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import ASCIIText from "@/components/ASCIIText";
import CRTWarp from "@/components/CRTWarp";
import SkillBento from "@/components/SkillBento";
import SkillFeatureTabs from "@/components/SkillFeatureTabs";
import { GlassButton } from "@/components/ui/glass-button";

type Language = "ru" | "en";

const copy = {
  ru: {
    hero: "Строю полный стек для ИИ-автоматизаций: проектирую сети, защищаю серверную инфраструктуру и пишу бэкенд.",
    profile: ["AI Automation Engineer", "Automation · RAG · Infrastructure", "Public demonstration"],
    profileCta: "О проекте",
    close: "Закрыть",
    download: "Резюме",
    skills: [
      { title: "Hard Skills", items: ["Python", "JavaScript", "GDScript", "Godot", "Linux", "Bash", "DevOps", "Docker", "n8n", "Prometheus", "Web Server", "VPN", "API & Webhooks", "Network", "SQL", "Databases", "Analytics"] },
      { title: "AI Skills", items: ["Claude", "ChatGPT", "Local LLMs", "AI IDEs", "Harness", "AI Architecture", "ComfyUI", "Prompt Engineering", "RAG", "Frontend Development"] },
      { title: "Soft Skills", items: ["Стрессоустойчивость", "Отзывчивость", "Коммуникабельность", "Умение работать в команде", "Эмпатия и эмоциональный интеллект", "Ответственность и принятие ошибок", "Критическое мышление"] }
    ]
  },
  en: {
    hero: "I build complete stacks for AI automation: designing networks, securing server infrastructure, and writing backend systems.",
    profile: ["AI Automation Engineer", "Automation · RAG · Infrastructure", "Public demonstration"],
    profileCta: "About this demo",
    close: "Close",
    download: "CV",
    skills: [
      { title: "Hard Skills", items: ["Python", "JavaScript", "GDScript", "Godot", "Linux", "Bash", "DevOps", "Docker", "n8n", "Prometheus", "Web Server", "VPN", "API & Webhooks", "Network", "SQL", "Databases", "Analytics"] },
      { title: "AI Skills", items: ["Claude", "ChatGPT", "Local LLMs", "AI IDEs", "Harness", "AI Architecture", "ComfyUI", "Prompt Engineering", "RAG", "Frontend Development"] },
      { title: "Soft Skills", items: ["Stress Resilience", "Responsiveness", "Communication", "Teamwork", "Empathy & Emotional Intelligence", "Accountability & Owning Mistakes", "Critical Thinking"] }
    ]
  }
} satisfies Record<Language, Record<string, unknown>>;

const skillDetails: Record<Language, Record<string, string[]>> = {
  ru: {
    Python: ["Скриптинг и автоматизация", "Парсинг и обработка данных", "API-интеграции", "LLM-ресерчи"],
    JavaScript: ["Скриптинг", "Web-разработка", "Node.js", "API и webhooks"],
    GDScript: ["Наследование", "Конечные автоматы состояний", "Модульная архитектура"],
    Godot: ["2D-разработка", "3D-разработка", "Работа со сценами", "Работа с ресурсами"],
    Linux: ["Администрирование", "Командная строка", "Сети", "Конфигурация", "Безопасность"],
    Bash: ["Скрипты автоматизации", "Скрипты деплоя", "Диагностика систем", "Управление процессами"],
    DevOps: ["Развёртывание на VPS", "Docker Compose", "Миграции и rollback", "Observability", "Управление секретами"],
    Docker: ["Контейнеризация", "Docker Compose", "Docker-сети", "Безопасность", "Образы и volumes"],
    n8n: ["Self-host", "Ноды на JavaScript и Python", "Интеграции", "n8n CLI", "Production-workflows"],
    Prometheus: ["Scrape-конфигурации", "Exporters", "PromQL", "Alert rules", "Мониторинг AI-систем"],
    "Web Server": ["Nginx", "Caddy", "Traefik", "Маршрутизация", "TLS"],
    VPN: ["VLESS", "OpenVPN", "WireGuard", "Shadowsocks и SOCKS5", "Kill switch"],
    "API & Webhooks": ["Разработка API", "Работа с API", "Проектирование webhooks", "Интеграции", "Аутентификация"],
    Network: ["OSI", "TCP/IP", "HTTP(S)", "DNS", "DPI"],
    SQL: ["Схемы и миграции", "CTE и оконные функции", "JSONB", "Аналитические запросы", "Оптимизация"],
    Databases: ["PostgreSQL", "ClickHouse", "Qdrant", "Проектирование схем", "Управление доступом"],
    Analytics: ["Grafana", "Apache Superset", "Metabase", "Разработка дашбордов", "Интеграция данных"],
    Claude: ["Claude Code", "Claude Design", "Claude API", "Понимание моделей"],
    ChatGPT: ["Codex", "OpenAI API", "Embeddings API", "Оценка качества моделей", "Понимание моделей"],
    "Local LLMs": ["Локальное развёртывание", "Оптимизация", "Квантование", "Работа с трансформерами", "Опыт работы с разными моделями"],
    "AI IDEs": ["Zed", "Antigravity", "OpenDesign"],
    Harness: ["Hermes", "DeepSeek Harness", "Мультиагентная разработка", "Оркестрация агентов"],
    "AI Architecture": ["PyTorch", "CUDA", "Transformer", "Diffusion"],
    ComfyUI: ["Построение пайплайнов", "Diffusion-промптинг", "Работа с моделями"],
    "Prompt Engineering": ["Стандарты промптинга", "Разные семейства моделей", "Промптинг под разные архитектуры", "Системные промпты и guardrails", "Regression-тестирование"],
    RAG: ["Qdrant", "Wiki-RAG", "Чанкование", "Метаданные и фильтрация", "Оценка retrieval"],
    "Frontend Development": ["React и TypeScript", "Vite и Tailwind CSS", "Адаптивные интерфейсы", "WebSocket и SSE", "Тестирование UI"],
    Стрессоустойчивость: ["Работа с production-инцидентами", "Решения в условиях неопределённости", "Приоритизация критических задач", "Сохранение качества под нагрузкой"],
    Отзывчивость: ["Быстрая реакция на обратную связь", "Помощь коллегам", "Передача знаний", "Проактивное выявление проблем"],
    Коммуникабельность: ["Общение с техническими и бизнес-командами", "Формализация требований", "Техническая документация", "Презентация результатов", "Русский и английский языки"],
    "Умение работать в команде": ["Управление командой поддержки", "Межфункциональное взаимодействие", "Декомпозиция задач", "Ревью", "Передача технического контекста"],
    "Эмпатия и эмоциональный интеллект": ["Понимание потребностей пользователей", "Работа со сложными обращениями", "Адаптация тона коммуникации", "Корректная эскалация", "Развитие команды"],
    "Ответственность и принятие ошибок": ["Ответственность за production", "Анализ собственных ошибок", "Rollback-планы", "Документирование инцидентов", "Предотвращение повторных ошибок"],
    "Критическое мышление": ["Root cause analysis", "Проверка гипотез на данных", "Сравнение альтернатив", "Поиск пограничных сценариев", "Оценка AI-систем"],
  },
  en: {
    Python: ["Automation scripting", "Parsing and data processing", "API integrations", "LLM research"],
    JavaScript: ["Scripting", "Web development", "Node.js", "APIs and webhooks"],
    GDScript: ["Inheritance", "Finite state machines", "Modular architecture"],
    Godot: ["2D development", "3D development", "Scene workflows", "Resource management"],
    Linux: ["Administration", "Command line", "Networking", "Configuration", "Security"],
    Bash: ["Automation scripts", "Deployment scripts", "System diagnostics", "Process management"],
    DevOps: ["VPS deployments", "Docker Compose", "Migrations and rollback", "Observability", "Secrets management"],
    Docker: ["Containerization", "Docker Compose", "Docker networking", "Security", "Images and volumes"],
    n8n: ["Self-hosting", "JavaScript and Python nodes", "Integrations", "n8n CLI", "Production workflows"],
    Prometheus: ["Scrape configuration", "Exporters", "PromQL", "Alert rules", "AI system monitoring"],
    "Web Server": ["Nginx", "Caddy", "Traefik", "Routing", "TLS"],
    VPN: ["VLESS", "OpenVPN", "WireGuard", "Shadowsocks and SOCKS5", "Kill switch"],
    "API & Webhooks": ["API development", "API consumption", "Webhook design", "Integrations", "Authentication"],
    Network: ["OSI", "TCP/IP", "HTTP(S)", "DNS", "DPI"],
    SQL: ["Schemas and migrations", "CTEs and window functions", "JSONB", "Analytical queries", "Optimization"],
    Databases: ["PostgreSQL", "ClickHouse", "Qdrant", "Schema design", "Access control"],
    Analytics: ["Grafana", "Apache Superset", "Metabase", "Dashboard development", "Data integration"],
    Claude: ["Claude Code", "Claude Design", "Claude API", "Model understanding"],
    ChatGPT: ["Codex", "OpenAI API", "Embeddings API", "Model evaluation", "Model understanding"],
    "Local LLMs": ["Local deployment", "Optimization", "Quantization", "Transformer workflows", "Multi-model experience"],
    "AI IDEs": ["Zed", "Antigravity", "OpenDesign"],
    Harness: ["Hermes", "DeepSeek Harness", "Multi-agent development", "Agent orchestration"],
    "AI Architecture": ["PyTorch", "CUDA", "Transformer", "Diffusion"],
    ComfyUI: ["Pipeline design", "Diffusion prompting", "Model workflows"],
    "Prompt Engineering": ["Prompting standards", "Model family nuances", "Architecture-specific prompting", "System prompts and guardrails", "Regression testing"],
    RAG: ["Qdrant", "Wiki RAG", "Chunking", "Metadata and filtering", "Retrieval evaluation"],
    "Frontend Development": ["React and TypeScript", "Vite and Tailwind CSS", "Responsive interfaces", "WebSocket and SSE", "UI testing"],
    "Stress Resilience": ["Production incident response", "Decisions under uncertainty", "Critical task prioritization", "Quality under pressure"],
    Responsiveness: ["Fast feedback response", "Helping teammates", "Knowledge sharing", "Proactive issue discovery"],
    Communication: ["Technical and business communication", "Requirement formalization", "Technical documentation", "Results presentation", "Russian and English"],
    Teamwork: ["Support team leadership", "Cross-functional collaboration", "Task decomposition", "Review", "Technical handoffs"],
    "Empathy & Emotional Intelligence": ["Understanding user needs", "Handling difficult requests", "Tone adaptation", "Responsible escalation", "Team development"],
    "Accountability & Owning Mistakes": ["Production ownership", "Learning from mistakes", "Rollback planning", "Incident documentation", "Recurrence prevention"],
    "Critical Thinking": ["Root cause analysis", "Data-backed hypothesis testing", "Trade-off analysis", "Edge-case discovery", "AI system evaluation"],
  },
};

function GlitchLabel({ children, idle = false }: { children: string; idle?: boolean }) {
  return <span className={`glitch-label${idle ? " glitch-label--idle" : ""}`}><span>{children}</span><span className="glitch-label__ghost glitch-label__ghost--magenta" aria-hidden>{children}</span><span className="glitch-label__ghost glitch-label__ghost--cyan" aria-hidden>{children}</span></span>;
}

function Icon({ name }: { name: "download" | "close" | "phone" | "mail" | "telegram" }) {
  const paths: Record<typeof name, ReactNode> = {
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 20h14"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    phone: <path d="M7 3H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2c-3.5-1.5-5.5-3.5-7-7l2-2-2-5Z"/>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></>,
    telegram: <path d="m21 3-4 18-6-5-4 3 1-5 9-8-11 7-4-1 19-9Z"/>
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

function useReveal() {
  useEffect(() => {
    const elements = [...document.querySelectorAll<HTMLElement>(".reveal")];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function ReactBitsBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="crt-field" aria-hidden="true">
      <CRTWarp
        color="#c755f7"
        backgroundColor="#05010a"
        speed={0.3}
        curvature={0.27}
        scanlineStrength={0.84}
        scanlineFrequency={215}
        waveAmplitude={0.39}
        waveFrequency={2.5}
        bloom={1.5}
        bloomRadius={1.8}
        noise={0.1}
        vignette={0}
        brightness={1.25}
        pixelation={1}
        rgbShift={0.013}
        mouseReact={!reduceMotion}
        mouseStrength={0.5}
        dpr={0.75}
        fps={30}
        paused={Boolean(reduceMotion)}
      />
    </div>
  );
}

function ReactBitsAsciiHero() {
  return (
    <div className="ascii-hero-stage" role="img" aria-label="portfolio ASCII animation">
      <ASCIIText
        text="portfolio"
        asciiFontSize={10}
        textFontSize={200}
        textColor="#fdf9f3"
        planeBaseHeight={8}
        enableWaves={false}
      />
    </div>
  );
}

function ProfileCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    canvas.width = 480;
    canvas.height = 600;
    const gradient = context.createLinearGradient(0, 0, 480, 600);
    gradient.addColorStop(0, "#210734");
    gradient.addColorStop(1, "#c755f7");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 480, 600);
    context.strokeStyle = "#fdf9f3";
    for (let i = 0; i < 12; i++) {
      context.strokeRect(35 + i * 12, 90 + i * 14, 380 - i * 24, 420 - i * 28);
    }
  }, []);
  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || reduceMotion || !stageRef.current || !cardRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      cardRef.current.dataset.tilting = "true";
      cardRef.current.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translate3d(${x * 8}px,${y * 8}px,0) scale(1.02)`;
      cardRef.current.style.setProperty("--glare-x", `${(x + .5) * 100}%`);
      cardRef.current.style.setProperty("--glare-y", `${(y + .5) * 100}%`);
    });
  };
  const reset = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (!cardRef.current) return;
    delete cardRef.current.dataset.tilting;
    cardRef.current.style.transform = "";
    cardRef.current.style.removeProperty("--glare-x");
    cardRef.current.style.removeProperty("--glare-y");
  };
  return <div ref={stageRef} className="comet-card-stage" onPointerMove={move} onPointerLeave={reset}><div ref={cardRef} className="comet-card"><canvas ref={canvasRef} role="img" aria-label="Абстрактная демонстрационная карточка"/><div className="error-strip" aria-hidden><span className="error-glitch" data-text="ERROR">ERROR</span></div><div className="crt-card-overlay" aria-hidden/><div className="comet-card-glare" aria-hidden/></div></div>;
}

function TypedProfile({ lines }: { lines: string[] }) {
  const triggerRef = useRef<HTMLParagraphElement>(null);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reset = setTimeout(() => setProgress(reduced ? 999 : 0), 0);
    if (reduced) return () => clearTimeout(reset);
    const timer = setInterval(() => setProgress(value => value >= Math.max(...lines.map(line => line.length)) ? value : value + 1), 38);
    return () => { clearTimeout(reset); clearInterval(timer); };
  }, [lines, started]);
  return <>{lines.map((line, index) => <p ref={index === 0 ? triggerRef : undefined} key={line} className={`${index === 0 ? "profile-card-name" : index === 1 ? "profile-card-role" : ""} text-type`}><span className="sr-only">{line}</span><span aria-hidden="true">{line.slice(0, progress)}</span></p>)}</>;
}

function Modal({ open, onClose, children, className = "", label }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; if (!dialog) return;
    if (open && !dialog.open) dialog.showModal(); else if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return <dialog ref={ref} className={`dialog ${className}`} aria-label={label} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>{children}</dialog>;
}

function ResumeModal({ open, onClose, language }: { open: boolean; onClose: () => void; language: Language }) {
  const t = copy[language];
  return <Modal open={open} onClose={onClose} className="resume-dialog" label="About this demo">
    <div className="dialog-inner">
      <div className="dialog-head"><h2>AI Automation Engineer</h2>
        <GlassButton size="icon" type="button" aria-label={t.close as string} onClick={onClose}><Icon name="close" /></GlassButton>
      </div>
      <p className="resume-summary">{language === "ru"
        ? "Обезличенная демонстрация интерфейса портфолио: адаптивная сетка навыков, интерактивные вкладки и анимация с учётом reduced motion."
        : "An anonymous portfolio interface demo: responsive skill cards, interactive tabs, and animations with reduced motion support."}</p>
    </div>
  </Modal>;
}

function SkillsStack({ language, onSelect }: { language: Language; onSelect: (skill: string) => void }) {
  const groups = copy[language].skills;
  const stackRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    let cancelled = false;
    let cleanup = () => {};
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(min-width: 761px) and (prefers-reduced-motion: no-preference)", () => {
        const chapters = gsap.utils.toArray<HTMLElement>(".skill-chapter", stack);
        gsap.set(chapters, { autoAlpha: 0, x: 0, skewX: 0, scaleX: 1, clipPath: "inset(0% 0% 0% 0%)", filter: "none" });
        gsap.set(chapters[0], { autoAlpha: 1 });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: stack,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        chapters.slice(1).forEach((chapter, index) => {
          const transitionStart = index + .6;
          timeline
            .to(chapters[index], {
              autoAlpha: 0,
              x: index % 2 === 0 ? -8 : 8,
              filter: "drop-shadow(6px 0 #ff2d72) drop-shadow(-6px 0 #63f5ff)",
              duration: .4,
              ease: "none",
            }, transitionStart)
            .set(chapter, {
              autoAlpha: 0,
              x: -18,
              skewX: -2,
              scaleX: .985,
              clipPath: "inset(6% 0% 76% 0%)",
              filter: "brightness(1.7) contrast(1.8) saturate(1.7) drop-shadow(10px 0 #ff2d72) drop-shadow(-10px 0 #63f5ff)",
            }, transitionStart)
            .to(chapter, {
              autoAlpha: .24,
              x: 16,
              skewX: 1.6,
              scaleX: 1.012,
              clipPath: "inset(66% 0% 6% 0%)",
              duration: .05,
              ease: "none",
            }, transitionStart)
            .to(chapter, {
              autoAlpha: .46,
              x: -13,
              skewX: -1.4,
              scaleX: .99,
              clipPath: "inset(24% 0% 48% 0%)",
              filter: "brightness(1.45) contrast(1.65) saturate(1.5) drop-shadow(-9px 0 #ff2d72) drop-shadow(9px 0 #63f5ff)",
              duration: .05,
              ease: "none",
            }, transitionStart + .05)
            .to(chapter, {
              autoAlpha: .64,
              x: 11,
              skewX: 1.2,
              scaleX: 1.008,
              clipPath: "inset(48% 0% 18% 0%)",
              filter: "brightness(1.55) contrast(1.7) saturate(1.6) drop-shadow(8px 0 #ff2d72) drop-shadow(-8px 0 #63f5ff)",
              duration: .06,
              ease: "none",
            }, transitionStart + .1)
            .to(chapter, {
              autoAlpha: .78,
              x: -8,
              skewX: -.8,
              scaleX: .995,
              clipPath: "inset(12% 0% 38% 0%)",
              filter: "brightness(1.3) contrast(1.45) drop-shadow(-6px 0 #ff2d72) drop-shadow(6px 0 #63f5ff)",
              duration: .06,
              ease: "none",
            }, transitionStart + .16)
            .to(chapter, {
              autoAlpha: .9,
              x: 5,
              skewX: .4,
              scaleX: 1.004,
              clipPath: "inset(0% 0% 16% 0%)",
              filter: "brightness(1.15) contrast(1.25) drop-shadow(3px 0 #ff2d72) drop-shadow(-3px 0 #63f5ff)",
              duration: .06,
              ease: "none",
            }, transitionStart + .22)
            .to(chapter, {
              autoAlpha: 1,
              x: 0,
              skewX: 0,
              scaleX: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              filter: "none",
              duration: .12,
              ease: "none",
            }, transitionStart + .28);
        });
        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          gsap.set(chapters, { clearProps: "opacity,visibility,transform,clipPath,filter" });
        };
      });
      cleanup = () => media.revert();
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [language]);
  return <section ref={stackRef} className="skills-stack" aria-label={language === "ru" ? "Навыки" : "Skills"}>
    <div className="skills-stack-viewport">
      {groups.map((group, groupIndex) => {
        const variant = (["hard", "ai", "soft"] as const)[groupIndex];
        return <article className="skill-chapter" key={group.title}>
          <div className="skill-chapter-surface">
            <div className="container skill-chapter-inner">
              <header className="skill-chapter-head"><h2>{group.title}</h2></header>
              <SkillBento items={group.items} variant={variant} label={group.title} onItemClick={onSelect} />
            </div>
          </div>
        </article>;
      })}
    </div>
  </section>;
}

function SkillModal({ skill, details, onClose, closeLabel, language, variant }: { skill: string | null; details: string[]; onClose: () => void; closeLabel: string; language: Language; variant: "hard" | "ai" | "soft" }) {
  return <Modal open={Boolean(skill)} onClose={onClose} className="skill-dialog" label={skill || "Skill"}>
    <div className="dialog-inner">
      <div className="dialog-head">
        <h2>{skill}</h2>
        <GlassButton size="icon" className="glass-control dialog-icon-control rounded-full" type="button" aria-label={closeLabel} onClick={onClose}><Icon name="close" /></GlassButton>
      </div>
      {skill ? <SkillFeatureTabs key={skill} skill={skill} items={details} label={language === "ru" ? `Поднавыки: ${skill}` : `Subskills: ${skill}`} language={language} variant={variant} /> : null}
    </div>
  </Modal>;
}

export function Portfolio() {
  const [language, setLanguage] = useState<Language>("ru");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const t = copy[language];
  const selectedSkillGroup = (t.skills as { title: string; items: string[] }[]).findIndex(group => group.items.includes(selectedSkill ?? ""));
  const selectedSkillVariant = selectedSkillGroup === 1 ? "ai" : selectedSkillGroup === 2 ? "soft" : "hard";
  useReveal();
  useEffect(() => {
    const saved = localStorage.getItem("portfolio-language");
    const timer = saved === "en" ? setTimeout(() => setLanguage("en"), 0) : undefined;
    return () => { if (timer) clearTimeout(timer); };
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("portfolio-language", language);
  }, [language]);
  const changeLanguage = (next: Language) => setLanguage(next);
  return <>
    <ReactBitsBackground/>
    <main id="content">
      <section className="hero" id="home">
        <div className="hero-language" role="group" aria-label="Язык / Language">
          <button
            type="button"
            className="language-word"
            aria-pressed={language === "ru"}
            onClick={() => changeLanguage("ru")}
          >
            RU
          </button>
          <span className="language-separator" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className="language-word"
            aria-pressed={language === "en"}
            onClick={() => changeLanguage("en")}
          >
            ENG
          </button>
        </div>
        <ReactBitsAsciiHero/><div className="container hero-inner"><div className="hero-type-component reveal"><p className="hero-desc">{t.hero as string}</p></div></div>
      </section>
      <section className="profile-card-section" aria-label="Профиль"><div className="container"><div className="profile-card-grid reveal"><div className="hero-art-slot"><ProfileCard/></div><div className="profile-card-info"><TypedProfile lines={t.profile as string[]}/><div className="profile-resume-wrap"><GlassButton size="lg" glowEffect className="primary-glass glitch-trigger rounded-full font-mono text-xs font-bold tracking-[.045em]" onClick={() => setResumeOpen(true)}><GlitchLabel idle>{t.profileCta as string}</GlitchLabel></GlassButton></div></div></div></div></section>
      <SkillsStack language={language} onSelect={setSelectedSkill} />
    </main>
    <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} language={language}/>
    <SkillModal
      skill={selectedSkill}
      details={selectedSkill ? skillDetails[language][selectedSkill] ?? [] : []}
      onClose={() => setSelectedSkill(null)}
      closeLabel={t.close as string}
      language={language}
      variant={selectedSkillVariant}
    />
  </>;
}
