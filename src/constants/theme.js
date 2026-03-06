// Visual design tokens — the single source of truth for all colors and typography.
// Every component imports from here. Change a value here and it updates everywhere.

export const BG = "#f0ece3";         // main background — warm off-white
export const BG_OUTER = "#e8e5de";   // outer shell background
export const INK = "#0a0a0a";        // primary foreground / text
export const INK_LIGHT = "#bfb9ae";  // subtle borders and muted elements
export const INK_MID = "#6b6860";    // secondary text and labels

export const font = "'Helvetica Neue', Arial, sans-serif";

// Colors assigned to circles that don't have an explicit color set
export const DRAFT_COLORS = {
  1: "#7a6a3a",
  2: "#3a5a4a",
  3: "#4a3a6a",
  4: "#7a3a3a",
  5: "#3a5a6a",
  6: "#6a4a3a",
};

// Palette shown in the circle color picker
export const CIRCLE_PALETTE = [
  "#7a6a3a", // warm ochre
  "#3a5a4a", // forest
  "#4a3a6a", // dusk purple
  "#7a3a3a", // terracotta
  "#3a5a6a", // slate blue
  "#6a4a3a", // raw umber
  "#4a6a3a", // sage
  "#5a3a5a", // plum
  "#3a4a6a", // midnight
  "#6a5a3a", // sand
];

// Notes use an aged-paper tone distinct from the main background
export const NOTE_BG = "#f5f0e0";
