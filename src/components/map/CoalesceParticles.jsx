// SVG particle system that converges particles toward a target point.
// Plays during the Pulse Check coalesce animation when a nearby user/circle is found.

import { INK } from "../../constants/theme.js";

export function CoalesceParticles({ progress, particles }) {
  if (!particles || progress <= 0) return null;
  return (
    <g style={{ pointerEvents: "none" }}>
      {particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (progress - p.delay) / ((1 - p.delay) * p.speed)));
        if (lp <= 0) return null;
        var e = Math.pow(Math.min(1, lp), 0.55);
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var perpX = -(p.ty - p.sy), perpY = (p.tx - p.sx);
        var len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
        var nx = perpX / len, ny = perpY / len;
        var x = p.sx + (p.tx - p.sx) * e + nx * lat * (1 - e);
        var y = p.sy + (p.ty - p.sy) * e + ny * lat * (1 - e);
        var fadeIn = Math.min(1, lp * 3);
        var fadeOut = e > 0.82 ? Math.pow(1 - (e - 0.82) / 0.18, 0.6) : 1;
        return <circle key={i} cx={x} cy={y} r={Math.max(0.1, p.size * (1 - e * 0.5))} fill={INK} opacity={fadeIn * fadeOut * 0.8} />;
      })}
    </g>
  );
}
