// Map geometry — Andersonville, Chicago.
// World space: 1400x1680px. User position (Clark & Foster) maps to
// viewport center (175,210) at world coordinates (700,840).
// Scale: ~1px ≈ 2.2ft, 1 Chicago block ≈ 100px.

// Generate building footprints along a street segment
export function genBuildings(x1, y1, x2, y2, side, width, depth, gap, seed) {
  var buildings = [];
  var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  var ux = dx / len, uy = dy / len;
  var nx = -uy, ny = ux;
  if (side === -1) { nx = -nx; ny = -ny; }
  var pos = gap, rng = seed || 1;
  function rand() { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 4294967296; }
  while (pos + width < len - gap) {
    var bw = width + (rand() - 0.5) * width * 0.3;
    var bd = depth + (rand() - 0.5) * depth * 0.25;
    buildings.push({ x: x1 + ux * pos + nx * (5 + rand() * 2), y: y1 + uy * pos + ny * (5 + rand() * 2), w: bw, h: bd, angle: Math.atan2(uy, ux) * 180 / Math.PI, nx, ny });
    pos += bw + gap + (rand() * gap * 0.4);
  }
  return buildings;
}

// Pre-computed city geometry — only runs once at module load time
export const CITY_BLOCKS = (() => {
  var streets = [], labels = [], buildings = [];

  var ewStreets = [
    { y: 540,  name: "BRYN MAWR AVE",   major: true  },
    { y: 640,  name: "BERWYN AVE",       major: false },
    { y: 740,  name: "SUMMERDALE AVE",   major: false },
    { y: 840,  name: "FOSTER AVE",       major: true  },
    { y: 940,  name: "WINONA ST",        major: false },
    { y: 1040, name: "LAWRENCE AVE",     major: true  },
    { y: 1140, name: "LELAND AVE",       major: false },
    { y: 1240, name: "WILSON AVE",       major: true  },
    { y: 440,  name: "DEVON AVE",        major: true  },
  ];

  var nsStreets = [
    { x: 460,  name: "SHERIDAN RD",  major: true  },
    { x: 560,  name: "BROADWAY",     major: true  },
    { x: 760,  name: "WINTHROP AVE", major: false },
    { x: 920,  name: "ASHLAND AVE",  major: true  },
    { x: 1020, name: "MAGNOLIA AVE", major: false },
    { x: 1100, name: "PAULINA ST",   major: false },
  ];

  ewStreets.forEach(s => {
    streets.push({ x1: 250, y1: s.y, x2: 1200, y2: s.y, major: s.major });
    if (s.name) labels.push({ x: 258, y: s.y - 4, text: s.name, horiz: true });
    var bw = s.major ? 18 : 14, bd = s.major ? 12 : 10, bg = s.major ? 8 : 10;
    buildings.push(...genBuildings(280, s.y, 1180, s.y,  1, bw, bd, bg, s.y));
    buildings.push(...genBuildings(280, s.y, 1180, s.y, -1, bw, bd, bg, s.y + 100));
  });

  nsStreets.forEach(s => {
    streets.push({ x1: s.x, y1: 350, x2: s.x, y2: 1350, major: s.major, vert: true });
    if (s.name) labels.push({ x: s.x, y: 362, text: s.name, horiz: false });
    var bw = s.major ? 16 : 13, bd = s.major ? 12 : 10, bg = s.major ? 8 : 10;
    buildings.push(...genBuildings(s.x, 380, s.x, 1320,  1, bw, bd, bg, s.x));
    buildings.push(...genBuildings(s.x, 380, s.x, 1320, -1, bw, bd, bg, s.x + 200));
  });

  streets.push({ x1: 820, y1: 1350, x2: 560, y2: 350, diag: true, major: true, name: "CLARK ST" });
  labels.push({ x: 810, y: 1310, text: "CLARK ST", horiz: true, diagonal: true });
  buildings.push(...genBuildings(820, 1350, 560, 350,  1, 16, 12, 7, 999));
  buildings.push(...genBuildings(820, 1350, 560, 350, -1, 16, 12, 7, 1337));

  streets.push({ x1: 560, y1: 1350, x2: 500, y2: 840,  diag: true, major: false });
  streets.push({ x1: 500, y1: 840,  x2: 460, y2: 350,  diag: true, major: false });

  var landmarks = [
    { x: 670, y: 800,  w: 90,  h: 60,  name: "ANDERSONVILLE",   fill: false },
    { x: 750, y: 480,  w: 180, h: 120, name: "WINNEMAC PARK",    fill: true  },
    { x: 880, y: 1080, w: 100, h: 80,  name: "WELLES PARK",      fill: true  },
    { x: 648, y: 818,  w: 44,  h: 30,  name: "SWEDISH\nMUSEUM",  fill: false },
    { x: 720, y: 856,  w: 48,  h: 28,  name: "RAVEN\nTHEATRE",   fill: false },
    { x: 547, y: 528,  w: 40,  h: 24,  name: "BRYN MAWR\nCTA",   fill: true  },
    { x: 547, y: 628,  w: 40,  h: 24,  name: "BERWYN\nCTA",      fill: true  },
    { x: 547, y: 828,  w: 40,  h: 24,  name: "FOSTER\nCTA",      fill: true  },
    { x: 547, y: 1028, w: 40,  h: 24,  name: "LAWRENCE\nCTA",    fill: true  },
  ];

  return { streets, labels, landmarks, buildings };
})();
