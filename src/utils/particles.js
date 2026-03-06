// Particle set generators.
// Each function returns an array of particle descriptor objects.
// The descriptors are static — animation is handled by the rendering components.

// Particles that orbit the pulse button while charging or firing
export function genPulseParticles(c) {
  var p = [];
  for (var i = 0; i < c; i++) {
    var a = (i / c) * Math.PI * 2 + (Math.random() - 0.5) * 0.55;
    p.push({
      angle: a,
      dist: 55 + Math.random() * 110,
      size: 0.8 + Math.random() * 2.8,
      delay: Math.random() * 0.28,
      drift: (Math.random() - 0.5) * 4.5,
      driftFreq: 1.2 + Math.random() * 3.5,
    });
  }
  return p;
}

// Particles that fly outward when a pulse is fired
export function genOutwardParticles(c) {
  var p = [];
  for (var i = 0; i < c; i++) {
    var a = (i / c) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
    p.push({
      angle: a,
      travelMult: 1.1 + Math.random() * 1.8,
      size: 0.8 + Math.random() * 2.2,
      delay: Math.random() * 0.22,
      drift: (Math.random() - 0.5) * 3.5,
      driftFreq: 1.5 + Math.random() * 3,
      brightness: 0.4 + Math.random() * 0.6,
    });
  }
  return p;
}

// Particles that rush inward as the pulse returns
export function genInwardParticles(c) {
  var p = [];
  for (var i = 0; i < c; i++) {
    var a = (i / c) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    p.push({
      angle: a,
      spawnMult: 1.3 + Math.random() * 1.4,
      size: 0.8 + Math.random() * 1.8,
      delay: Math.random() * 0.28,
      drift: (Math.random() - 0.5) * 2.8,
      driftFreq: 1.5 + Math.random() * 2.5,
      brightness: 0.35 + Math.random() * 0.65,
    });
  }
  return p;
}

// Particles that burst out when a circle is planted on the map
export function genPlantParticles(c) {
  var p = [];
  for (var i = 0; i < c; i++) {
    var a = (i / c) * Math.PI * 2;
    var big = i % 4 === 0;
    var giant = i % 12 === 0;
    p.push({
      angle: a + (Math.random() - 0.5) * 0.7,
      scatter: giant ? (90 + Math.random() * 60) : big ? (55 + Math.random() * 40) : (28 + Math.random() * 42),
      size: giant ? (2.2 + Math.random() * 1.6) : big ? (1.6 + Math.random() * 1.4) : (0.7 + Math.random() * 1.2),
      delay: Math.random() * 0.28,
      drift: (Math.random() - 0.5) * 4,
      driftFreq: 1.5 + Math.random() * 3,
    });
  }
  return p;
}

// Particles that converge on a point (used during Pulse Check coalesce animation)
export function genCoalesceParticles(count, tx, ty) {
  var pts = [];
  for (var i = 0; i < count; i++) {
    var spawnX, spawnY, edge = Math.floor(Math.random() * 4);
    if (edge === 0) { spawnX = -20 + Math.random() * 390; spawnY = -30 + Math.random() * 60; }
    else if (edge === 1) { spawnX = -20 + Math.random() * 390; spawnY = 390 + Math.random() * 60; }
    else if (edge === 2) { spawnX = -40 + Math.random() * 60; spawnY = -20 + Math.random() * 460; }
    else { spawnX = 330 + Math.random() * 60; spawnY = -20 + Math.random() * 460; }
    pts.push({
      sx: spawnX, sy: spawnY, tx, ty,
      size: 0.6 + Math.random() * 2.0,
      delay: Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 18,
      driftFreq: 1 + Math.random() * 2,
      speed: 0.55 + Math.random() * 0.45,
    });
  }
  return pts;
}
