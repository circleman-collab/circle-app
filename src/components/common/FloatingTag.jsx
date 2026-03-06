// An interactive tag chip that floats and drifts, with a tap-to-remove action.
// Used in editable contexts like the circle creation flow.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, BG } from "../../constants/theme.js";

export function FloatingTag({ tag, confirming, onRemove }) {
  var [offset, setOffset] = useState({ x: 0, y: 0 });
  var [opacity, setOpacity] = useState(0);
  var [scale, setScale] = useState(0.5);
  var rafRef = useRef(null);
  var startTime = useRef(Date.now());
  var phase = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    setOpacity(0);
    setScale(0.5);
    var t0 = Date.now();
    function animate() {
      var ep = Math.min(1, (Date.now() - t0) / 300);
      var e = 1 - Math.pow(1 - ep, 3);
      setOpacity(e);
      setScale(0.5 + e * 0.5);
      if (ep < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        function drift() {
          var t = (Date.now() - startTime.current) / 1000;
          setOffset({ x: Math.sin(t * 0.7 + phase.current) * 4, y: Math.cos(t * 0.5 + phase.current * 1.3) * 3 });
          rafRef.current = requestAnimationFrame(drift);
        }
        rafRef.current = requestAnimationFrame(drift);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  var cs = confirming ? Math.max(0, 1 - confirming * 2) : 1;

  return (
    <div
      style={{
        transform: `translate(${offset.x}px,${offset.y}px) scale(${scale * cs})`,
        opacity: opacity * cs,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1.5px solid " + INK,
        padding: "5px 11px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        cursor: "pointer",
        color: INK,
        background: BG,
        boxShadow: "1px 1px 0 " + INK_LIGHT,
      }}
      onClick={() => onRemove(tag)}
    >
      {tag} <span style={{ opacity: 0.4, fontSize: 11 }}>×</span>
    </div>
  );
}
