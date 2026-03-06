// Note factory and state helpers.

import { NOTE_EXPIRE_DAYS, NOTE_FADE_DAYS } from "../constants/settings.js";

// Create a new note object with all required fields
export function makeNote({ text, tags, visibility, placedPos, ownerId }) {
  var now = Date.now();
  return {
    id: Math.random().toString(36).slice(2),
    text,
    tags,
    visibility,
    ownerId: ownerId || "user_local",
    createdAt: now,
    expiresAt: now + NOTE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    placed: !!placedPos,
    placedPos: placedPos || null,
  };
}

// How many days remain before this note expires
export function noteDaysLeft(note) {
  return Math.max(0, Math.ceil((note.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

// Opacity value (0–1) based on how close a note is to expiry
export function noteOpacity(note) {
  var daysLeft = noteDaysLeft(note);
  if (daysLeft > NOTE_FADE_DAYS) return 1;
  return 0.3 + 0.7 * (daysLeft / NOTE_FADE_DAYS);
}
