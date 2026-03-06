// Multi-step wizard for creating a new circle.
// Steps: name → type → tags → governance → color → (passphrase, hidden only)

import { useState, useEffect, useRef } from "react";
import { INK, INK_LIGHT, INK_MID, BG, CIRCLE_PALETTE } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { TAG_SUGGESTIONS } from "../../constants/data.js";
import { FloatingTag } from "../common/FloatingTag.jsx";
import { FistIcon } from "../icons/FistIcon.jsx";
import { SpectaclesIcon } from "../icons/SpectaclesIcon.jsx";

export function CreateFlow({ onComplete, onCancel }) {
  var [step, setStep] = useState(1);
  var [name, setName] = useState("");
  var [ctype, setCtype] = useState(null);
  var [pulseable, setPulseable] = useState(true);
  var [tags, setTags] = useState([]);
  var [tagInput, setTagInput] = useState("");
  var [govMode, setGovMode] = useState("admin");
  var [adminsInput, setAdminsInput] = useState("");
  var [passphrase, setPassphrase] = useState("");
  var [confirming, setConfirming] = useState(0);
  var [circColor, setCircColor] = useState(CIRCLE_PALETTE[0]);
  var inputRef = useRef(null);
  var confirmRaf = useRef(null);

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [step]);

  function addTag(t) { var c = t.trim().toLowerCase().replace(/[^a-z0-9]/g, ""); if (!c || tags.includes(c) || tags.length >= 6) return; setTags(p => [...p, c]); setTagInput(""); }
  function removeTag(t) { setTags(p => p.filter(x => x !== t)); }

  function handleCreate() {
    if (!canCreate) return;
    var start = Date.now();
    function anim() {
      var p = Math.min(1, (Date.now() - start) / 500);
      setConfirming(p);
      if (p < 1) { confirmRaf.current = requestAnimationFrame(anim); }
      else {
        onComplete({
          name: name.trim(), type: ctype, pulseable, tags,
          passphrase: passphrase.trim(),
          governance: { mode: govMode, admins: adminsInput.split(",").map(s => s.trim()).filter(Boolean) },
          color: circColor,
        });
      }
    }
    confirmRaf.current = requestAnimationFrame(anim);
  }

  var canNext1 = name.trim().length >= 2;
  var canNext2 = ctype !== null;
  var canNext3 = tags.length >= 3;
  var canCreate = canNext3;
  var totalSteps = ctype === "hidden" ? 6 : 5;

  var bb = { fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", padding: "12px 0", border: "none" };
  var ii = { background: "none", border: "none", borderBottom: "2px solid " + INK, outline: "none", fontFamily: font, color: INK, width: "100%" };

  var typeOptions = [
    { key: "open",   label: "Open",   desc: "Anyone nearby can join" },
    { key: "closed", label: "Closed", desc: "Invite only" },
    { key: "hidden", label: "Hidden", desc: "Discovered via Pulse" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1.5px solid " + INK, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", padding: 0 }}>←</button>
        <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: INK }}>New Circle</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: INK_MID, letterSpacing: 1, minWidth: 44, textAlign: "right" }}>{step} / {totalSteps}</span>
      </div>

      {step === 1 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 28px", gap: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Name your circle</div>
          <input ref={inputRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && canNext1) setStep(2); }} placeholder="WHAT IS IT CALLED" maxLength={32} style={{ ...ii, fontSize: 22, fontWeight: 900, letterSpacing: 1, padding: "8px 0", textTransform: "uppercase" }} />
          <button onClick={() => { if (canNext1) setStep(2); }} style={{ ...bb, background: canNext1 ? INK : "none", color: canNext1 ? BG : INK_LIGHT, border: "2px solid " + (canNext1 ? INK : INK_LIGHT) }}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 28px", gap: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 4 }}>What kind of circle?</div>
          {typeOptions.map(opt => {
            var sel = ctype === opt.key;
            return (
              <div key={opt.key}>
                <div onClick={() => { setCtype(opt.key); if (opt.key !== "hidden") setPulseable(true); }} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", border: "2px solid " + (sel ? INK : INK_LIGHT), cursor: "pointer", background: sel ? INK : BG }}>
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    {opt.key === "open"   && <circle cx="11" cy="11" r="9" fill={sel ? BG : INK} />}
                    {opt.key === "closed" && <circle cx="11" cy="11" r="8" fill="none" stroke={sel ? BG : INK} strokeWidth="2" />}
                    {opt.key === "hidden" && <g>{[-3, -1, 1, 3].map(ii2 => { var hw = Math.sqrt(Math.max(0, 81 - ii2 * ii2 * 4)); return <line key={ii2} x1={11 - hw} y1={11 + ii2 * 1.8} x2={11 + hw} y2={11 + ii2 * 1.8} stroke={sel ? BG : INK} strokeWidth="0.8" opacity="0.5" />; })}<circle cx="11" cy="11" r="8" fill="none" stroke={sel ? BG : INK} strokeWidth="1.5" strokeDasharray="3 2" /></g>}
                  </svg>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 13, color: sel ? BG : INK, letterSpacing: 0.5 }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: sel ? INK_LIGHT : INK_MID, marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
                {opt.key === "hidden" && sel && (
                  <div onClick={() => setPulseable(p => !p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderLeft: "2px solid " + INK, borderRight: "2px solid " + INK, borderBottom: "2px solid " + INK, cursor: "pointer", background: BG }}>
                    <div style={{ width: 32, height: 18, borderRadius: 9, background: pulseable ? INK : INK_LIGHT, position: "relative", flexShrink: 0, transition: "background 0.15s" }}>
                      <div style={{ position: "absolute", top: 3, left: pulseable ? 16 : 3, width: 12, height: 12, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>Discoverable via Pulse</div>
                      <div style={{ fontSize: 9, color: INK_MID, marginTop: 1 }}>{pulseable ? "Others can sense this circle nearby" : "Invite only — completely off the map"}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(1)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={() => { if (canNext2) setStep(3); }} style={{ ...bb, flex: 2, background: canNext2 ? INK : "none", color: canNext2 ? BG : INK_LIGHT, border: "2px solid " + (canNext2 ? INK : INK_LIGHT) }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px", gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Tag it</div>
            <div style={{ fontSize: 10, color: INK_MID, marginTop: 6, lineHeight: 1.7 }}>Min 3, max 6.</div>
          </div>
          <div style={{ minHeight: 80, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "12px 0" }}>
            {tags.map(t => <FloatingTag key={t} tag={t} confirming={confirming} onRemove={removeTag} />)}
            {tags.length === 0 && <span style={{ fontSize: 10, color: INK_LIGHT, fontStyle: "italic" }}>Tags will float here</span>}
          </div>
          {tags.length < 6 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input ref={inputRef} value={tagInput} onChange={e => setTagInput(e.target.value.toLowerCase())} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTag(tagInput); } }} placeholder="add a tag..." maxLength={24} style={{ ...ii, fontSize: 16, padding: "6px 0", flex: 1 }} />
              <button onClick={() => addTag(tagInput)} style={{ background: INK, color: BG, border: "none", padding: "8px 14px", fontFamily: font, fontWeight: 700, fontSize: 10, cursor: "pointer", letterSpacing: 1, minHeight: 44 }}>+</button>
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Suggestions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TAG_SUGGESTIONS.filter(s => !tags.includes(s.replace(/[^a-z0-9]/g, ""))).slice(0, 8).map(s => (
                <div key={s} onClick={() => addTag(s)} style={{ border: "1px dashed " + INK_LIGHT, padding: "8px 12px", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", color: INK_MID, minHeight: 36, display: "inline-flex", alignItems: "center" }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 9, color: INK_MID }}>{tags.length}/6 · {Math.max(0, 3 - tags.length)} more needed</div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => setStep(2)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={() => { if (canNext3) setStep(4); }} style={{ ...bb, flex: 2, background: canNext3 ? INK : "none", color: canNext3 ? BG : INK_LIGHT, border: "2px solid " + (canNext3 ? INK : INK_LIGHT) }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px", gap: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Governance</div>
          <div style={{ display: "flex", border: "2px solid " + INK }}>
            {[{ key: "admin", label: "Admin Rule" }, { key: "democracy", label: "Democracy" }].map((opt, i) => {
              var sel = govMode === opt.key;
              return (
                <button key={opt.key} onClick={() => setGovMode(opt.key)} style={{ flex: 1, padding: "12px 0", background: sel ? INK : BG, color: sel ? BG : INK, border: "none", borderRight: i === 0 ? "2px solid " + INK : "none", fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>
                  {opt.key === "democracy"
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FistIcon size={18} color={sel ? BG : INK} /> Democracy</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><SpectaclesIcon size={14} color={sel ? BG : INK} /> Admin Rule</span>}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: INK_MID, lineHeight: 1.7 }}>{govMode === "admin" ? "Admins approve requests." : "Members vote. Majority rules."}</div>
          <input value={adminsInput} onChange={e => setAdminsInput(e.target.value)} placeholder="@handle, @handle..." style={{ ...ii, fontSize: 16, padding: "6px 0" }} />
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => setStep(3)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={() => setStep(5)} style={{ ...bb, flex: 2, background: INK, color: BG }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px", gap: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Choose a color</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "8px 0" }}>
            {CIRCLE_PALETTE.map(col => (
              <div key={col} onClick={() => setCircColor(col)} style={{ width: 32, height: 32, background: col, cursor: "pointer", border: circColor === col ? "3px solid " + INK : "3px solid transparent", borderRadius: 2, transition: "border 0.1s", boxSizing: "border-box" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px solid " + INK_LIGHT }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: ctype === "open" ? circColor : "none", border: "2px solid " + circColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: INK, fontWeight: 700, letterSpacing: 0.5 }}>{name || "Your circle"}</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => setStep(4)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={() => { if (ctype === "hidden") setStep(6); else handleCreate(); }} style={{ ...bb, flex: 2, background: INK, color: BG }}>{ctype === "hidden" ? "Continue →" : "Plant Circle"}</button>
          </div>
        </div>
      )}

      {step === 6 && ctype === "hidden" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 28px", gap: 28 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Set the passphrase</div>
            <div style={{ fontSize: 10, color: INK_MID, marginTop: 6, lineHeight: 1.7 }}>Optional. A secret phrase to enter.</div>
          </div>
          <input ref={inputRef} value={passphrase} onChange={e => setPassphrase(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleCreate(); }} placeholder="velvet fog..." maxLength={48} style={{ ...ii, fontSize: 18, fontWeight: 700, fontStyle: "italic", padding: "8px 0" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(5)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={handleCreate} style={{ ...bb, flex: 2, background: INK, color: BG }}>Plant Circle</button>
          </div>
        </div>
      )}
    </div>
  );
}
