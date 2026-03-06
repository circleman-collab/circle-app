// Collapsible status bar at the top of the Map tab.
// Lets the user pick, add, or clear their current status message.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { DEFAULT_PRESETS } from "../../constants/data.js";

export function StatusTab({ currentUser, onUpdateStatus, onUpdatePresets }) {
  var [open, setOpen] = useState(false);
  var [customInput, setCustomInput] = useState("");
  var [addingCustom, setAddingCustom] = useState(false);
  var inputRef = useRef(null);
  var presets = currentUser.statusPresets || DEFAULT_PRESETS;
  var currentStatus = currentUser.status || "";

  useEffect(() => { if (addingCustom && inputRef.current) inputRef.current.focus(); }, [addingCustom]);

  function selectPreset(p) { onUpdateStatus(p); setOpen(false); }
  function clearStatus() { onUpdateStatus(""); setOpen(false); }
  function addCustom() {
    var v = customInput.trim();
    if (!v) return;
    onUpdatePresets([...presets, v]);
    onUpdateStatus(v);
    setCustomInput(""); setAddingCustom(false); setOpen(false);
  }
  function removePreset(p, e) {
    e.stopPropagation();
    onUpdatePresets(presets.filter(x => x !== p));
    if (currentStatus === p) onUpdateStatus("");
  }

  var hasStatus = !!currentStatus;

  return (
    <div style={{ position: "relative", zIndex: 60 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", height: 48, background: open ? INK : BG, borderBottom: "2px solid " + INK, cursor: "pointer", transition: "background 0.15s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: open ? BG : INK_MID, flexShrink: 0 }}>STATUS</span>
          <span style={{ fontSize: 13, fontStyle: "italic", color: open ? BG : (hasStatus ? INK : INK_LIGHT), fontWeight: hasStatus ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
            {`"${currentStatus || "set a status"}"`}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hasStatus && !open && (
            <span onClick={e => { e.stopPropagation(); clearStatus(); }} style={{ fontSize: 12, color: INK_LIGHT, cursor: "pointer", lineHeight: 1 }}>×</span>
          )}
          <span style={{ fontSize: 9, color: open ? BG : INK_MID, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000, background: BG, border: "1.5px solid " + INK, borderTop: "none", boxShadow: "0 4px 0 " + INK_LIGHT, maxHeight: 280, overflowY: "auto" }}>
          {hasStatus && (
            <div style={{ padding: "8px 16px", borderBottom: "1px solid " + INK_LIGHT, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID }}>Active</span>
              <button onClick={clearStatus} style={{ background: "none", border: "1px solid " + INK_LIGHT, color: INK_MID, fontFamily: font, fontWeight: 700, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", padding: "3px 8px" }}>Clear</button>
            </div>
          )}
          {presets.map((p, i) => {
            var isActive = p === currentStatus;
            return (
              <div key={i} onClick={() => selectPreset(p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: "1px solid " + INK_LIGHT, cursor: "pointer", background: isActive ? INK : BG, gap: 8, minHeight: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {isActive && <span style={{ fontSize: 8, color: BG, flexShrink: 0 }}>◉</span>}
                  <span style={{ fontSize: 12, fontStyle: "italic", color: isActive ? BG : INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{p}"</span>
                </div>
                {!isActive && (
                  <span onClick={e => removePreset(p, e)} style={{ fontSize: 16, color: INK_LIGHT, cursor: "pointer", flexShrink: 0, minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>×</span>
                )}
              </div>
            );
          })}
          {addingCustom ? (
            <div style={{ padding: "10px 16px", borderBottom: "1px solid " + INK_LIGHT, display: "flex", gap: 8, alignItems: "center" }}>
              <input ref={inputRef} value={customInput} onChange={e => setCustomInput(e.target.value.slice(0, 50))} onKeyDown={e => { if (e.key === "Enter") addCustom(); if (e.key === "Escape") { setAddingCustom(false); setCustomInput(""); } }} placeholder="write your own..." style={{ flex: 1, background: "none", border: "none", borderBottom: "1.5px solid " + INK, outline: "none", fontFamily: font, fontSize: 16, fontStyle: "italic", color: INK, padding: "4px 0" }} />
              <button onClick={addCustom} style={{ background: INK, color: BG, border: "none", padding: "6px 12px", fontFamily: font, fontWeight: 700, fontSize: 9, cursor: "pointer", letterSpacing: 1, minHeight: 44 }}>Add</button>
            </div>
          ) : (
            <div onClick={() => setAddingCustom(true)} style={{ padding: "11px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", minHeight: 44 }}>
              <span style={{ fontSize: 12, color: INK_LIGHT, lineHeight: 1 }}>+</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK_MID }}>Add custom</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
