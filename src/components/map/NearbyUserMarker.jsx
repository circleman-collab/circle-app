// SVG marker for a nearby user detected during a Pulse Check animation.
// Trembles as the hold progresses, then snaps into a tappable state.

import { INK, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { useTremor } from "../../hooks/useTremor.js";
import { genAvatarPath } from "../../utils/avatar.js";

export function NearbyUserMarker({ user, cx, cy, progress, onClick }) {
  var x = cx + user.r * Math.cos((user.angle * Math.PI) / 180);
  var y = cy + user.r * Math.sin((user.angle * Math.PI) / 180);

  var held = progress >= 0.60 && progress < 0.82;
  var resolved = progress >= 0.82;
  var heldP = held ? Math.min(1, (progress - 0.60) / 0.18) : 0;
  var resolveP = resolved ? Math.min(1, (progress - 0.82) / 0.18) : 0;

  var tremor = useTremor(held, 55, 1.8 * heldP * (1 - heldP));
  var tx = x + tremor, ty = y + tremor * 0.6;

  if (!held && !resolved) return null;

  var markerOp = held ? heldP * 0.45 : resolveP;

  return (
    <g style={{ pointerEvents: resolveP >= 1 ? "auto" : "none" }} onClick={() => resolveP >= 1 && onClick(user)}>
      <circle cx={tx} cy={ty} r={22} fill="transparent" />
      <circle cx={tx} cy={ty} r={10 + heldP * 4} fill="none" stroke={INK} strokeWidth="0.8" opacity={held ? heldP * 0.2 : resolveP * 0.35} strokeDasharray="2 3" />
      <circle cx={tx} cy={ty} r={7} fill={BG} stroke={INK} strokeWidth={held ? "1" : "1.5"} opacity={markerOp} strokeDasharray="2.5 2" />
      <g opacity={markerOp} style={{ pointerEvents: "none" }}>
        <path d={genAvatarPath(user.tags, 14)} transform={`translate(${tx - 7},${ty - 7})`} fill="none" stroke={INK} strokeWidth="0.8" />
      </g>
      <text x={tx} y={ty - 13} textAnchor="middle" fontSize="7" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={resolveP}>
        {user.handle.toUpperCase()}
      </text>
    </g>
  );
}
