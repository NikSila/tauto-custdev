// components.jsx — Concierge design system primitives

const GOLD = "#D4AF6D";
const GOLD_DIM = "#8C7546";
const INK = "#0E0E0E";
const SURFACE = "#171717";
const SURFACE_2 = "#1F1F1F";
const HAIRLINE = "rgba(255,255,255,0.08)";
const HAIRLINE_GOLD = "rgba(212,175,109,0.18)";
const TEXT_DIM = "rgba(255,255,255,0.52)";
const TEXT_MUTED = "rgba(255,255,255,0.72)";

// ─────────── Brand spark — diamond with 4 rays ─────────────
function Spark({ size = 14, color = GOLD, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{
      animation: animate ? "spark-rotate 8s linear infinite" : "none",
      display: "block",
    }}>
      <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z"
        fill={color} />
    </svg>
  );
}

// ─────────── Wordmark ─────────────
function ConciergeMark({ size = 14, color = "#fff" }) {
  return (
    <span style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 400, fontSize: size, color,
      letterSpacing: "0.18em", textTransform: "uppercase",
    }}>Concierge</span>
  );
}

// ─────────── Hairline-bordered card with subtle inner highlight ─────────────
function Card({ children, style = {}, gold = false, onClick, padding = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: gold
        ? "linear-gradient(180deg, rgba(212,175,109,0.06), rgba(212,175,109,0.02))"
        : "linear-gradient(180deg, #181818, #131313)",
      border: `1px solid ${gold ? HAIRLINE_GOLD : HAIRLINE}`,
      borderRadius: 18, padding, position: "relative", overflow: "hidden",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────── Hairline divider ─────────────
function Hairline({ gold = false, style = {} }) {
  return <div style={{
    height: 1, background: gold
      ? "linear-gradient(90deg, transparent, rgba(212,175,109,0.4), transparent)"
      : HAIRLINE,
    ...style,
  }} />;
}

// ─────────── Mono caption (used a lot) ─────────────
function Mono({ children, style = {}, color = TEXT_DIM, size = 10, weight = 400 }) {
  return <span style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: size, fontWeight: weight, color,
    letterSpacing: "0.1em", textTransform: "uppercase",
    ...style,
  }}>{children}</span>;
}

// ─────────── Serif numeral / heading ─────────────
function Serif({ children, size = 28, weight = 400, color = "#fff", style = {} }) {
  return <span style={{
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: weight, fontSize: size, color,
    letterSpacing: "-0.01em", lineHeight: 1.1,
    ...style,
  }}>{children}</span>;
}

// ─────────── Gold pill button ─────────────
function GoldButton({ children, onClick, style = {}, ghost = false, small = false }) {
  return (
    <button onClick={onClick} style={{
      appearance: "none", border: "none", cursor: "pointer",
      height: small ? 36 : 48, padding: small ? "0 16px" : "0 22px",
      borderRadius: 999,
      background: ghost ? "transparent" : "linear-gradient(180deg, #E8C988 0%, #C7A05B 100%)",
      color: ghost ? GOLD : "#1A1308",
      fontFamily: "-apple-system, system-ui",
      fontSize: small ? 13 : 15, fontWeight: 600,
      letterSpacing: "0.02em",
      boxShadow: ghost ? `inset 0 0 0 1px ${HAIRLINE_GOLD}` : "0 6px 24px rgba(212,175,109,0.18), inset 0 1px 0 rgba(255,255,255,0.4)",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
      ...style,
    }}>{children}</button>
  );
}

// ─────────── Ghost icon button (round, hairline) ─────────────
function IconButton({ children, onClick, size = 36, style = {} }) {
  return (
    <button onClick={onClick} style={{
      appearance: "none", border: `1px solid ${HAIRLINE}`,
      width: size, height: size, borderRadius: 999,
      background: "rgba(255,255,255,0.03)", color: "#fff", cursor: "pointer",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      ...style,
    }}>{children}</button>
  );
}

// ─────────── Sparkline (for fuel/odometer/spend) ─────────────
function Sparkline({ data, w = 80, h = 20, color = GOLD }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
    </svg>
  );
}

