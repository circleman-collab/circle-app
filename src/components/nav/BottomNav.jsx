// Bottom navigation bar with four tabs: Map, Circles, Pulse, Profile.
// The active tab shows its label with a fade; inactive tabs show an icon.

import { useState, useRef, useEffect } from "react";
import { INK, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { StaticAvatar } from "../avatar/StaticAvatar.jsx";

export function BottomNav({ tab, setTab, currentUser }) {
  var tabs = ["map", "circles", "pulse", "profile"];
  var [animatingTab, setAnimatingTab] = useState(tab);
  var [labelOpacity, setLabelOpacity] = useState(1);
  var rafRef = useRef(null);

  useEffect(() => {
    setLabelOpacity(0);
    var timer = setTimeout(() => {
      setAnimatingTab(tab);
      var start = performance.now();
      function fadeIn() {
        var p = Math.min(1, (performance.now() - start) / 180);
        setLabelOpacity(p);
        if (p < 1) rafRef.current = requestAnimationFrame(fadeIn);
      }
      rafRef.current = requestAnimationFrame(fadeIn);
    }, 90);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [tab]);

  function getIcon(name, active) {
    var c = active ? BG : INK_MID;
    if (name === "map") return (
      <svg width={36} height={36} viewBox="0 0 36 36">
        <line x1={18} y1={2}  x2={18} y2={12} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <line x1={18} y1={24} x2={18} y2={34} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <line x1={2}  y1={18} x2={12} y2={18} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <line x1={24} y1={18} x2={34} y2={18} stroke={c} strokeWidth={2} strokeLinecap="round" />
        <circle cx={18} cy={18} r={3} fill={c} />
      </svg>
    );
    if (name === "circles") return (
      <svg width={36} height={36} viewBox="0 0 36 36">
        <circle cx={18} cy={18} r={14} fill="none" stroke={c} strokeWidth={3} />
      </svg>
    );
    if (name === "pulse") return (
      <svg width={36} height={36} viewBox="0 0 36 36">
        <circle cx={18} cy={18} r={3}  fill={c} />
        <circle cx={18} cy={18} r={9}  fill="none" stroke={c} strokeWidth={1.8} strokeDasharray="3 3" />
        <circle cx={18} cy={18} r={15} fill="none" stroke={c} strokeWidth={1.2} strokeDasharray="2 4" />
      </svg>
    );
    if (name === "profile") return <StaticAvatar tags={currentUser?.tags || []} size={38} color={c} bg={active ? INK : BG} />;
    return null;
  }

  return (
    <div style={{ borderTop: "2px solid " + INK, display: "flex", paddingBottom: "env(safe-area-inset-bottom)", background: BG }}>
      {tabs.map((name, i) => {
        var active = tab === name;
        return (
          <button key={name} onClick={() => setTab(name)} style={{ flex: 1, minHeight: 76, background: active ? INK : BG, border: "none", borderRight: i < 3 ? "1px solid " + (active ? INK : INK_MID) : "none", fontFamily: font, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s" }}>
            {active
              ? <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase", color: BG, opacity: animatingTab === name ? labelOpacity : 0, transition: "opacity 0.09s", userSelect: "none" }}>{name}</span>
              : getIcon(name, false)}
          </button>
        );
      })}
    </div>
  );
}
