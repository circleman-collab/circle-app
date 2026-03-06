// SVG particle effects used on the map during pulse and circle-planting interactions.
// Each component is a pure function of its progress value — no internal state.

import { INK } from "../../constants/theme.js";

// Particles that orbit the pulse button while charging or burst outward when fired
export function PulseParticles({ progress, tx, ty, fired, particles }) {
  if (!particles || progress <= 0) return null;
  var BTN_R = 64;
  return (
    <g>
      {particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        if (lp <= 0) return null;
        var e = fired ? Math.pow(lp, 0.55) : 1 - Math.pow(1 - lp, 0.7);
        var dist = fired ? e * BTN_R * 4.2 : p.dist * (1 - e);
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var pa = p.angle + Math.PI / 2;
        var px = tx + Math.cos(p.angle) * dist + Math.cos(pa) * lat;
        var py = ty + Math.sin(p.angle) * dist + Math.sin(pa) * lat;
        var op = fired ? Math.pow(1 - e, 0.8) * 0.8 : (0.2 + e * 0.8);
        var sz = fired ? p.size * (1 - e * 0.6) : p.size * (0.3 + e * 0.7);
        return <circle key={i} cx={px} cy={py} r={Math.max(0.1, sz)} fill={INK} opacity={op} style={{ pointerEvents: "none" }} />;
      })}
    </g>
  );
}

// Particles that scatter outward from the lens edge when a pulse fires
export function OutwardBurst({ progress, cx, cy, radius, particles }) {
  if (!particles || !progress || progress <= 0 || !radius) return null;
  return (
    <g style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        if (lp <= 0) return null;
        var e = Math.pow(lp, 0.5);
        var maxD = radius * p.travelMult;
        var dist = e * maxD;
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var pa = p.angle + Math.PI / 2;
        var x = cx + Math.cos(p.angle) * dist + Math.cos(pa) * lat;
        var y = cy + Math.sin(p.angle) * dist + Math.sin(pa) * lat;
        var fade = dist > radius ? Math.max(0, 1 - (dist - radius) / (maxD - radius)) : 1;
        return <circle key={i} cx={x} cy={y} r={Math.max(0.1, p.size * (1 - e * 0.55))} fill={INK} opacity={Math.pow(1 - e, 0.6) * p.brightness * fade} />;
      })}
    </g>
  );
}

// Particles that rush inward toward center when the pulse returns
export function InwardRush({ progress, cx, cy, radius, particles }) {
  if (!particles || !progress || progress <= 0 || !radius) return null;
  return (
    <g style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        if (lp <= 0) return null;
        var e = 1 - Math.pow(1 - lp, 0.7);
        var spawnD = radius * p.spawnMult;
        var dist = spawnD * (1 - e);
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var pa = p.angle + Math.PI / 2;
        var x = cx + Math.cos(p.angle) * dist + Math.cos(pa) * lat;
        var y = cy + Math.sin(p.angle) * dist + Math.sin(pa) * lat;
        var fadeIn = Math.min(1, e * 3);
        var fadeOut = dist < 20 ? dist / 20 : 1;
        return <circle key={i} cx={x} cy={y} r={Math.max(0.1, p.size * (0.4 + e * 0.6))} fill={INK} opacity={fadeIn * fadeOut * p.brightness * 0.75} />;
      })}
    </g>
  );
}

// Particles that burst out or stamp in when a circle is planted
export function PlantParticles({ progress, px, py, stamp, particles }) {
  if (!particles || progress <= 0 || !px) return null;
  return (
    <g>
      {particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (progress - p.delay) / (1 - p.delay)));
        if (lp <= 0) return null;
        var e = stamp ? Math.pow(lp, 0.5) : 1 - Math.pow(1 - lp, 0.75);
        var dist = stamp ? e * 20 : p.scatter * (1 - e);
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var pa = p.angle + Math.PI / 2;
        var x = px + Math.cos(p.angle) * dist + Math.cos(pa) * lat;
        var y = py + Math.sin(p.angle) * dist + Math.sin(pa) * lat;
        var op = stamp ? Math.pow(1 - e, 0.7) * 0.85 : (0.15 + e * 0.85);
        return <circle key={i} cx={x} cy={y} r={Math.max(0.1, p.size * (stamp ? 1 - e * 0.8 : 0.3 + e * 0.7))} fill={INK} opacity={op} style={{ pointerEvents: "none" }} />;
      })}
    </g>
  );
}

// Expanding rings that bleed outward from the pulse button when fired
export function BleedRings({ progress, cx, cy, btnR }) {
  return (
    <g>
      {[0, 0.18, 0.36].map((off, i) => {
        var p = Math.max(0, Math.min(1, (progress - off) / 0.72));
        if (p <= 0) return null;
        return <circle key={i} cx={cx} cy={cy} r={btnR + p * btnR * 3.5} fill="none" stroke={INK} strokeWidth={(1 - p) * 2.5} opacity={(1 - p) * 0.18} style={{ pointerEvents: "none" }} />;
      })}
    </g>
  );
}

// Dashed expanding rings shown inside the lens when a pulse propagates
export function PulseRipples({ cx, cy, maxR, progress }) {
  return (
    <g>
      {[0, 0.25, 0.5].map((off, i) => {
        var p = Math.max(0, Math.min(1, (progress - off) / 0.6));
        if (p <= 0) return null;
        return <circle key={i} cx={cx} cy={cy} r={p * maxR} fill="none" stroke={INK} strokeWidth={1.5 - p} opacity={(1 - p) * 0.6} strokeDasharray="6 4" />;
      })}
    </g>
  );
}
