// Bottom sheet for creating a spontaneous circle after a pulse chat fades.
// Pre-fills the name from both users and the shared tags.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { FloatingTagDisplay } from "../common/FloatingTagDisplay.jsx";
import { Portal } from "../common/Portal.jsx";

export function SpontaneousCircleSheet({ currentUser, otherUser, sharedTags, onCreate, onDismiss }) {
  var [visible, setVisible] = useState(false);
  var names = [currentUser.displayName, otherUser.displayName].sort();
  var autoName = names[0] + " & " + names[1] + "'s Circle";
  var [circleName, setCircleName] = useState(autoName);
  var inputRef = useRef(null);

  useEffect(() => {
    var t = setTimeout(() => {
      setVisible(true);
      setTimeout(() => inputRef.current && inputRef.current.focus(), 350);
    }, 80);
    return () => clearTimeout(t);
  }, []);

  var tags = sharedTags.length > 0 ? sharedTags : otherUser.tags.slice(0, 4);

  function handleCreate() {
    onCreate({ name: circleName.trim() || autoName, tags, type: "closed", governance: { mode: "admin", admins: [] }, passphrase: "", pulseable: false });
  }

  return (
    <Portal>
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100vw", zIndex: 200, transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ background: BG, border: "2px solid " + INK, borderBottom: "none", padding: "22px 22px 32px", boxShadow: "0 -4px 0 " + INK, boxSizing: "border-box", maxWidth: 430, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Start a Circle</div>
            <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: 0 }}>×</button>
          </div>
          <input ref={inputRef} value={circleName} onChange={e => setCircleName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleCreate(); }} maxLength={48} style={{ background: "none", border: "none", borderBottom: "2px solid " + INK, outline: "none", fontFamily: font, color: INK, width: "100%", fontSize: 17, fontWeight: 900, padding: "6px 0", letterSpacing: 0.5, marginBottom: 10 }} />
          <div style={{ fontSize: 9, color: INK_MID, marginBottom: tags.length > 0 ? 16 : 22 }}>Private · admin rule · {tags.length > 0 ? "your shared tags" : "no shared tags yet"}</div>
          {tags.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 10 }}>Starting from</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 36 }}>
                {tags.map((t, i) => <FloatingTagDisplay key={t} tag={t} index={i} />)}
              </div>
            </div>
          )}
          <button onClick={handleCreate} style={{ width: "100%", background: INK, color: BG, border: "none", padding: "14px 0", fontFamily: font, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Create Circle →</button>
        </div>
      </div>
    </Portal>
  );
}
