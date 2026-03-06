// Bottom sheet shown when a nearby hidden circle is discovered via Pulse Check.
// Lets the user attempt to join the circle.

import { useState, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { circleColor } from "../../utils/avatar.js";
import { Portal } from "../common/Portal.jsx";

export function CirclePulseCard({ circle, currentUser, onJoin, onDismiss }) {
  var [visible, setVisible] = useState(false);
  useEffect(() => { var t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);
  var sharedTags = (currentUser.tags || []).filter(t => (circle.tags || []).includes(t));
  var color = circleColor(circle);

  return (
    <Portal>
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100vw", zIndex: 150, transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ background: BG, border: "2px solid " + INK, borderBottom: "none", padding: "22px 22px 28px", boxShadow: "0 -4px 0 " + INK, maxWidth: 430, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>◉ Pulse Check — Hidden Circle</div>
            <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: 0 }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, border: "2px dashed " + color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color }}>?</span>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 1, color: INK }}>{circle.name}</div>
              <div style={{ fontSize: 10, color: INK_MID, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span>Hidden</span><span>·</span>
                <span>{circle.members} members</span><span>·</span>
                <span>{circle.governance.mode === "democracy" ? "Democracy" : "Admin rule"}</span>
              </div>
            </div>
          </div>
          {circle.tags.length > 0 && (
            <div style={{ marginBottom: sharedTags.length > 0 ? 12 : 18 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {circle.tags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", border: "1px solid " + INK_LIGHT, padding: "2px 7px", color: INK_MID }}>{t}</span>)}
              </div>
            </div>
          )}
          {sharedTags.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 7 }}>Matches your interests</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sharedTags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", background: INK, color: BG, padding: "3px 9px" }}>{t}</span>)}
              </div>
            </div>
          )}
          <button onClick={() => onJoin(circle)} style={{ width: "100%", background: INK, color: BG, border: "none", padding: "14px 0", fontFamily: font, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Try to Get In →</button>
        </div>
      </div>
    </Portal>
  );
}
