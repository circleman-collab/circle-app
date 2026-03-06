// SVG marker for a nearby hidden circle detected during a Pulse Check animation.
// Trembles during the hold phase, then resolves into a tappable marker.

import { INK, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { useTremor } from "../../hooks/useTremor.js";
import { circleColor } from "../../utils/avatar.js";

export function NearbyCircleMarker({ circle, cx, cy, progress, onClick }) {
  var x = cx + circle.r * Math.cos((circle.angle * Math.PI) / 180);
  var y = cy + circle.r * Math.sin((circle.angle * Math.PI) / 180);

  var held = progress >= 0.60 && progress < 0.82;
  var resolved = progress >= 0.82;
  var heldP = held ? Math.min(1, (progress - 0.60) / 0.18) : 0;
  var resolveP = resolved ? Math.min(1, (progress - 0.82) / 0.18) : 0;

  var tremor = useTremor(held, 60, 2.0 * heldP * (1 - heldP));
  var tx = x + tremor, ty = y + tremor * 0.7;

  if (!held && !resolved) return null;

  var op = held ? heldP * 0.45 : resolveP;
  var color = circleColor(circle);
  var R = 10;
  var hatch = [];
  for (var i = -R; i <= R; i += 3.5) {
    var hw = Math.sqrt(Math.max(0, R * R - i * i));
    hatch.push(<line key={i} x1={tx - hw} y1={ty + i} x2={tx + hw} y2={ty + i} stroke={color} strokeWidth="0.7" opacity={0.5} />);
  }

  return (
    <g style={{ pointerEvents: resolveP >= 1 ? "auto" : "none" }} onClick={() => resolveP >= 1 && onClick(circle)}>
      <circle cx={tx} cy={ty} r={22} fill="transparent" />
      {held && <circle cx={tx} cy={ty} r={R + 8 * heldP} fill="none" stroke={color} strokeWidth="1" opacity={heldP * 0.3} />}
      <clipPath id={"pcclip" + circle.id}><circle cx={tx} cy={ty} r={R} /></clipPath>
      <g clipPath={"url(#pcclip" + circle.id + ")"} opacity={op}>{hatch}</g>
      <circle cx={tx} cy={ty} r={R} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2.5" opacity={op} />
      <text x={tx} y={ty + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={color} fontFamily={font} opacity={op}>?</text>
      <text x={tx} y={ty - R - 6} textAnchor="middle" fontSize="8" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={resolveP}>
        {circle.name.toUpperCase()}
      </text>
    </g>
  );
}
