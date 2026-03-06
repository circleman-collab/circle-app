// Bottom sheet showing a nearby user's profile after Pulse Check discovers them.
// Lets the current user start a pulse chat.

import { useState, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { StaticAvatar } from "../avatar/StaticAvatar.jsx";
import { Portal } from "../common/Portal.jsx";

export function PulseCheckCard({ user, currentUser, onStartPulseChat, onDismiss }) {
  var [visible, setVisible] = useState(false);
  useEffect(() => { var t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);
  var sharedTags = (currentUser.tags || []).filter(t => (user.tags || []).includes(t));

  return (
    <Portal>
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100vw", zIndex: 150, transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ background: BG, border: "2px solid " + INK, borderBottom: "none", padding: "22px 22px 28px", boxShadow: "0 -4px 0 " + INK, maxWidth: 430, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>◉ Pulse Check</div>
            <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: 0 }}>×</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <StaticAvatar tags={user.tags} size={44} color={INK} bg={BG} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 1, color: INK }}>{user.displayName}</div>
              <div style={{ fontSize: 10, color: INK_MID, letterSpacing: 0.8, marginTop: 2 }}>{user.handle}</div>
              {user.status && <div style={{ fontSize: 11, color: INK, marginTop: 5, fontStyle: "italic", lineHeight: 1.5 }}>"{user.status}"</div>}
            </div>
          </div>
          {sharedTags.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 7 }}>You both care about</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sharedTags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", background: INK, color: BG, padding: "3px 9px" }}>{t}</span>)}
              </div>
            </div>
          )}
          {sharedTags.length === 0 && <div style={{ marginBottom: 18, fontSize: 11, color: INK_MID, fontStyle: "italic" }}>Both open to connection nearby.</div>}
          <button onClick={() => onStartPulseChat(user)} style={{ width: "100%", background: INK, color: BG, border: "none", padding: "14px 0", fontFamily: font, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Start a Pulse Chat →</button>
        </div>
      </div>
    </Portal>
  );
}
