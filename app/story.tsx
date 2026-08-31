"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  CircleHelp,
  Headphones,
  MessageCircleMore,
  MousePointer2,
  Quote,
  Sparkles,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import rawData from "./data/noise-data.json";

type ScoreKey = "autonomy" | "competence" | "relatedness";
type Sentiment = "Positive" | "Negative";

type Profile = {
  label: string;
  ageGroup: string;
  gender: string;
  sector: string;
  scores: Record<ScoreKey, number> & { rating?: number };
};

type WordRecord = {
  word: string;
  sentiment: Sentiment;
  category: string;
  ageGroup: string;
  gender: string;
  sector: string;
  weight: number;
  sessions: number;
};

type StoryData = {
  meta: {
    participants: number;
    sessions: number;
    analysisRecords: number;
    period: string;
    source: string;
  };
  profiles: Profile[];
  scoreDistribution: Record<ScoreKey, Record<string, number>>;
  ratingDistribution: Record<string, number>;
  wordRecords: WordRecord[];
  quotes: Record<string, Partial<Record<Sentiment, string[]>>>;
};

const data = rawData as unknown as StoryData;

const COLORS = {
  // Approved web circle palette, tuned to the Noise Solution theme.
  autonomy: "#c7fd14",
  competence: "#35d9ff",
  relatedness: "#9f73fc",
  rating: "#7c2932",
  positive: "#b8ff00",
  negative: "#8c5bff",
  orange: "#ff7138",
  green: "#38db99",
};


const DENSITY = {
  // Tableau density-palette approximations, tuned from the source workbook and rendered view.
  // These are deliberately multi-stop ramps rather than generic neon colours.
  blueDark: { low: "#2a5783", mid: "#2fb9d6", hot: "#6feaf5" },
  // Tuned to the Tableau Density Green Dark / Density Red Dark appearance
  // shown in the source workbook: dark outer shell, saturated colour, hot yellow core.
  greenDark: { low: "#284840", mid: "#008048", hot: "#fff35a" },
  goldDark: { low: "#494339", mid: "#c69d25", hot: "#fce960" },
  redDark: { low: "#503030", mid: "#e85028", hot: "#ffe63f" },
  grayRedLight: { low: "#77475f", mid: "#c17898", hot: "#e8bac8" },
};

type DensityPalette = (typeof DENSITY)[keyof typeof DENSITY];

function densityVars(palette: DensityPalette, index: number) {
  return {
    "--density-low": palette.low,
    "--density-mid": palette.mid,
    "--density-hot": palette.hot,
    "--mark-index": index,
  } as React.CSSProperties;
}

const APPROVED_DISTRIBUTION_NEON = {
  outerBlur: 5.9,
  innerBlur: 1.0,
  crispStroke: 4.8,
  outerStrength: 3.8,
  innerStrength: 0.7,
  linePitch: 7.3,
};

const APPROVED_DISTRIBUTION_PALETTE: Record<ScoreKey, { outer: string; inner: string; crisp: string }> = {
  autonomy: { outer: "#5c9f00", inner: "#efffc9", crisp: "#c7fd14" },
  competence: { outer: "#087f99", inner: "#dcfaff", crisp: "#35d9ff" },
  relatedness: { outer: "#5c3ba3", inner: "#efe7ff", crisp: "#9f73fc" },
};

const APPROVED_RED_NEON = {
  outer: "#7b2730",
  inner: "#ffe1e3",
  crisp: "#e15759",
  outerBlur: 4.4,
  innerBlur: 4.0,
  crispStroke: 4.6,
  outerStrength: 5.7,
  innerStrength: 1.9,
  linePitch: 16.0,
};

function ApprovedDistributionNeonMark({ id, index, dimension }: { id: string; index: number; dimension: ScoreKey }) {
  const outerId = `${id}-outer`;
  const innerId = `${id}-inner`;
  const palette = APPROVED_DISTRIBUTION_PALETTE[dimension];
  return (
    <i className="approved-neon-mark" style={{ "--mark-index": index } as React.CSSProperties}>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id={outerId} filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="72" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={APPROVED_DISTRIBUTION_NEON.outerBlur} result="blur" />
            <feComponentTransfer in="blur" result="boostedOuter">
              <feFuncA type="linear" slope={APPROVED_DISTRIBUTION_NEON.outerStrength} />
            </feComponentTransfer>
          </filter>
          <filter id={innerId} filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="72" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={APPROVED_DISTRIBUTION_NEON.innerBlur} result="blur" />
            <feComponentTransfer in="blur" result="boostedInner">
              <feFuncA type="linear" slope={APPROVED_DISTRIBUTION_NEON.innerStrength} />
            </feComponentTransfer>
          </filter>
        </defs>
        <line x1="8" y1="16" x2="92" y2="16" stroke={palette.outer} strokeWidth={APPROVED_DISTRIBUTION_NEON.crispStroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${outerId})`} opacity=".95" />
        <line x1="8" y1="16" x2="92" y2="16" stroke={palette.inner} strokeWidth={APPROVED_DISTRIBUTION_NEON.crispStroke * 0.48} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${innerId})`} opacity=".82" />
        <line x1="8" y1="16" x2="92" y2="16" stroke={palette.crisp} strokeWidth={APPROVED_DISTRIBUTION_NEON.crispStroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </i>
  );
}

