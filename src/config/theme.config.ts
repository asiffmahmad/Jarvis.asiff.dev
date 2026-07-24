export const THEME_CONFIG = {
  colors: {
    primary: "#34F5D0",
    error: "#FF4D4D",
    warning: "#F5A623",
  },
  animations: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    coreRotation: 20, // seconds
    agentPulse: 2, // seconds
  },
  zIndices: {
    background: 0,
    base: 10,
    panels: 20,
    console: 30,
    sidebar: 40,
    modal: 50,
    toast: 60,
  }
} as const;
