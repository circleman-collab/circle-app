// SVG marker for a circle on the map.
// Handles open, closed, and hidden circle visual states,
// and responds to the radius lens (dim/highlight when inside or outside).

import { useState, useRef, useEffect } from "react";
import { INK, BG } from "../../constants/theme.js";
import { circleColor } from "../../utils/avatar.js";
import { font } from "../../constants/theme.js";

export function ChatMarker({ chat, cx, cy, onClick, radius, revealProgress, highlighted, panX, panY }) {
  var R = 10;
  var color = circleColor(chat);
  var x = cx + chat.r * Math.cos((chat.angle * Math.PI) / 180);
  var y = cy + chat.r * Math.sin((chat.angle * Math.PI) / 180);

  var hasLens = radius !== null && radius !== undefined;
  var screenX = x + panX, screenY = y + panY;
  var distFromCenter = Math.sqrt((screenX - cx) * (screenX - cx) + (screenY - cy) * (screenY - cy));
  var inLens = !hasLens || distFromCenter <= radius;
  var baseOp = hasLens ? (inLens ? 1 : 0.12) : 1;
  var transition = "opacity 0.25s ease, filter 0.25s ease";

  var prevInLens = useRef(inLens);
  var [ringVisible, setRingVisible] = useState(inLens);
  useEffect(() => {
    if (!prevInLens.current && inLens) {
      var t = setTimeout(() => setRingVisible(true), 160);
      return () => clearTimeout(t);
    }
    if (prevInLens.current && !inLens) setRingVisible(false);
    prevInLens.current = inLens;
  }, [inLens]);

  // Hidden circles reveal with an animation driven by revealProgress (0→1)
  if (chat.type === "hidden") {
    if (!revealProgress || revealProgress <= 0) return null;
    var rp = revealProgress;
    var sh = 0.4 + 0.6 * Math.sin(rp * Math.PI);
    var hatch = [];
    for (var i = -R; i <= R; i += 3.5) {
      var hw = Math.sqrt(Math.max(0, R * R - i * i));
      hatch.push(<line key={i} x1={x - hw} y1={y + i} x2={x + hw} y2={y + i} stroke={color} strokeWidth="0.7" opacity={0.45 * rp} />);
    }
    return (
      <g onClick={() => onClick(chat)} style={{ cursor: "pointer", opacity: rp, transition }}>
        <circle cx={x} cy={y} r={22} fill="transparent" />
        <circle cx={x} cy={y} r={R + 8 * sh} fill="none" stroke={color} strokeWidth="1" opacity={sh * 0.5 * (1 - rp * 0.5)} />
        <clipPath id={"hclip" + chat.id}><circle cx={x} cy={y} r={R} /></clipPath>
        <g clipPath={"url(#hclip" + chat.id + ")"}>{hatch}</g>
        <circle cx={x} cy={y} r={R} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={chat.pulseable !== false ? "3 2.5" : "none"} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={color} fontFamily={font}>?</text>
      </g>
    );
  }

  return (
    <g onClick={() => onClick(chat)} style={{ cursor: "pointer", opacity: baseOp, transition }}>
      <circle cx={x} cy={y} r={22} fill="transparent" />
      {hasLens && inLens && (
        <circle cx={x} cy={y} r={R + 6} fill="none" stroke={color} strokeWidth="2.5"
          opacity={ringVisible ? 0.35 : 0}
          style={{ transition: "opacity 0.25s ease" }}
        />
      )}
      {highlighted && <circle cx={x} cy={y} r={R + 10} fill="none" stroke={color} strokeWidth="1.5" opacity={0.6} strokeDasharray="3 3" />}
      {highlighted && <circle cx={x} cy={y} r={R + 18} fill="none" stroke={color} strokeWidth="0.8" opacity={0.25} strokeDasharray="2 4" />}
      {chat.type === "open"   && <circle cx={x} cy={y} r={R} fill={color} />}
      {chat.type === "closed" && <circle cx={x} cy={y} r={R} fill={BG} stroke={color} strokeWidth="2" />}
      <text x={x} y={y - R - 6} textAnchor="middle" fontSize="8" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={inLens || !hasLens ? 1 : 0.15}>
        {chat.name.toUpperCase()}
      </text>
    </g>
  );
}