function ApprovedRedNeonMark({ id, index }: { id: string; index: number }) {
  const outerId = `${id}-outer`;
  const innerId = `${id}-inner`;
  return (
    <i className="approved-red-neon-mark" style={{ "--mark-index": index } as React.CSSProperties}>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id={outerId} filterUnits="userSpaceOnUse" x="-24" y="-24" width="148" height="80" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={APPROVED_RED_NEON.outerBlur} result="blur" />
            <feComponentTransfer in="blur" result="boostedOuter">
              <feFuncA type="linear" slope={APPROVED_RED_NEON.outerStrength} />
            </feComponentTransfer>
          </filter>
          <filter id={innerId} filterUnits="userSpaceOnUse" x="-24" y="-24" width="148" height="80" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={APPROVED_RED_NEON.innerBlur} result="blur" />
            <feComponentTransfer in="blur" result="boostedInner">
              <feFuncA type="linear" slope={APPROVED_RED_NEON.innerStrength} />
            </feComponentTransfer>
          </filter>
        </defs>
        <line x1="8" y1="16" x2="92" y2="16" stroke={APPROVED_RED_NEON.outer} strokeWidth={APPROVED_RED_NEON.crispStroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${outerId})`} opacity=".95" />
        <line x1="8" y1="16" x2="92" y2="16" stroke={APPROVED_RED_NEON.inner} strokeWidth={APPROVED_RED_NEON.crispStroke * 0.48} strokeLinecap="round" vectorEffect="non-scaling-stroke" filter={`url(#${innerId})`} opacity=".82" />
        <line x1="8" y1="16" x2="92" y2="16" stroke={APPROVED_RED_NEON.crisp} strokeWidth={APPROVED_RED_NEON.crispStroke} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </i>
  );
}

const dimensions: Array<{ key: ScoreKey; label: string; description: string }> = [
  { key: "autonomy", label: "Autonomy", description: "feeling in control" },
  { key: "competence", label: "Competence", description: "feeling good at something" },
  { key: "relatedness", label: "Relatedness", description: "feeling seen" },
];

function useInViewReplay<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      setIsVisible(rect.bottom > window.innerHeight * 0.08 && rect.top < window.innerHeight * 0.9);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(node);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [rootMargin]);

  return { ref, isVisible };
}

function useCircleInViewReplay<T extends HTMLElement>(replayKey: number | string = 0) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Reset whenever the scrollytelling step swaps from the teaching circle
    // to the 35-profile grid, so the newly displayed chart gets its own replay.
    setIsVisible(false);

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    // Circle profiles should start only once the visual is well inside the viewport.
    // This prevents the record-like animation from finishing before the chart is visible.
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "-22% 0px -22% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [replayKey]);

  return { ref, isVisible };
}

function useElementAspect<T extends HTMLElement>(fallback = 1.9) {
  const ref = useRef<T | null>(null);
  const [aspect, setAspect] = useState(fallback);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("ResizeObserver" in window)) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      const next = Math.max(1.35, Math.min(2.7, width / height));
      setAspect((current) => Math.abs(current - next) > 0.03 ? next : current);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, aspect };
}

type StoryStep = {
  kicker: string;
  title: string;
  body: React.ReactNode;
};

function ScrollyChapter({
  id,
  eyebrow,
  title,
  steps,
  renderVisual,
  accent,
}: {
  id: string;
  eyebrow: string;
  title: string;
  steps: StoryStep[];
  renderVisual: (active: number) => React.ReactNode;
  accent: string;
}) {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * 0.42) - Math.abs(b.boundingClientRect.top - window.innerHeight * 0.42));

        if (visible[0]) {
          const index = Number((visible[0].target as HTMLElement).dataset.stepIndex);
          if (Number.isFinite(index)) setActive(index);
        }
      },
      { rootMargin: "-40% 0px -56% 0px", threshold: 0 },
    );

    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });

    return () => observer.disconnect();
  }, [steps.length]);

  return (
    <section id={id} className="story-chapter" style={{ "--chapter-accent": accent } as React.CSSProperties}>
      <header className="chapter-heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </header>
      <div className="scrolly-shell">
        <div className="scroll-steps">
          {steps.map((step, index) => (
            <section
              className={`story-step ${active === index ? "is-active" : ""}`}
              data-step-index={index}
              key={step.title}
              ref={(node) => { stepRefs.current[index] = node; }}
            >
              <article className="step-copy">
              <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
              <p className="step-kicker">{step.kicker}</p>
              <h3>{step.title}</h3>
              <div className="step-body">{step.body}</div>
              </article>
              <div className="mobile-step-visual">{renderVisual(index)}</div>
            </section>
          ))}
        </div>
        <div className="visual-sticky" aria-live="polite">
          {renderVisual(active)}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const bars = [22, 38, 55, 72, 46, 84, 66, 40, 58, 92, 74, 48, 62, 35, 20];
  return (
    <header className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <p className="hero-kicker"><Headphones size={17} /> Noise Solution × Data ChangeMakers</p>
        <h1>The Sound<br />of Progress</h1>
        <p className="hero-deck">
          Noise Solution uses music mentoring to create conditions that support three basic psychological needs: autonomy, competence and relatedness—feeling in control, feeling good at something, and feeling connected to and valued by others. This analysis draws on reflections from 35 young people across 228 mentoring sessions. The results point to an encouraging overall picture, while also showing that progress can look different for each person.
        </p>
        <div className="hero-stats" aria-label="Project overview">
          <div><strong>{data.meta.participants}</strong><span>young people</span></div>
          <div><strong>{data.meta.sessions}</strong><span>mentoring sessions</span></div>
          <div><strong>3</strong><span>basic psychological needs</span></div>
        </div>
      </div>
      <div className="hero-wave" aria-hidden="true">
        {bars.map((height, index) => <i key={index} style={{ height: `${height}%`, animationDelay: `${index * 70}ms` }} />)}
      </div>
      <a className="scroll-cue" href="#impact"><span>Explore the findings</span><ArrowDown size={18} /></a>
    </header>
  );
}

