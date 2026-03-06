// A tag chip that animates in and gently drifts after appearing.
// Used in read-only contexts like the pulse check card and spontaneous circle sheet.

import { useState, useRef, useEffect } from "react";
import { INK_MID, INK_LIGHT, BG } from "../../constants/theme.js";

export function FloatingTagDisplay({ tag, index }) {
  var [offset, setOffset] = useState({ x: 0, y: 0 });
  var [opacity, setOpacity] = useState(0);
  var [scale, setScale] = useState(0.5);
  var rafRef = useRef(null);
  var startTime = useRef(Date.now());
  var phase = useRef(index * 1.3 + Math.random() * Math.PI * 2);

  useEffect(() => {
    var t0 = Date.now();
    function animate() {
      var ep = Math.min(1, (Date.now() - t0) / 400);
      var e = 1 - Math.pow(1 - ep, 3);
      setOpacity(e);
      setScale(0.5 + e * 0.5);
      if (ep < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        function drift() {
          var t = (Date.now() - startTime.current) / 1000;
          setOffset({ x: Math.sin(t * 0.7 + phase.current) * 5, y: Math.cos(t * 0.5 + phase.current * 1.3) * 3.5 });
          rafRef.current = requestAnimationFrame(drift);
        }
        rafRef.current = requestAnimationFrame(drift);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{
      transform: `translate(${offset.x}px,${offset.y}px) scale(${scale})`,
      opacity,
      display: "inline-flex",
      alignItems: "center",
      padding: "5px 11px",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: INK_MID,
      border: "1.5px solid " + INK_LIGHT,
      background: BG,
    }}>
      {tag}
    </div>
  );
}
