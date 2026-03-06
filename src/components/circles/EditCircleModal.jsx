// Bottom-sheet modal for editing an existing circle the user owns.

import { useState, useRef } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font, CIRCLE_PALETTE } from "../../constants/theme.js";
import { circleColor } from "../../utils/avatar.js";
import { FistIcon } from "../icons/FistIcon.jsx";
import { SpectaclesIcon } from "../icons/SpectaclesIcon.jsx";

export function EditCircleModal({ circle, onSave, onClose }) {
  var openedAt = useRef(Date.now());
  var [name, setName] = useState(circle.name);
  var [ctype, setCtype] = useState(circle.type);
  var [color, setColor] = useState(circleColor(circle));
  var [tags, setTags] = useState(circle.tags || []);
  var [tagInput, setTagInput] = useState("");
  var [govMode, setGovMode] = useState(circle.governance?.mode || "admin");
  var [passphrase, setPassphrase] = useState(circle.passphrase || "");
  var [pulseable, setPulseable] = useState(circle.pulseable !== false);

  function addTag(t) { var c = t.trim().toLowerCase().replace(/[^a-z0-9]/g, ""); if (!c || tags.includes(c) || tags.length >= 6) return; setTags(p => [...p, c]); setTagInput(""); }
  function removeTag(t) { setTags(p => p.filter(x => x !== t)); }

  function save() {
    var nameChanged = name.trim() !== circle.name;
    var tagsChanged = JSON.stringify([...tags].sort()) !== JSON.stringify([...circle.tags].sort());
    onSave({ ...circle, name: name.trim() || circle.name, type: ctype, color, tags, governance: { ...circle.governance, mode: govMode }, passphrase: passphrase.trim(), pulseable }, nameChanged, tagsChanged);
    onClose();
  }

  var bb = { fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", padding: "11px 0", border: "none" };
  var ii = { background: "none", border: "none", borderBottom: "1.5px solid " + INK_LIGHT, outline: "none", fontFamily: font, color: INK, width: "100%" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(10,10,10,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => { if (Date.now() - openedAt.current > 350) onClose(); }}>
      <div style={{ background: BG, border: "2px solid " + INK, borderBottom: "none", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 22px 36px", boxShadow: "0 -4px 0 " + INK, maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 18 }}>Edit Circle</div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 6 }}>Name</div>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={48} style={{ ...ii, fontSize: 15, fontWeight: 900, letterSpacing: 0.5, padding: "4px 0" }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Type</div>
          <div style={{ display: "flex", border: "2px solid " + INK }}>
            {["open", "closed", "hidden"].map((t, i) => {
              var sel = ctype === t;
              return <button key={t} onClick={() => setCtype(t)} style={{ flex: 1, padding: "10px 0", background: sel ? INK : BG, color: sel ? BG : INK, border: "none", borderRight: i < 2 ? "2px solid " + INK : "none", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>{t}</button>;
            })}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Tags <span style={{ opacity: 0.5, fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 9 }}>(tap to remove)</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {tags.map(t => <span key={t} onClick={() => removeTag(t)} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", border: "1.5px solid " + INK, padding: "3px 8px", color: INK, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>{t} <span style={{ opacity: 0.4 }}>×</span></span>)}
          </div>
          {tags.length < 6 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value.toLowerCase())} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTag(tagInput); } }} placeholder="add a tag..." maxLength={24} style={{ ...ii, fontSize: 13, padding: "4px 0", flex: 1 }} />
              <button onClick={() => addTag(tagInput)} style={{ background: INK, color: BG, border: "none", padding: "6px 12px", fontFamily: font, fontWeight: 700, fontSize: 9, cursor: "pointer", letterSpacing: 1 }}>+</button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Color</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CIRCLE_PALETTE.map(col => <div key={col} onClick={() => setColor(col)} style={{ width: 28, height: 28, background: col, cursor: "pointer", border: color === col ? "3px solid " + INK : "3px solid transparent", borderRadius: 2, boxSizing: "border-box" }} />)}
          </div>
        </div>

        <div style={{ marginBottom: ctype === "hidden" ? 18 : 24 }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Governance</div>
          <div style={{ display: "flex", border: "2px solid " + INK }}>
            {[{ key: "admin", label: "Admin Rule" }, { key: "democracy", label: "Democracy" }].map((opt, i) => {
              var sel = govMode === opt.key;
              return (
                <button key={opt.key} onClick={() => setGovMode(opt.key)} style={{ flex: 1, padding: "10px 0", background: sel ? INK : BG, color: sel ? BG : INK, border: "none", borderRight: i === 0 ? "2px solid " + INK : "none", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                  {opt.key === "democracy"
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><FistIcon size={13} color={sel ? BG : INK} /> Democracy</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><SpectaclesIcon size={11} color={sel ? BG : INK} /> Admin Rule</span>}
                </button>
              );
            })}
          </div>
        </div>

        {ctype === "hidden" && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 6 }}>Passphrase <span style={{ opacity: 0.5, fontWeight: 400, letterSpacing: 0, textTransform: "none", fontSize: 9 }}>(optional)</span></div>
            <input value={passphrase} onChange={e => setPassphrase(e.target.value)} placeholder="velvet fog..." maxLength={48} style={{ ...ii, fontSize: 14, fontStyle: "italic", padding: "4px 0" }} />
          </div>
        )}

        {ctype === "hidden" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid " + INK_LIGHT, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>Discoverable via Pulse</div>
              <div style={{ fontSize: 9, color: INK_MID, marginTop: 1 }}>{pulseable ? "Others can sense this circle" : "Invite only"}</div>
            </div>
            <div onClick={() => setPulseable(p => !p)} style={{ width: 36, height: 20, borderRadius: 10, background: pulseable ? INK : INK_LIGHT, position: "relative", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: pulseable ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>Cancel</button>
          <button onClick={save} style={{ ...bb, flex: 2, background: INK, color: BG }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