function NeonStack({ label, value, palette }: { label: string; value: number; palette: DensityPalette }) {
  // Match the original Tableau design: percentages are shown in 10-point bands,
  // and each density bar represents one 10-percentage-point band.
  const rawPercentage = (value / data.meta.participants) * 100;
  const percentage = Math.min(100, Math.ceil(rawPercentage / 10) * 10);
  const marks = Math.max(1, percentage / 10);
  return (
    <div className="neon-stack" aria-label={`${label}: ${value} participants, ${percentage} percent`}>
      <div className="neon-label"><span>{label}</span><strong>{value}<small>{percentage}%</small></strong></div>
      <div className="neon-marks" aria-hidden="true">
        {Array.from({ length: marks }, (_, index) => <i key={index} style={densityVars(palette, index)} />)}
      </div>
    </div>
  );
}

function DistributionVisual() {
  const bins = Array.from({ length: 9 }, (_, index) => index + 1);
  const neonInstanceId = useId().replace(/:/g, "");
  const { ref, isVisible } = useInViewReplay<HTMLDivElement>();
  return (
    <div ref={ref} className={`viz-panel distribution-panel motion-panel sound-bars ${isVisible ? "is-playing" : ""}`} key="distribution">
      <div className="viz-heading-row">
        <div><p className="viz-kicker">Three basic psychological needs</p><h3>A positive pattern across all three needs</h3></div>
        <span className="scale-pill">1 not at all · 9 fully supported</span>
      </div>
      <div className="distribution-chart" role="img" aria-label="Participant score distributions for autonomy, competence and relatedness">
        <div className="bin-header"><span />{bins.map((bin) => <b key={bin}>{bin}</b>)}</div>
        {dimensions.map((dimension) => (
          <div className="distribution-row" key={dimension.key}>
            <span>{dimension.label}</span>
            {bins.map((bin) => {
              const count = data.scoreDistribution[dimension.key][String(bin)];
              return <div className="bar-cell" key={bin} title={`${dimension.label}: ${count} participants scored ${bin}`}>
                <div
                  className="bar-stack approved-neon-stack"
                  aria-hidden="true"
                  style={{ "--approved-neon-pitch": `${APPROVED_DISTRIBUTION_NEON.linePitch}px` } as React.CSSProperties}
                >
                  {Array.from({ length: count }, (_, index) => (
                    <ApprovedDistributionNeonMark key={index} id={`${neonInstanceId}-${dimension.key}-${bin}-${index}`} index={index} dimension={dimension.key} />
                  ))}
                </div>
                {count > 0 && <span className="bar-count" aria-hidden="true">{count}</span>}
              </div>;
            })}
          </div>
        ))}
      </div>
      <div className="dimension-key">
        {dimensions.map((item) => {
          const palette = APPROVED_DISTRIBUTION_PALETTE[item.key];
          return <span key={item.key}><i style={{ background: palette.crisp, boxShadow: `0 0 6px ${palette.outer}` }} />{item.label}</span>;
        })}
      </div>
      <p className="viz-note">1 capsule = 1 participant. Most participant averages sit between 5 and 7 on the 1–9 scale. Competence is strongest overall; relatedness varies most.</p>
    </div>
  );
}

function RatingVisual() {
  const bins = [7, 8, 9, 10];
  const redNeonInstanceId = useId().replace(/:/g, "");
  const { ref, isVisible } = useInViewReplay<HTMLDivElement>();
  return (
    <div ref={ref} className={`viz-panel rating-panel motion-panel sound-bars ${isVisible ? "is-playing" : ""}`} key="ratings">
      <div className="viz-heading-row">
        <div><p className="viz-kicker">Young people&apos;s own view</p><h3>Young people rated their experiences highly</h3></div>
        <span className="scale-pill rating">Observed 0–10 scale</span>
      </div>
      <div className="rating-summary"><strong>10</strong><span>is the most common rounded participant average</span></div>
      <div className="rating-chart" role="img" aria-label="Distribution of participant overall session ratings">
        {bins.map((bin) => {
          const count = data.ratingDistribution[String(bin)];
          return (
            <div className="rating-column" key={bin}>
              <div
                className="rating-marks approved-red-neon-stack"
                style={{ "--approved-red-neon-pitch": `${APPROVED_RED_NEON.linePitch}px` } as React.CSSProperties}
              >
                {Array.from({ length: count }, (_, index) => (
                  <ApprovedRedNeonMark key={index} id={`${redNeonInstanceId}-${bin}-${index}`} index={index} />
                ))}
              </div>
              <span className="rating-count">{count} participant{count === 1 ? "" : "s"}</span>
              <strong>{bin}</strong>
            </div>
          );
        })}
      </div>
      <p className="viz-note">Overall ratings were available for 30 of the 35 participants. Their rounded averages range from 7 to 10, with 10 the most common.</p>
    </div>
  );
}

