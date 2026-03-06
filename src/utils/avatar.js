// Avatar generation utilities.
// Avatars are deterministic SVG paths derived from a user's interest tags.
// The same tag set always produces the same shape — no randomness at render time.

import { DRAFT_COLORS, INK } from "../constants/theme.js";

// Deterministic hash of a tag array into a numeric seed
export function tagSeed(tags) {
  var s = 0;
  (tags || []).forEach(t => {
    for (var i = 0; i < t.length; i++) s = (s * 31 + t.charCodeAt(i)) >>> 0;
  });
  return s;
}

// Seeded pseudo-random number — same seed + index always gives the same value
export function seededRand(seed, i) {
  var x = Math.sin(seed + i * 127.1) * 43758.5453123;
  return x - Math.floor(x);
}

// Pick a display color for a circle, falling back to a tag-derived draft color
export function circleColor(circle) {
  return circle.color || (DRAFT_COLORS[Math.abs(tagSeed(circle.tags)) % 6 + 1] || INK);
}

// Generate the SVG path string for an avatar blob.
// Shape is stable across renders for a given tag set and size.
export function genAvatarPath(tags, size) {
  var n = tags.length, seed = tagSeed(tags), cx = size / 2, cy = size / 2;
  var reveal = Math.max(0.15, n / 9);
  var sr = seededRand;

  var baseR = size * (0.28 + sr(seed, 99) * 0.12);

  var minPulls = 2, maxPulls = 3 + Math.floor(n / 2);
  var numPulls = minPulls + Math.floor(sr(seed, 0) * (maxPulls - minPulls + 1));

  var pulls = [];
  for (var p = 0; p < numPulls; p++) {
    var angle = (p / numPulls) * Math.PI * 2 + sr(seed, p + 1) * 1.4 - 0.7;
    var isSpike = sr(seed, p + 60) > 0.55;
    var depth = isSpike
      ? -size * (0.06 + sr(seed, p + 10) * 0.14)
      : size * (0.08 + sr(seed, p + 10) * 0.22);
    var width = 0.18 + sr(seed, p + 20) * 0.55;
    pulls.push({ angle, depth, width, isSpike });
  }

  var noiseAmp = size * (0.005 + sr(seed, 77) * 0.018);
  var noiseFreq = Math.floor(5 + sr(seed, 78) * 14);

  var steps = 120, d = "";
  for (var i = 0; i <= steps; i++) {
    var t = (i / steps) * Math.PI * 2, pullTotal = 0;
    for (var pi = 0; pi < pulls.length; pi++) {
      var diff = t - pulls[pi].angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      pullTotal += Math.exp(-(diff * diff) / (2 * pulls[pi].width * pulls[pi].width)) * pulls[pi].depth;
    }
    var noise = noiseAmp * Math.sin(t * noiseFreq + seed % 6.28);
    var wr = baseR - pullTotal * reveal + noise * reveal;
    d += (i === 0 ? "M " : "L ") + (cx + wr * Math.cos(t - Math.PI / 2)).toFixed(2) + " " + (cy + wr * Math.sin(t - Math.PI / 2)).toFixed(2) + " ";
  }
  return d + "Z";
}

// Generate burst particle positions for the avatar animation
export function genAvatarParticles(count, size, grand) {
  var pts = [], n = grand ? count * 2 : count;
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    pts.push({
      angle: a,
      dist: size * (grand ? 0.28 + Math.random() * 0.42 : 0.18 + Math.random() * 0.28),
      size: size * (grand ? 0.022 + Math.random() * 0.038 : 0.018 + Math.random() * 0.028),
      delay: Math.random() * (grand ? 0.32 : 0.2),
      drift: (Math.random() - 0.5) * size * (grand ? 0.1 : 0.06),
      driftFreq: 2 + Math.random() * 3,
    });
  }
  return pts;
}
