// Label + reset button rendered on the edge of the radius lens circle.
// Shows how far the lens extends and how many circles are visible inside it.

import { INK, INK_LIGHT, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";

export function RadiusEdgeLabel({ cx, cy, radius, radiusMiles, visibleCount, onReset }) {
  if (!radius) return null;
  var labelY = cy + radius - 18;
  var resetY = cy - radius + 22;
  var resetX = cx;

  return (
    <g style={{ pointerEvents: "none" }}>
      <text x={cx} y={labelY} textAnchor="middle" fontSize="8" fontWeight="700"
        fill={INK} fontFamily={font} letterSpacing="1.5" opacity="0.75"
        style={{ pointerEvents: "none" }}>
        {radiusMiles + " MI · " + visibleCount + " VISIBLE"}
      </text>
      <g style={{ pointerEvents: "all", cursor: "pointer" }} onClick={onReset}>
        <circle cx={resetX} cy={resetY} r={10} fill={BG} stroke={INK_LIGHT} strokeWidth="1" />
        <path d={`M${resetX - 4},${resetY} a4,4 0 1,1 5,5`} fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
        <path d={`M${resetX + 1},${resetY + 5} l2,1 l-1,-2.5`} fill={INK} stroke="none" />
      </g>
    </g>
  );
}