function ImpactVisual({ active }: { active: number }) {
  if (active === 0) return <DistributionVisual />;
  return <RatingVisual />;
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, endAngle);
  const end = polar(cx, cy, radius, startAngle);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 0 ${end.x} ${end.y}`;
}

function CircleProfile({ profile, large = false }: { profile: Profile; large?: boolean }) {
  const glowBaseId = useId().replace(/:/g, "");
  const arcRanges: Record<ScoreKey, [number, number]> = {
    autonomy: [12, 86],
    competence: [104, 178],
    relatedness: [196, 270],
  };
  const scoreBoxPositions: Record<ScoreKey, number> = {
    autonomy: 28,
    competence: 49,
    relatedness: 70,
  };
  return (
    <div className={`profile-visual ${large ? "is-large" : ""}`}>
      <svg viewBox="0 0 150 150" role="img" aria-label={`${profile.label}: AI-derived autonomy ${profile.scores.autonomy.toFixed(1)}, competence ${profile.scores.competence.toFixed(1)}, relatedness ${profile.scores.relatedness.toFixed(1)}; ${profile.scores.rating !== undefined ? `participant overall rating ${profile.scores.rating.toFixed(1)}` : "participant overall rating not available"}`}>
        <defs>
          {dimensions.map((dimension) => (
            <filter key={dimension.key} id={`${glowBaseId}-${dimension.key}`} filterUnits="userSpaceOnUse" x="-20" y="-20" width="190" height="190" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="0.3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <g className="profile-record-rings">
          {dimensions.flatMap((dimension) => {
            const score = Math.round(profile.scores[dimension.key]);
            const [start, end] = arcRanges[dimension.key];
            return Array.from({ length: score }, (_, index) => (
              <path
                key={`${dimension.key}-${index}`}
                className="profile-ring"
                d={arcPath(77, 78, 27 + index * 6, start, end)}
                fill="none"
                stroke={COLORS[dimension.key]}
                strokeWidth="1.5"
                strokeLinecap="round"
                pathLength={100}
                filter={`url(#${glowBaseId}-${dimension.key})`}
                style={{ "--ring-index": index } as React.CSSProperties}
              />
            ));
          })}
        </g>
        <g className="profile-score-labels" aria-hidden="true">
          {dimensions.map((dimension) => {
            const x = scoreBoxPositions[dimension.key];
            return (
              <g className="profile-score-box" key={dimension.key}>
                <rect x={x - 9} y="21" width="18" height="14" rx="1.5" fill={COLORS[dimension.key]} fillOpacity=".58" stroke={COLORS[dimension.key]} strokeWidth=".8" />
                <text x={x} y="28.4">{Math.round(profile.scores[dimension.key])}</text>
              </g>
            );
          })}
        </g>
        {profile.scores.rating !== undefined ? <>
          <circle className="profile-rating-centre" cx="77" cy="78" r="18.5" fill={COLORS.rating} stroke="#b85a63" strokeWidth="1.2" />
          <text x="77" y="82.5" textAnchor="middle" className="rating-text profile-rating-value">{Math.round(profile.scores.rating)}</text>
        </> : <>
          <circle className="profile-rating-centre profile-rating-missing" cx="77" cy="78" r="18.5" fill={COLORS.rating} stroke="#b85a63" strokeWidth="1.2" />
          <text x="77" y="82.5" textAnchor="middle" className="rating-text profile-rating-value profile-rating-na">NA</text>
        </>}
      </svg>
    </div>
  );
}

function ProfileTooltip({ profile }: { profile: Profile }) {
  return (
    <div className="profile-tooltip">
      <strong>{profile.label}</strong>
      <span>Anonymized participant profile</span>
      <dl>
        {dimensions.map((dimension) => <div key={dimension.key}><dt>{dimension.label}</dt><dd>{profile.scores[dimension.key].toFixed(1)}</dd></div>)}
        <div><dt>Overall rating</dt><dd>{profile.scores.rating !== undefined ? profile.scores.rating.toFixed(1) : "NA"}</dd></div>
      </dl>
    </div>
  );
}

