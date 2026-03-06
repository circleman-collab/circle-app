// App-wide behavioral constants.
// Timing values, limits, and feature flags all live here.

// How long (ms) a user must hold to trigger a pulse or circle plant
export const HOLD_MS = 1500;
export const PLANT_MS = 1200;

// Notes
export const NOTE_MAX_CHARS = 100;    // max characters in a note
export const NOTE_MAX_UNPLACED = 7;   // max notes sitting in the tray (unplaced)
export const NOTE_FADE_DAYS = 15;     // days before a note starts fading out
export const NOTE_EXPIRE_DAYS = 30;   // days until a note fully expires

// Pulse chat
export const PULSE_CHAT_LIMIT = 7;    // max messages before a pulse chat fades

// Map geometry (SVG units, viewBox 350x420)
export const MAP_CX = 175;   // center X of the user's position dot
export const MAP_CY = 210;   // center Y
export const MAP_MIN_R = 70;    // smallest radius the lens can be drawn
export const MAP_MAX_R = 250;   // largest radius the lens can be drawn
export const MAP_BTN_R = 64;    // radius of the pulse button
export const MAP_STAGE_R = 130; // radius of the return-wave staging circle
