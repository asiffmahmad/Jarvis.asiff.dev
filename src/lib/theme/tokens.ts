/**
 * JARVIS Content Automation Suite — Design Tokens
 *
 * All design tokens from the JARVIS Design DNA specification.
 * These constants are the single source of truth for the design system.
 * Use these in TypeScript; the CSS custom properties in globals.css
 * mirror these values for stylesheet usage.
 */

/* ------------------------------------------------------------------ */
/*  Color Palette                                                      */
/* ------------------------------------------------------------------ */

export const colors = {
  /** Deep space backgrounds */
  background: {
    deepest: "#06090F",
    deep: "#081018",
    base: "#0D131C",
  },

  /** Glass panel surfaces */
  panel: {
    base: "#101A25",
    elevated: "#111B28",
  },

  /** Primary neon glow — cyan-teal */
  primary: "#34F5D0",

  /** Secondary glow — bright cyan */
  secondary: "#5CF5FF",

  /** Accent — purple */
  accent: "#8A5CFF",

  /** Semantic status colors */
  success: "#42FF98",
  warning: "#F8E36B",
  danger: "#FF5E7D",

  /** Text hierarchy */
  text: {
    primary: "#F4F8FB",
    secondary: "#9EB4C7",
    muted: "#607488",
  },

  /** Transparent overlays */
  overlay: {
    light: "rgba(52, 245, 208, 0.05)",
    medium: "rgba(52, 245, 208, 0.10)",
    heavy: "rgba(52, 245, 208, 0.15)",
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Typography                                                         */
/* ------------------------------------------------------------------ */

export const typography = {
  /** Heading font — futuristic geometric */
  heading: "'Orbitron', sans-serif",

  /** Body font — clean readable sans-serif */
  body: "'Inter', sans-serif",

  /** Font size scale (rem) */
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },

  /** Font weight scale */
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  /** Line height scale */
  leading: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Spacing (8px Grid System)                                          */
/* ------------------------------------------------------------------ */

export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

/* ------------------------------------------------------------------ */
/*  Border Radius                                                      */
/* ------------------------------------------------------------------ */

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "14px",
  xl: "18px",
  full: "9999px",
} as const;

/* ------------------------------------------------------------------ */
/*  Shadows & Glows                                                    */
/* ------------------------------------------------------------------ */

export const shadows = {
  /** Soft cyan ambient glow */
  glow: {
    sm: "0 0 10px rgba(52, 245, 208, 0.15)",
    md: "0 0 20px rgba(52, 245, 208, 0.20)",
    lg: "0 0 40px rgba(52, 245, 208, 0.25)",
  },

  /** Purple accent glow */
  accentGlow: {
    sm: "0 0 10px rgba(138, 92, 255, 0.15)",
    md: "0 0 20px rgba(138, 92, 255, 0.20)",
    lg: "0 0 40px rgba(138, 92, 255, 0.25)",
  },

  /** Panel elevation shadows */
  panel: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.3)",
    md: "0 4px 16px rgba(0, 0, 0, 0.4)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.5)",
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

export const animation = {
  /** Duration scale (ms) */
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    glacial: 800,
  },

  /** Easing curves */
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export const layout = {
  sidebar: {
    collapsed: 80,
    expanded: 260,
  },
  topNav: {
    height: 64,
  },
  contentMaxWidth: 1440,
} as const;

/* ------------------------------------------------------------------ */
/*  Breakpoints                                                        */
/* ------------------------------------------------------------------ */

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
} as const;