function CircleVisual({ active }: { active: number }) {
  const example = data.profiles[7];
  const { ref, isVisible } = useCircleInViewReplay<HTMLDivElement>(active);

  if (active === 0) {
    return (
      <div ref={ref} className={`viz-panel circle-teach circle-motion motion-panel ${isVisible ? "is-playing" : ""}`} key="teach-circle">
        <div className="circle-teach-visual"><CircleProfile profile={example} large /></div>
        <div className="circle-teach-copy">
          <p className="viz-kicker"><CircleHelp size={15} /> One participant, several perspectives</p>
          <h3>Progress is more than one number.</h3>
          <ul>
            {dimensions.map((dimension) => <li key={dimension.key}><i style={{ background: COLORS[dimension.key] }} /><span><strong>{dimension.label}</strong>{dimension.description} · AI-derived score, 1–9</span></li>)}
            <li className="rating-key-item"><i style={{ background: COLORS.rating }} /><span><strong>Overall rating</strong>The young person&apos;s own rating, 0–10 when stated; NA means it was not available</span></li>
          </ul>
          <p>Together, these perspectives show different parts of the same experience. The overall rating is separate from the three psychological-need scores rather than an average of them.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`viz-panel profile-grid-panel circle-motion motion-panel ${isVisible ? "is-playing" : ""}`} key={`profile-grid-${active}`}>
      <div className="viz-heading-row compact">
        <p className="viz-kicker">35 individual profiles</p>
        <span className="hover-hint"><MousePointer2 size={14} /> Hover for detail</span>
      </div>
      <TooltipProvider delayDuration={80}>
        <div className="profile-grid">
          {data.profiles.map((profile, profileIndex) => (
            <Tooltip key={profile.label}>
              <TooltipTrigger asChild>
                <button
                  aria-label={`View ${profile.label} details`}
                  style={{ "--profile-index": profileIndex } as React.CSSProperties}
                >
                  <CircleProfile profile={profile} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8} className="profile-tooltip-shell"><ProfileTooltip profile={profile} /></TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="dimension-key circle-key">
        {dimensions.map((item) => <span key={item.key}><i style={{ background: COLORS[item.key] }} />{item.label} · AI-derived ring</span>)}
        <span><i style={{ background: COLORS.rating }} />Participant rating · centre (NA if missing)</span>
      </div>
    </div>
  );
}

type CloudMode = "positive" | "negative" | "explore";
type CloudFilter = { sentiment: string; category: string; ageGroup: string; gender: string; sector: string };
type CloudWord = { word: string; sentiment: Sentiment; weight: number; sessions: number; x: number; y: number; fontSize: number };

function layoutWords(words: Array<Omit<CloudWord, "x" | "y" | "fontSize">>, limit = 86): CloudWord[] {
  const selected = words.slice(0, limit);
  if (!selected.length) return [];
  const maxWeight = selected[0].weight;
  const minWeight = selected[selected.length - 1].weight;
  const placed: Array<CloudWord & { width: number; height: number }> = [];
  const width = 1080;
  const height = 520;

  selected.forEach((word, index) => {
    const ratio = maxWeight === minWeight ? 1 : (Math.sqrt(word.weight) - Math.sqrt(minWeight)) / (Math.sqrt(maxWeight) - Math.sqrt(minWeight));
    const fontSize = 16 + ratio * 64;
    const wordWidth = Math.max(18, word.word.length * fontSize * 0.53);
    const wordHeight = fontSize * 0.92;
    let found = false;
    let x = width / 2;
    let y = height / 2;
    const phase = (index * 2.3999632297) % (Math.PI * 2);

    for (let attempt = 0; attempt < 1600; attempt += 1) {
      const radius = 2.1 * Math.pow(attempt, 0.72);
      const angle = phase + attempt * 0.34;
      x = width / 2 + Math.cos(angle) * radius * 1.42;
      y = height / 2 + Math.sin(angle) * radius * 0.92;
      const left = x - wordWidth / 2 - 2;
      const right = x + wordWidth / 2 + 2;
      const top = y - wordHeight / 2 - 1;
      const bottom = y + wordHeight / 2 + 1;
      if (left < 6 || right > width - 6 || top < 6 || bottom > height - 6) continue;
      const collides = placed.some((other) => {
        const ox1 = other.x - other.width / 2 - 2;
        const ox2 = other.x + other.width / 2 + 2;
        const oy1 = other.y - other.height / 2 - 1;
        const oy2 = other.y + other.height / 2 + 1;
        return left < ox2 && right > ox1 && top < oy2 && bottom > oy1;
      });
      if (!collides) { found = true; break; }
    }
    if (found) placed.push({ ...word, x, y, fontSize, width: wordWidth, height: wordHeight });
  });

  return placed.map((word) => ({
    word: word.word,
    sentiment: word.sentiment,
    weight: word.weight,
    sessions: word.sessions,
    x: width / 2 + (word.x - width / 2) * 1.14,
    y: word.y,
    fontSize: word.fontSize,
  }));
}

function wordCloudViewBox(words: CloudWord[], targetAspect: number): string {
  if (!words.length) return "0 0 1000 520";

  const padding = 7;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  words.forEach((word) => {
    const halfWidth = Math.max(18, word.word.length * word.fontSize * 0.53) / 2;
    const halfHeight = word.fontSize * 0.5;
    minX = Math.min(minX, word.x - halfWidth);
    maxX = Math.max(maxX, word.x + halfWidth);
    minY = Math.min(minY, word.y - halfHeight);
    maxY = Math.max(maxY, word.y + halfHeight);
  });

  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  let width = maxX - minX;
  let height = maxY - minY;
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;

  if (width / height < targetAspect) {
    width = height * targetAspect;
  } else {
    height = width / targetAspect;
  }

  return `${centreX - width / 2} ${centreY - height / 2} ${width} ${height}`;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="cloud-filter">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
      </Select>
    </label>
  );
}

function WordCloudVisual({ active }: { active: number }) {
  const requestedMode: CloudMode = active === 0 ? "positive" : active === 1 ? "negative" : "explore";
  const [mode, setMode] = useState<CloudMode>(requestedMode);
  const [filter, setFilter] = useState<CloudFilter>({ sentiment: "All", category: "All", ageGroup: "All", gender: "All", sector: "All" });
  const [selectedWordKey, setSelectedWordKey] = useState<string>("good|Positive");
  const [hoveredWordKey, setHoveredWordKey] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const { ref: cloudStageRef, aspect: cloudAspect } = useElementAspect<HTMLDivElement>();

  useEffect(() => {
    if (requestedMode === mode) return;
    const timer = window.setTimeout(() => setMode(requestedMode), 260);
    return () => window.clearTimeout(timer);
  }, [mode, requestedMode]);

  const cloudWords = useMemo(() => {
    const cloudModes: CloudMode[] = ["positive", "negative", "explore"];
    return Object.fromEntries(cloudModes.map((cloudMode) => {
      const records = data.wordRecords.filter((record) => {
        const sentiment = cloudMode === "positive" ? "Positive" : cloudMode === "negative" ? "Negative" : filter.sentiment;
        return (sentiment === "All" || record.sentiment === sentiment)
          && (filter.category === "All" || record.category === filter.category)
          && (filter.ageGroup === "All" || record.ageGroup === filter.ageGroup)
          && (filter.gender === "All" || record.gender === filter.gender)
          && (filter.sector === "All" || record.sector === filter.sector);
      });
      const grouped = new Map<string, Omit<CloudWord, "x" | "y" | "fontSize">>();
      records.forEach((record) => {
        const key = `${record.word}|${record.sentiment}`;
        const existing = grouped.get(key) ?? { word: record.word, sentiment: record.sentiment, weight: 0, sessions: 0 };
        existing.weight += record.weight;
        existing.sessions += record.sessions;
        grouped.set(key, existing);
      });
      const ranked = Array.from(grouped.values()).sort((a, b) => b.weight - a.weight);
      return [cloudMode, layoutWords(ranked, cloudMode === "explore" ? 88 : 66)];
    })) as Record<CloudMode, CloudWord[]>;
  }, [filter]);

  const words = cloudWords[mode];

  const selected = words.find((word) => `${word.word}|${word.sentiment}` === selectedWordKey) ?? words[0];
  const hovered = hoveredWordKey ? words.find((word) => `${word.word}|${word.sentiment}` === hoveredWordKey) : undefined;
  const displayedWord = hovered ?? selected;
  const quotes = selected ? data.quotes[selected.word]?.[selected.sentiment] ?? [] : [];
  const displayedQuotes = displayedWord ? data.quotes[displayedWord.word]?.[displayedWord.sentiment] ?? [] : [];
  const selectedQuoteKey = selected ? `${selected.word}|${selected.sentiment}` : "";
  const isHoverPreview = Boolean(hovered && `${hovered.word}|${hovered.sentiment}` !== selectedQuoteKey);
  const displayedQuote = displayedQuotes.length ? displayedQuotes[isHoverPreview ? 0 : quoteIndex % displayedQuotes.length] : undefined;

  useEffect(() => {
    setQuoteIndex(0);
  }, [selectedQuoteKey]);

  useEffect(() => {
    setHoveredWordKey(null);
  }, [mode]);

  return (
    <div className={`viz-panel cloud-panel motion-panel cloud-mode-${mode}`}>
      <div className="viz-heading-row compact">
        <div><p className="viz-kicker">Words from young people&apos;s reflections</p><h3>{mode === "positive" ? "What progress sounds like" : mode === "negative" ? "Challenge has a place in the story" : "A fuller picture—in their own words"}</h3></div>
        <div className="sentiment-key"><span><i style={{ background: COLORS.positive }} />Positive</span><span><i style={{ background: COLORS.negative }} />Challenging</span></div>
      </div>
      <div ref={cloudStageRef} className="cloud-stage">
        {(["positive", "negative", "explore"] as CloudMode[]).map((cloudMode) => {
          const layerWords = cloudWords[cloudMode];
          const isActive = cloudMode === mode;
          return <div key={cloudMode} className={`cloud-layer ${isActive ? "is-active" : ""}`} aria-hidden={!isActive}>
            {layerWords.length ? <svg viewBox={wordCloudViewBox(layerWords, cloudAspect)} role={isActive ? "img" : undefined} aria-label={isActive ? `Word cloud showing ${mode === "explore" ? "positive and challenging" : mode} themes` : undefined}>
              {layerWords.map((word, index) => (
                <text
                  key={`${cloudMode}-${word.word}-${word.sentiment}`}
                  x={word.x}
                  y={word.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={word.sentiment === "Positive" ? COLORS.positive : COLORS.negative}
                  fontSize={word.fontSize}
                  className="cloud-word"
                  style={{ "--word-index": Math.min(index, 38), "--word-opacity": isActive && selected && `${selected.word}|${selected.sentiment}` !== `${word.word}|${word.sentiment}` ? 0.77 : 1 } as React.CSSProperties}
                  tabIndex={isActive ? 0 : -1}
                  role={isActive ? "button" : undefined}
                  aria-label={isActive ? `${word.word}, ${word.sentiment.toLowerCase()} theme` : undefined}
                  onMouseEnter={isActive ? () => setHoveredWordKey(`${word.word}|${word.sentiment}`) : undefined}
                  onMouseLeave={isActive ? () => setHoveredWordKey(null) : undefined}
                  onFocus={isActive ? () => { setSelectedWordKey(`${word.word}|${word.sentiment}`); setQuoteIndex(0); } : undefined}
                  onClick={isActive ? () => { setSelectedWordKey(`${word.word}|${word.sentiment}`); setQuoteIndex(0); } : undefined}
                >{word.word}</text>
              ))}
            </svg> : <div className="cloud-empty">No words match these filters.</div>}
          </div>;
        })}
      </div>
      <div className="voice-panel">
        <div>
          <Quote size={19} /><span>In their words</span><strong>{displayedWord?.word ?? "—"}</strong>
          <small style={{ gridColumn: "1 / -1", marginTop: "0.3rem", color: "#c4d1da", fontSize: "0.64rem", letterSpacing: "0.03em", textTransform: "none" }}>Hover to preview · Click a word to lock</small>
        </div>
        <blockquote>
          <span style={{ display: "block" }}>{displayedQuote ? `“${displayedQuote}”` : "Hover or focus on a word to see an anonymized reflection excerpt."}</span>
          {quotes.length > 1 && <button
            type="button"
            disabled={isHoverPreview}
            aria-hidden={isHoverPreview}
            aria-label={`Show another quotation associated with ${selected?.word ?? "this word"}`}
            onClick={() => setQuoteIndex((current) => (current + 1) % quotes.length)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.32rem",
              marginTop: "0.45rem",
              padding: 0,
              border: 0,
              background: "transparent",
              color: "#8fa6b6",
              font: "inherit",
              fontSize: "0.72rem",
              fontStyle: "normal",
              letterSpacing: "0.06em",
              cursor: "pointer",
              visibility: isHoverPreview ? "hidden" : "visible",
            }}
          >Another voice <span aria-hidden="true">↻</span></button>}
        </blockquote>
      </div>
      {mode === "explore" && <div className="cloud-controls" aria-label="Word cloud filters">
        <FilterSelect label="Sentiment" value={filter.sentiment} options={["All", "Positive", "Negative"]} onChange={(sentiment) => setFilter({ ...filter, sentiment })} />
        <FilterSelect label="Theme" value={filter.category} options={["All", "Autonomy", "Competence", "Relatedness", "Overall"]} onChange={(category) => setFilter({ ...filter, category })} />
        <FilterSelect label="Age" value={filter.ageGroup} options={["All", "9–12", "13–18", "19–22", "Unknown"]} onChange={(ageGroup) => setFilter({ ...filter, ageGroup })} />
        <FilterSelect label="Gender" value={filter.gender} options={["All", "Male", "Female", "Unknown"]} onChange={(gender) => setFilter({ ...filter, gender })} />
        <FilterSelect label="Referred by" value={filter.sector} options={["All", "Education", "Local Government", "Mental Health", "Other / unknown"]} onChange={(sector) => setFilter({ ...filter, sector })} />
        <p className="filter-caveat">Filters are exploratory. Small groups and missing demographic values limit comparison.</p>
      </div>}
    </div>
  );
}

function Closing() {
  return (
    <section className="closing">
      <div className="closing-inner">
        <p className="closing-kicker"><Sparkles size={17} /> What the story suggests</p>
        <h2>Progress has a sound.</h2>
        <p className="closing-lead">It sounds like pride, practice, challenge, choice—and young people recognizing what they can do.</p>
        <div className="takeaway-grid">
          <article><strong>01</strong><h3>Progress has more than one dimension</h3><p>Autonomy, competence and relatedness all matter; no single score tells the whole story.</p></article>
          <article><strong>02</strong><h3>No two paths look the same</h3><p>The 35 profiles show why an encouraging group pattern can still contain meaningful individual differences.</p></article>
          <article><strong>03</strong><h3>Voice gives the numbers meaning</h3><p>Young people&apos;s reflections bring context and experience back into the evidence.</p></article>
        </div>
      </div>
    </section>
  );
}

function ProjectContext() {
  const { ref, isVisible } = useInViewReplay<HTMLDivElement>("0px 0px -8% 0px");
  return (
    <section className="project-context" aria-labelledby="project-context-title">
      <div className="project-context-intro">
        <p className="project-context-kicker">Project background &amp; data process</p>
        <div>
          <h2 id="project-context-title">How the evidence behind this story was created.</h2>
          <p>Noise Solution delivers evidence-based music mentoring programmes for young people. Participants work one-to-one with professional musicians to create the music they want to make, while sharing a secure digital story with the people who matter to them.</p>
          <p>After each session, young people usually record a short conversational reflection with their musician. Noise Solution&apos;s prototype model transcribes the reflections, masks sensitive information, analyses the transcripts for concepts central to its theory of change, and returns quantitative scores alongside qualitative highlights. This Data ChangeMakers challenge explored how those results could be brought together in an accessible visual story. The dataset used here covers 35 young people and 228 mentoring sessions from September 2025 to March 2026.</p>
        </div>
      </div>
      <div ref={ref} className={`compact-demographics sound-bars ${isVisible ? "is-playing" : ""}`} aria-labelledby="participant-background-title">
        <div className="compact-demographics-heading">
          <div>
            <p className="viz-kicker">Participant background</p>
            <h3 id="participant-background-title">Who is represented in this dataset?</h3>
          </div>
          <div className="mini-stat"><strong>35</strong><span>young people</span></div>
        </div>
        <div className="compact-demographic-grid">
          <section><h4>Gender</h4><div className="stack-row">
            <NeonStack label="Male" value={9} palette={DENSITY.greenDark} />
            <NeonStack label="Female" value={3} palette={DENSITY.greenDark} />
            <NeonStack label="Not recorded" value={23} palette={DENSITY.greenDark} />
          </div></section>
          <section><h4>Age</h4><div className="stack-row">
            <NeonStack label="9–12" value={6} palette={DENSITY.goldDark} />
            <NeonStack label="13–18" value={21} palette={DENSITY.goldDark} />
            <NeonStack label="19–22" value={8} palette={DENSITY.goldDark} />
          </div></section>
          <section><h4>Referred by</h4><div className="stack-row sector-row">
            <NeonStack label="Education" value={10} palette={DENSITY.redDark} />
            <NeonStack label="Local gov." value={8} palette={DENSITY.redDark} />
            <NeonStack label="Mental health" value={3} palette={DENSITY.redDark} />
            <NeonStack label="Other / unknown" value={14} palette={DENSITY.redDark} />
          </div></section>
        </div>
        <p className="compact-demographics-note">Age was available for all 35 participants. Gender was recorded for 12 participants and referral sector for 25, so those two breakdowns are descriptive background rather than comparative evidence.</p>
      </div>
    </section>
  );
}

function PartnerCredits() {
  return (
    <section className="partner-credits" aria-labelledby="partner-title">
      <div className="partner-heading">
        <p>Project credits</p>
        <h2 id="partner-title">A Data ChangeMakers challenge with Noise Solution.</h2>
      </div>
      <div className="partner-grid">
        <a className="partner-card noise-card" href="https://www.noisesolution.org/what-we-do" target="_blank" rel="noreferrer" aria-label="Visit Noise Solution">
          <span>Programme & data</span>
          {/* Direct local images avoid the framework image service, which is not available in the Windows local runner. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="assets/noise-solution-logo.png" alt="Noise Solution" width="1647" height="1198" loading="lazy" decoding="async" />
        </a>
        <div className="partner-card credit-card">
          <span>Data storytelling & visualization</span>
          <strong>Iris Sun</strong>
          <p>Responsive scrollytelling design, narrative structure and interactive visualization.</p>
        </div>
        <div className="partner-card dcm-card">
          <span>Created with</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="assets/data-changemakers-logo.png" alt="Data ChangeMakers" width="1280" height="1024" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}

export default function Story() {
  const impactSteps: StoryStep[] = [
    {
      kicker: "Across three basic psychological needs",
      title: "The overall picture is encouraging.",
      body: <><p>Taken together, the results are encouraging across autonomy, competence and relatedness.</p><p>Competence stands out most strongly, while relatedness varies more from person to person. The group pattern is positive, but the three needs are not experienced in exactly the same way.</p></>,
    },
    {
      kicker: "Young people’s own view",
      title: "Their own ratings reinforce the positive picture.",
      body: <><p>For 30 participants, a separate overall rating captures their own view of the experience.</p><p>Those ratings are strikingly positive: rounded participant averages range from 7 to 10, and 10 is by far the most common.</p></>,
    },
  ];

  const circleSteps: StoryStep[] = [
    {
      kicker: "One person at a time",
      title: "Progress is more than a single score.",
      body: <><p>A single profile can hold several perspectives at once: feeling in control, feeling good at something and feeling seen do not always move together.</p><p>The young person&apos;s own overall rating adds another viewpoint, helping us see experience as layered rather than one-dimensional.</p></>,
    },
    {
      kicker: "Across 35 young people",
      title: "The overall pattern is positive—but every path looks different.",
      body: <><p>Most profiles show several needs being supported at once, but the balance differs from person to person.</p><p>That variation matters. Group averages can show the direction of the story; individual profiles show how personal progress can be.</p></>,
    },
  ];

  const wordSteps: StoryStep[] = [
    {
      kicker: "What progress sounds like",
      title: "Enjoyment, learning and pride come through clearly.",
      body: <><p>Across positive reflections, young people repeatedly talk about feeling good, playing and making music, having fun, learning and being proud of what they achieved.</p><p>These words give the positive results a human voice: progress is not just a score, but something young people describe in everyday language.</p></>,
    },
    {
      kicker: "Challenge is part of progress",
      title: "Difficult moments sit inside the positive story.",
      body: <><p>Words such as <em>difficult</em>, <em>challenge</em>, <em>hard</em> and <em>nervous</em> also appear in the reflections.</p><p>Rather than contradicting progress, they show that trying something new can include uncertainty, effort and persistence.</p></>,
    },
    {
      kicker: "Both sides belong",
      title: "The fuller story holds both progress and challenge.",
      body: <><p>Positive and challenging language sit side by side across the reflections. Together they show an experience that is active, personal and changing—not simply “good” or “bad”.</p><p>The words add texture to the scores and keep young people&apos;s voices at the centre of the story.</p></>,
    },
  ];

  return (
    <main>
      <Hero />
      <ScrollyChapter id="impact" eyebrow="Chapter one · The overall picture" title="An encouraging pattern emerges" steps={impactSteps} renderVisual={(active) => <ImpactVisual active={active} />} accent={COLORS.positive} />
      <div className="chapter-bridge"><span>Overall picture</span><i /><span>Individual paths</span></div>
      <ScrollyChapter id="profiles" eyebrow="Chapter two · Individual experience" title="One pattern, many personal paths" steps={circleSteps} renderVisual={(active) => <CircleVisual active={active} />} accent={COLORS.negative} />
      <div className="chapter-bridge"><span>What the scores suggest</span><i /><span>What young people say</span></div>
      <ScrollyChapter id="voices" eyebrow="Chapter three · In their own words" title="What progress sounds like" steps={wordSteps} renderVisual={(active) => <WordCloudVisual active={active} />} accent={COLORS.positive} />
      <Closing />
      <ProjectContext />
      <PartnerCredits />
      <footer className="site-footer">
        <div><strong>The Sound of Progress</strong><span>Noise Solution × Data ChangeMakers data story</span></div>
        <p>Data storytelling & visualization by Iris Sun · Data supplied by Noise Solution · Created with Data ChangeMakers</p>
        <p className="footer-note"><MessageCircleMore size={15} /> Anonymized programme data. Individual demographic combinations and participant identifiers are not displayed.</p>
      </footer>
    </main>
  );
}
