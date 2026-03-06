// Produces a sinusoidal offset value that creates a trembling visual effect.
// Used on markers that appear while a user is holding down on the map.

import { useState, useRef, useEffect } from "react";

export function useTremor(active, freq, amp) {
  var [offset, setOffset] = useState(0);
  var rafRef = useRef(null);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      setOffset(0);
      return;
    }
    function loop() {
      setOffset(Math.sin(performance.now() / freq) * amp);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, freq, amp]);

  return offset;
}