// ─────────── Custom glyphs (no emoji, no library) ─────────────
const Glyph = {
  fuel: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="9" height="16" rx="1.5" />
      <path d="M4 9h9" />
      <path d="M13 10l3-2v9a2 2 0 002 2 2 2 0 002-2V8l-3-3" />
    </svg>
  ),
  wrench: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 105.4 5.4L20 11l-7.5 7.5a2.1 2.1 0 11-3-3L17 8z"/>
    </svg>
  ),
  shield: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
    </svg>
  ),
  alert: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>
      <path d="M12 9v4" /><circle cx="12" cy="17" r="0.6" fill={c}/>
    </svg>
  ),
  receipt: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/>
      <path d="M9 8h6M9 12h6M9 16h4"/>
    </svg>
  ),
  cap: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13c0-2 5-3 9-3s9 1 9 3v2H3z"/>
      <path d="M7 13c1.5-3 9-3 10 0"/>
    </svg>
  ),
  transponder: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M7 11h6M7 14h4"/>
      <path d="M17 10c1 1 1 3 0 4M19 8c2.5 2 2.5 6 0 8" />
    </svg>
  ),
  road: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21l3-18M19 21l-3-18"/>
      <path d="M12 4v2M12 10v2M12 16v2"/>
    </svg>
  ),
  swap: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h14l-3-3M20 17H6l3 3"/>
    </svg>
  ),
  mic: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="12" rx="3"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3"/>
    </svg>
  ),
  send: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l16-8-6 18-3-7-7-3z"/>
    </svg>
  ),
  arrowRight: (s = 14, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  close: (s = 16, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  back: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  check: (s = 14, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L20 7"/>
    </svg>
  ),
  more: (s = 18, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>
    </svg>
  ),
  pin: (s = 14, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  calendar: (s = 14, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  ),
  card: (s = 14, c = "#fff") => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20M6 16h4"/>
    </svg>
  ),
};

// ─────────── Car silhouette placeholder (no real Kia photo) ─────────────
function CarSilhouette({ width = 320, height = 140 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 320 140" style={{ display: "block" }}>
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5a3a"/>
          <stop offset="0.5" stopColor="#3a2f1c"/>
          <stop offset="1" stopColor="#1a1408"/>
        </linearGradient>
        <linearGradient id="carShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.32"/>
          <stop offset="1" stopColor={GOLD} stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="carShadow" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="160" cy="125" rx="120" ry="8" fill="url(#carShadow)" />
      {/* body */}
      <path d="M30 95
               C 30 78, 50 66, 80 64
               L 110 50
               Q 130 40, 160 40
               L 210 40
               Q 240 42, 260 60
               L 285 70
               Q 295 75, 295 88
               L 295 100
               Q 295 108, 287 108
               L 33 108
               Q 30 108, 30 100 Z"
        fill="url(#carBody)" stroke={HAIRLINE_GOLD} strokeWidth="0.5"/>
      {/* greenhouse */}
      <path d="M115 58 L 145 44 L 205 44 L 235 60 L 235 70 L 115 70 Z"
        fill="#1a1408" stroke={HAIRLINE_GOLD} strokeWidth="0.5" />
      {/* door line */}
      <path d="M170 70 L 170 105" stroke={HAIRLINE} strokeWidth="0.5" />
      {/* window shine */}
      <path d="M120 60 L 145 48 L 200 48 L 215 60 Z" fill="url(#carShine)" />
      {/* highlight */}
      <path d="M40 92 Q 160 85, 280 92" stroke={GOLD} strokeOpacity="0.18" strokeWidth="1" fill="none"/>
      {/* wheels */}
      <circle cx="85" cy="108" r="16" fill="#080808" stroke={HAIRLINE} strokeWidth="0.5"/>
      <circle cx="85" cy="108" r="9" fill="#1a1a1a"/>
      <circle cx="85" cy="108" r="3" fill={GOLD_DIM}/>
      <circle cx="240" cy="108" r="16" fill="#080808" stroke={HAIRLINE} strokeWidth="0.5"/>
      <circle cx="240" cy="108" r="9" fill="#1a1a1a"/>
      <circle cx="240" cy="108" r="3" fill={GOLD_DIM}/>
      {/* headlight */}
      <ellipse cx="290" cy="86" rx="6" ry="2.5" fill={GOLD} opacity="0.7"/>
    </svg>
  );
}

Object.assign(window, {
  GOLD, GOLD_DIM, INK, SURFACE, SURFACE_2, HAIRLINE, HAIRLINE_GOLD, TEXT_DIM, TEXT_MUTED,
  Spark, ConciergeMark, Card, Hairline, Mono, Serif, GoldButton, IconButton, Sparkline,
  Glyph, CarSilhouette,
});
