// Three-step onboarding wizard shown on first launch.
// Step 1: Name + handle. Step 2: Interest tags. Step 3: Status + Pulse Check toggle.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { ALL_INTEREST_TAGS, DEFAULT_PRESETS } from "../../constants/data.js";
import { UserAvatar } from "../avatar/UserAvatar.jsx";

export function OnboardingFlow({ onComplete }) {
  var [step, setStep] = useState(1);
  var [name, setName] = useState("");
  var [handle, setHandle] = useState("");
  var [tags, setTags] = useState([]);
  var [tagInput, setTagInput] = useState("");
  var [status, setStatus] = useState("");
  var [pulseCheck, setPulseCheck] = useState(false);
  var [avatarBurst, setAvatarBurst] = useState(false);
  var [avatarGrand, setAvatarGrand] = useState(false);
  var [avatarAnimStyle, setAvatarAnimStyle] = useState(0);
  var inputRef = useRef(null);

  var bb = { fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", padding: "12px 0", border: "none", width: "100%" };
  var ii = { background: "none", border: "none", borderBottom: "2px solid " + INK, outline: "none", fontFamily: font, color: INK, width: "100%" };

  useEffect(() => { if (inputRef.current) inputRef.current.focus(); }, [step]);

  function addTag(t) {
    var c = t.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    if (!c || tags.includes(c) || tags.length >= 9) return;
    var next = [...tags, c];
    setTags(next);
    setTagInput("");
    var isGrand = next.length === 9;
    setAvatarGrand(isGrand);
    setAvatarAnimStyle(isGrand ? 0 : Math.floor(Math.random() * 4));
    setAvatarBurst(true);
  }

  function removeTag(t) {
    setTags(p => p.filter(x => x !== t));
    setAvatarGrand(false);
    setAvatarAnimStyle(Math.floor(Math.random() * 4));
    setAvatarBurst(true);
  }

  var canNext1 = name.trim().length >= 2 && handle.trim().length >= 2;
  var canNext2 = tags.length >= 5;

  function finish() {
    var hh = handle.trim().startsWith("@") ? handle.trim() : "@" + handle.trim();
    onComplete({ id: "user_local", displayName: name.trim(), handle: hh, tags, status: status.trim(), pulseCheck, notifications: true, statusPresets: [...DEFAULT_PRESETS] });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <div style={{ padding: "32px 28px 0" }}>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: INK, marginBottom: 6 }}>Circle</div>
        <div style={{ fontSize: 10, color: INK_MID, letterSpacing: 2, fontWeight: 700, marginBottom: 28 }}>STEP {step} OF 3</div>
        <div style={{ height: 2, background: INK_LIGHT, marginBottom: 32, position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", background: INK, width: ((step / 3) * 100) + "%", transition: "width 0.4s" }} />
        </div>
      </div>

      {step === 1 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px 32px", gap: 28, overflowY: "auto" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 6 }}>Who are you?</div>
            <div style={{ fontSize: 13, color: INK_MID, lineHeight: 1.7 }}>No photo required. Your identity here is your name, your handle, and what you care about.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <UserAvatar tags={tags} size={140} color={INK} bg={BG} burst={avatarBurst} grand={avatarGrand} animStyle={avatarAnimStyle} onBurstEnd={() => { setAvatarBurst(false); setAvatarGrand(false); }} />
            <div style={{ fontSize: 9, color: INK_LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Your avatar — shaped by your interests</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Display name</div>
              <input ref={inputRef} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={32} style={{ ...ii, fontSize: 20, fontWeight: 900, padding: "6px 0" }} onKeyDown={e => { if (e.key === "Enter" && canNext1) setStep(2); }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Handle</div>
              <input value={handle} onChange={e => setHandle(e.target.value.replace(/\s/g, ""))} placeholder="@yourhandle" maxLength={24} style={{ ...ii, fontSize: 16, fontWeight: 700, padding: "6px 0", color: INK_MID }} onKeyDown={e => { if (e.key === "Enter" && canNext1) setStep(2); }} />
              <div style={{ fontSize: 9, color: INK_LIGHT, marginTop: 6 }}>This is how others see you in circles.</div>
            </div>
          </div>
          <button onClick={() => { if (canNext1) setStep(2); }} style={{ ...bb, background: canNext1 ? INK : "none", color: canNext1 ? BG : INK_LIGHT, border: "2px solid " + (canNext1 ? INK : INK_LIGHT), marginTop: "auto" }}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px 32px", gap: 20, overflowY: "auto" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 6 }}>What are you into?</div>
            <div style={{ fontSize: 13, color: INK_MID, lineHeight: 1.7 }}>Pick 5–9 interests. These shape your avatar, your pulse signal, and what circles find you.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "12px 0" }}>
            <UserAvatar tags={tags} size={120} color={INK} bg={BG} burst={avatarBurst} grand={avatarGrand} animStyle={avatarAnimStyle} onBurstEnd={() => { setAvatarBurst(false); setAvatarGrand(false); }} />
            <div style={{ fontSize: 9, color: INK_LIGHT, letterSpacing: 1, textTransform: "uppercase" }}>{tags.length} / 9 selected</div>
          </div>
          <div style={{ minHeight: 56, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
            {tags.length === 0 && <span style={{ fontSize: 10, color: INK_LIGHT, fontStyle: "italic" }}>Tap interests below to add them</span>}
            {tags.map(t => (
              <div key={t} onClick={() => removeTag(t)} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: INK, color: BG, padding: "5px 10px", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
                {t} <span style={{ opacity: 0.5 }}>×</span>
              </div>
            ))}
          </div>
          {tags.length < 9 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input ref={step === 2 ? inputRef : null} value={tagInput} onChange={e => setTagInput(e.target.value.toLowerCase())} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTag(tagInput); } }} placeholder="or type your own..." maxLength={24} style={{ ...ii, fontSize: 16, padding: "6px 0", flex: 1 }} />
              <button onClick={() => addTag(tagInput)} style={{ background: tagInput.trim() ? INK : "none", color: tagInput.trim() ? BG : INK_LIGHT, border: "none", padding: "8px 14px", fontFamily: font, fontWeight: 700, fontSize: 10, cursor: "pointer", letterSpacing: 1, minHeight: 44 }}>+</button>
            </div>
          )}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 10 }}>Suggestions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ALL_INTEREST_TAGS.filter(s => !tags.includes(s)).map(s => (
                <div key={s} onClick={() => { if (tags.length < 9) addTag(s); }} style={{ border: "1.5px solid " + INK_LIGHT, padding: "8px 12px", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: tags.length < 9 ? "pointer" : "default", color: tags.length < 9 ? INK_MID : INK_LIGHT, minHeight: 36, display: "inline-flex", alignItems: "center" }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 9, color: INK_MID }}>{Math.max(0, 5 - tags.length)} more needed to continue</div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => setStep(1)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={() => { if (canNext2) setStep(3); }} style={{ ...bb, flex: 2, background: canNext2 ? INK : "none", color: canNext2 ? BG : INK_LIGHT, border: "2px solid " + (canNext2 ? INK : INK_LIGHT) }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 28px 32px", gap: 24, overflowY: "auto" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 6 }}>Right now</div>
            <div style={{ fontSize: 13, color: INK_MID, lineHeight: 1.7 }}>A short, optional signal. What are you open to?</div>
          </div>
          <div>
            <input ref={step === 3 ? inputRef : null} value={status} onChange={e => setStatus(e.target.value.slice(0, 50))} placeholder="open to chat, have a seat..." style={{ ...ii, fontSize: 16, fontWeight: 600, fontStyle: status ? "normal" : "italic", padding: "6px 0" }} onKeyDown={e => { if (e.key === "Enter") finish(); }} />
            <div style={{ fontSize: 9, color: INK_LIGHT, marginTop: 6, textAlign: "right" }}>{status.length}/50</div>
          </div>
          <div style={{ border: "2px solid " + INK, padding: "18px 16px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div onClick={() => setPulseCheck(p => !p)} style={{ width: 36, height: 20, borderRadius: 10, background: pulseCheck ? INK : INK_LIGHT, position: "relative", flexShrink: 0, cursor: "pointer", transition: "background 0.15s", marginTop: 2 }}>
              <div style={{ position: "absolute", top: 3, left: pulseCheck ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13, color: INK, letterSpacing: 0.5, marginBottom: 4 }}>Pulse Check</div>
              <div style={{ fontSize: 11, color: INK_MID, lineHeight: 1.7 }}>{pulseCheck ? "Active. When you're near someone open to connection, both of you will feel it." : "Off. Enable to be discovered by people and circles nearby in real time."}</div>
            </div>
          </div>
          <div style={{ background: "#e8e5de", padding: "14px 16px", fontSize: 10, color: INK_MID, lineHeight: 1.8 }}>
            <span style={{ fontWeight: 700, color: INK }}>Pulse Check</span> uses approximate location only. You control when it's on.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderTop: "1px solid " + INK_LIGHT }}>
            <UserAvatar tags={tags} size={80} color={INK} bg={BG} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: INK, letterSpacing: 1 }}>{name || "You"}</div>
              <div style={{ fontSize: 10, color: INK_MID, marginTop: 2 }}>{handle.startsWith("@") ? handle : "@" + handle}</div>
              <div style={{ fontSize: 10, color: INK_MID, marginTop: 2, fontStyle: "italic" }}>{status || "no status set"}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <button onClick={() => setStep(2)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
            <button onClick={finish} style={{ ...bb, flex: 2, background: INK, color: BG }}>Enter Circle →</button>
          </div>
        </div>
      )}
    </div>
  );
}
