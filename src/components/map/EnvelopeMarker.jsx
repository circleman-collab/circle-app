// SVG map icon for a placed note.
// Renders as an envelope with visual variations for open, closed, and hidden notes.
// Hidden notes that belong to you show as ghost outlines; others show as crumpled paper.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, NOTE_BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { noteOpacity } from "../../utils/notes.js";

export function EnvelopeMarker({ note, x, y, onClick, radius, panX = 0, panY = 0, stamping = false, revealed = false, isOwn = false }) {
  var baseOp = noteOpacity(note);
  var W = 26, H = 18;
  var hasLens = radius !== null && radius !== undefined;
  var screenX = x + panX, screenY = y + panY;
  var CX = 175, CY = 210;
  var distFromCenter = Math.sqrt((screenX - CX) * (screenX - CX) + (screenY - CY) * (screenY - CY));
  var inLens = !hasLens || distFromCenter <= radius;
  var op = hasLens ? (inLens ? baseOp : baseOp * 0.12) : baseOp;

  var prevInLens = useRef(inLens);
  var [wiggling, setWiggling] = useState(false);
  useEffect(() => {
    if (!prevInLens.current && inLens) { setWiggling(true); setTimeout(() => setWiggling(false), 400); }
    prevInLens.current = inLens;
  }, [inLens]);

  var isHidden = note.visibility === "hidden";
  var isClosed = note.visibility === "closed";
  var sw = 0.8;
  var animStyle = {
    animation: wiggling ? "envelopeWiggle 0.4s ease" : stamping ? "noteStamp 0.6s cubic-bezier(0.22,1,0.36,1)" : "none",
    transformOrigin: "0px 0px",
  };

  // Owner's own hidden note — ghost outline, always visible
  if (isHidden && !revealed && isOwn) {
    return (
      <g transform={`translate(${x},${y})`} onClick={() => onClick(note)} style={{ cursor: "pointer", opacity: 0.35 }}>
        <g style={animStyle}>
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="none" stroke={INK} strokeWidth={sw} strokeDasharray="3 2" rx="1" />
          <polyline points={`${-W / 2},${-H / 2} 0,${H * 0.02} ${W / 2},${-H / 2}`} fill="none" stroke={INK} strokeWidth={sw} />
          <line x1={-W / 2} y1={H / 2} x2={0} y2={H * 0.02} stroke={INK} strokeWidth={sw * 0.7} />
          <line x1={W / 2}  y1={H / 2} x2={0} y2={H * 0.02} stroke={INK} strokeWidth={sw * 0.7} />
          <text x={0} y={H / 2 + 8} textAnchor="middle" fontSize="5" fill={INK} fontFamily={font} letterSpacing="1" opacity="0.6">HIDDEN</text>
        </g>
      </g>
    );
  }

  // Hidden note from someone else — crumpled paper, not yet revealed
  if (isHidden && !revealed) {
    return (
      <g transform={`translate(${x},${y})`} onClick={() => onClick(note)} style={{ cursor: "pointer", opacity: 0.7 }}>
        <g style={animStyle}>
          <polygon points="-9,7 -5,10 2,9 9,6 10,-2 7,-9 0,-8 -8,-6 -10,0 -7,5" fill={NOTE_BG} stroke={INK} strokeWidth={sw} strokeDasharray="2 2" opacity="0.6" />
          <line x1={-4} y1={-3} x2={4} y2={-1} stroke={INK_LIGHT} strokeWidth="0.5" opacity="0.5" />
          <line x1={-5} y1={1}  x2={3} y2={3}  stroke={INK_LIGHT} strokeWidth="0.5" opacity="0.5" />
        </g>
      </g>
    );
  }

  // Standard envelope (open, closed, or revealed hidden)
  var sy = isClosed || isHidden ? H * 0.12 : 0;
  var seal = isHidden
    ? <g><circle cx={0} cy={sy} r={3.2} fill={INK} opacity="0.85" /><circle cx={0} cy={sy} r={1.8} fill="none" stroke={NOTE_BG} strokeWidth="0.7" /></g>
    : isClosed
    ? <g><circle cx={0} cy={sy} r={3.2} fill={INK} opacity="0.85" /><line x1={-1.4} y1={sy - 1.4} x2={1.4} y2={sy + 1.4} stroke={NOTE_BG} strokeWidth="0.8" /><line x1={1.4} y1={sy - 1.4} x2={-1.4} y2={sy + 1.4} stroke={NOTE_BG} strokeWidth="0.8" /></g>
    : <g><circle cx={0} cy={sy} r={3.2} fill="none" stroke={INK} strokeWidth="0.9" opacity="0.7" /><circle cx={0} cy={sy} r={1.6} fill="none" stroke={INK} strokeWidth="0.5" opacity="0.4" /></g>;

  return (
    <g transform={`translate(${x},${y})`} onClick={() => onClick(note)} style={{ cursor: "pointer", opacity: op, transition: "opacity 0.25s ease" }}>
      <g style={animStyle}>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} fill={NOTE_BG} stroke={INK} strokeWidth={sw} rx="1"
          strokeDasharray={isHidden ? "3 2" : "none"}
          opacity={isHidden ? 0.75 : 1}
        />
        {!isClosed && !isHidden && (
          <polyline points={`${-W / 2},${-H / 2} 0,${H * 0.02} ${W / 2},${-H / 2}`} fill="none" stroke={INK} strokeWidth={sw} />
        )}
        {(isClosed || isHidden) && (
          <line x1={-W / 2} y1={-H / 2} x2={W / 2} y2={-H / 2} stroke={INK} strokeWidth={sw} />
        )}
        <line x1={-W / 2} y1={H / 2} x2={0} y2={H * 0.02} stroke={INK} strokeWidth={sw * 0.7} />
        <line x1={W / 2}  y1={H / 2} x2={0} y2={H * 0.02} stroke={INK} strokeWidth={sw * 0.7} />
        {seal}
        {isHidden && (
          <ellipse cx={0} cy={0} rx={W / 2 + 3} ry={H / 2 + 3} fill="none" stroke={INK} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
        )}
      </g>
    </g>
  );
}
