// Top banner notification that slides down when Pulse Check detects a
// nearby circle that shares tags with the current user.

import { useState, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { Portal } from "../common/Portal.jsx";

export function InterestMatchNotif({ circle, sharedTags, onGo, onDismiss }) {
  var [visible, setVisible] = useState(false);
  useEffect(() => { var t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  return (
    <Portal>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", zIndex: 120, transform: visible ? "translateY(0)" : "translateY(-100%)", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ background: BG, borderBottom: "2px solid " + INK, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 3px 0 " + INK_LIGHT, maxWidth: 430, margin: "0 auto" }}>
          <div style={{ fontSize: 12, color: INK_MID, flexShrink: 0 }}>◉</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: INK, letterSpacing: 0.3 }}>{circle.name}</div>
            <div style={{ fontSize: 9, color: INK_MID, marginTop: 1, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {sharedTags.slice(0, 3).map(t => <span key={t} style={{ background: INK, color: BG, padding: "1px 5px", fontSize: 7.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{t}</span>)}
              <span style={{ color: INK_MID }}>nearby</span>
            </div>
          </div>
          <button onClick={onGo} style={{ background: "none", border: "1px solid " + INK, color: INK, fontFamily: font, fontWeight: 700, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", padding: "5px 10px", flexShrink: 0, minHeight: 36 }}>Show →</button>
          <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: INK_MID, minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>×</button>
        </div>
      </div>
    </Portal>
  );
}
