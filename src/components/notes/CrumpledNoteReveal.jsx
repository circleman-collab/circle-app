// Interactive gesture to "smooth out" a crumpled hidden note.
// The user scribbles on the paper to reveal it — crossing a threshold triggers the reveal.

import { useState, useRef } from "react";
import { INK, INK_LIGHT, NOTE_BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { Portal } from "../common/Portal.jsx";

export function CrumpledNoteReveal({ note, onSmoothed, onCancel }) {
  var [progress, setProgress] = useState(0);
  var svgRef = useRef(null);
  var drawing = useRef(false);
  var totalPoints = useRef(0);
  var THRESHOLD = 0.55;

  var seed = note.id.charCodeAt(0) + (note.id.charCodeAt(1) || 7);
  var crinkleLines = Array.from({ length: 14 }, (_, i) => {
    var x1 = ((seed * 17 + i * 31) % 170) + 15;
    var y1 = ((seed * 13 + i * 23) % 220) + 15;
    var x2 = x1 + ((seed * 7 + i * 19) % 50) - 25;
    var y2 = y1 + ((seed * 11 + i * 37) % 50) - 25;
    return { x1, y1, x2: Math.max(8, Math.min(192, x2)), y2: Math.max(8, Math.min(252, y2)), op: 0.3 + ((seed * i * 3) % 10) / 30 };
  });

  function onStart(e) { e.preventDefault(); drawing.current = true; }
  function onMove(e) {
    if (!drawing.current) return;
    e.preventDefault();
    totalPoints.current += 1;
    var np = Math.min(1, totalPoints.current / 90);
    setProgress(np);
    if (np >= THRESHOLD) setTimeout(() => onSmoothed(note), 350);
  }
  function onEnd() { drawing.current = false; }

  var distort = 1 - progress;
  var blurAmt = (distort * 6).toFixed(1);
  var skewX = (distort * 8 - 4).toFixed(1);
  var skewY = (distort * 3).toFixed(1);
  var smoothed = progress >= THRESHOLD;

  var words = (note.text || "").split(" ");
  var lines = [];
  var cur = "";
  words.forEach(w => {
    if ((cur + " " + w).length > 22 && cur) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  });
  if (cur) lines.push(cur);

  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(10,10,10,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onCancel}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: NOTE_BG, opacity: 0.7, height: 14 }}>
            {smoothed ? "✓ smoothed" : "smooth it out"}
          </div>
          <svg ref={svgRef} width={200} height={260} viewBox="0 0 200 260"
            style={{ touchAction: "none", cursor: "crosshair", filter: "drop-shadow(2px 3px 0 rgba(0,0,0,0.4))" }}
            onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd}
            onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>
            <defs>
              <filter id="crinkleBlur">
                <feGaussianBlur stdDeviation={blurAmt} />
              </filter>
            </defs>
            <rect x={0} y={0} width={200} height={260} fill={NOTE_BG} rx="2" />
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line key={i} x1={24} y1={62 + i * 26} x2={176} y2={62 + i * 26} stroke={INK_LIGHT} strokeWidth="0.5" opacity="0.35" />
            ))}
            <line x1={42} y1={0} x2={42} y2={260} stroke="#c9a0a0" strokeWidth="0.5" opacity="0.3" />
            <g filter={distort > 0.05 ? "url(#crinkleBlur)" : undefined}
              transform={"skewX(" + skewX + ") skewY(" + skewY + ")"}
              style={{ transformOrigin: "100px 130px" }}>
              {lines.map((line, i) => (
                <text key={i} x={52} y={76 + i * 26} fontFamily="serif" fontSize="13" fill={INK} fontStyle="italic" opacity={0.5 + progress * 0.5}>{line}</text>
              ))}
            </g>
            {crinkleLines.map((l, i) => (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={INK_LIGHT} strokeWidth="0.9" opacity={l.op * (1 - progress * 0.75)} />
            ))}
            <rect x={0} y={0} width={200 * progress} height={2} fill={INK} opacity="0.15" rx="1" />
          </svg>
          <button onClick={onCancel} style={{ background: "none", border: "1px solid " + NOTE_BG, color: NOTE_BG, fontFamily: font, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 20px", cursor: "pointer", opacity: 0.5 }}>cancel</button>
        </div>
      </div>
    </Portal>
  );
}
