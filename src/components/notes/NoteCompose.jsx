// Full-screen note composition view.
// Lets the user write a note, set its visibility, and add optional tags.

import { useState, useRef } from "react";
import { INK, INK_LIGHT, INK_MID, NOTE_BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { NOTE_MAX_CHARS } from "../../constants/settings.js";
import { TAG_SUGGESTIONS } from "../../constants/data.js";

export function NoteCompose({ onFinish, onCancel }) {
  var [text, setText] = useState("");
  var [tags, setTags] = useState([]);
  var [visibility, setVisibility] = useState("open");
  var [tagInput, setTagInput] = useState("");
  var inputRef = useRef(null);
  var remaining = NOTE_MAX_CHARS - text.length;
  var canFinish = text.trim().length > 0;

  function addTag(t) {
    var c = t.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (!c || tags.includes(c) || tags.length >= 6) return;
    setTags(p => [...p, c]);
    setTagInput("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1.5px solid " + INK, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, padding: 0 }}>←</button>
        <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: INK }}>New Note</span>
        <button
          onClick={() => { if (canFinish) onFinish({ text: text.trim(), tags, visibility }); }}
          style={{ background: canFinish ? INK : "none", color: canFinish ? NOTE_BG : INK_LIGHT, border: "1.5px solid " + (canFinish ? INK : INK_LIGHT), fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", cursor: canFinish ? "pointer" : "default", padding: "6px 12px" }}>
          Finish
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Paper */}
        <div style={{ background: NOTE_BG, border: "1.5px solid " + INK, boxShadow: "3px 3px 0 " + INK, padding: "20px 18px", position: "relative", boxSizing: "border-box" }}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ position: "absolute", left: 18, right: 18, top: 44 + i * 26, height: 1, background: INK_LIGHT, opacity: 0.35 }} />
          ))}
          <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: 1, background: "#c9a0a0", opacity: 0.4 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10, position: "relative" }}>
            <span style={{ fontSize: 8, color: remaining < 20 ? "#8a3a3a" : INK_LIGHT, fontWeight: 700, letterSpacing: 1 }}>{remaining}</span>
          </div>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => { if (e.target.value.length <= NOTE_MAX_CHARS) setText(e.target.value); }}
            placeholder="leave your mark..."
            rows={5}
            style={{ width: "100%", background: "none", border: "none", outline: "none", fontFamily: font, fontSize: 15, color: INK, lineHeight: 1.7, resize: "none", fontStyle: "italic", paddingLeft: 52, boxSizing: "border-box", position: "relative" }}
            autoFocus
          />
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed " + INK_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 52, color: INK_LIGHT, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Drawing — coming soon
          </div>
        </div>

        {/* Visibility */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Visibility</div>
          <div style={{ display: "flex", border: "1.5px solid " + INK }}>
            {["open", "closed", "hidden"].map((v, i) => {
              var sel = visibility === v;
              return (
                <button key={v} onClick={() => setVisibility(v)} style={{ flex: 1, padding: "10px 0", background: sel ? INK : NOTE_BG, color: sel ? NOTE_BG : INK, border: "none", borderRight: i < 2 ? "1px solid " + INK : "none", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>
            Tags <span style={{ fontWeight: 400, color: INK_LIGHT }}>(optional, max 6)</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {tags.map(t => (
              <div key={t} onClick={() => setTags(p => p.filter(x => x !== t))} style={{ border: "1.5px solid " + INK, padding: "5px 10px", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK, cursor: "pointer", background: NOTE_BG, display: "flex", alignItems: "center", gap: 6 }}>
                {t} <span style={{ color: INK_LIGHT, fontSize: 11 }}>×</span>
              </div>
            ))}
          </div>
          {tags.length < 6 && (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={tagInput} onChange={e => setTagInput(e.target.value.toLowerCase())} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTag(tagInput); } }} placeholder="add a tag..." maxLength={24} style={{ flex: 1, background: "none", border: "none", borderBottom: "1.5px solid " + INK, outline: "none", fontFamily: font, fontSize: 14, color: INK, padding: "4px 0" }} />
              <button onClick={() => addTag(tagInput)} style={{ background: INK, color: NOTE_BG, border: "none", padding: "6px 12px", fontFamily: font, fontWeight: 700, fontSize: 9, cursor: "pointer", letterSpacing: 1 }}>+</button>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).slice(0, 10).map(s => (
              <div key={s} onClick={() => addTag(s)} style={{ border: "1px dashed " + INK_LIGHT, padding: "5px 10px", fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", color: INK_MID, background: NOTE_BG }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
