// Bottom-sheet modal for joining a hidden circle.
// Lets the user choose between entering a passphrase, requesting access, or using an invite code.

import { useState } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { circleColor } from "../../utils/avatar.js";
import { Portal } from "../common/Portal.jsx";

export function JoinModal({ chat, onClose, onJoined, onRequestSent }) {
  var [track, setTrack] = useState(null);
  var [input, setInput] = useState("");
  var [status, setStatus] = useState(null);
  var color = circleColor(chat);

  var bb = { fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", padding: "12px 0", border: "none", width: "100%" };
  var ii = { background: "none", border: "none", borderBottom: "2px solid " + INK, outline: "none", fontFamily: font, color: INK, width: "100%", fontSize: 16, padding: "6px 0" };

  function tryPassphrase() {
    if (!input.trim()) return;
    if (input.trim().toLowerCase() === (chat.passphrase || "").toLowerCase()) {
      setStatus("success"); setTimeout(() => onJoined(chat), 900);
    } else {
      setStatus("error"); setTimeout(() => setStatus(null), 1400);
    }
  }

  function submitRequest() {
    if (!input.trim()) return;
    onRequestSent(chat.id, { id: Math.random().toString(36).slice(2), senderId: "user_local", senderHandle: "@you", message: input.trim(), timestamp: Date.now(), status: "pending" });
    setStatus("pending");
  }

  function tryInvite() {
    if (input.trim().length === 6) { setStatus("success"); setTimeout(() => onJoined(chat), 900); }
    else { setStatus("error"); setTimeout(() => setStatus(null), 1400); }
  }

  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(10,10,10,0.45)" }}>
        <div style={{ background: BG, border: "2px solid " + INK, borderBottom: "none", width: "100%", maxWidth: 390, padding: "28px 24px 36px", boxShadow: "0 -4px 0 " + INK }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 4 }}>Hidden Circle</div>
              <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: INK }}>{chat.name || "???"}</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>×</button>
          </div>

          {!track && status !== "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: INK_MID, marginBottom: 8, lineHeight: 1.7 }}>You've discovered something. How do you want to get in?</div>
              {[{ key: "passphrase", label: "I know the passphrase", icon: "◈" }, { key: "request", label: "Request access", icon: "◎" }, { key: "invite", label: "I have an invite code", icon: "◉" }].map(opt => (
                <div key={opt.key} onClick={() => { setTrack(opt.key); setInput(""); setStatus(null); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "2px solid " + INK_LIGHT, cursor: "pointer" }}>
                  <span style={{ fontSize: 16, color }}>{opt.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: INK, letterSpacing: 0.5 }}>{opt.label}</span>
                </div>
              ))}
            </div>
          )}

          {track === "passphrase" && status !== "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Enter the passphrase</div>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") tryPassphrase(); }} placeholder="speak the words..." style={{ ...ii, fontStyle: "italic" }} autoFocus />
              {status === "error" && <div style={{ fontSize: 10, color: "#7a3a3a", fontWeight: 700, letterSpacing: 1 }}>Wrong passphrase. Try again.</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setTrack(null)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
                <button onClick={tryPassphrase} style={{ ...bb, flex: 2, background: INK, color: BG }}>Enter →</button>
              </div>
            </div>
          )}

          {track === "request" && status !== "pending" && status !== "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Make your case</div>
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Why should they let you in?" rows={4} style={{ background: "none", border: "none", borderBottom: "none", outline: "none", fontFamily: font, color: INK, width: "100%", resize: "none", lineHeight: 1.6, fontSize: 16, border: "1.5px solid " + INK_LIGHT, padding: "10px 12px" }} autoFocus />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setTrack(null)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
                <button onClick={submitRequest} style={{ ...bb, flex: 2, background: INK, color: BG }}>Send Request</button>
              </div>
            </div>
          )}

          {track === "request" && status === "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 24, opacity: 0.3 }}>◎</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, textAlign: "center" }}>Request Sent</div>
              <div style={{ fontSize: 11, color: INK_MID, textAlign: "center", lineHeight: 1.8, maxWidth: 240 }}>
                {chat.governance?.mode === "democracy" ? "The circle will vote on your request." : "An admin will review your request."}
              </div>
              <button onClick={onClose} style={{ ...bb, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID, marginTop: 8 }}>Close</button>
            </div>
          )}

          {track === "invite" && status !== "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Invite code</div>
              <input value={input} onChange={e => setInput(e.target.value.toUpperCase().slice(0, 6))} onKeyDown={e => { if (e.key === "Enter") tryInvite(); }} placeholder="XXXXXX" style={{ ...ii, letterSpacing: 6, fontSize: 22, fontWeight: 900 }} autoFocus />
              {status === "error" && <div style={{ fontSize: 10, color: "#7a3a3a", fontWeight: 700, letterSpacing: 1 }}>Invalid code.</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setTrack(null)} style={{ ...bb, flex: 1, background: "none", border: "2px solid " + INK_LIGHT, color: INK_MID }}>← Back</button>
                <button onClick={tryInvite} style={{ ...bb, flex: 2, background: input.length === 6 ? INK : "none", color: input.length === 6 ? BG : INK_LIGHT, border: "2px solid " + (input.length === 6 ? INK : INK_LIGHT) }}>Verify →</button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 28 }}>◉</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK, textAlign: "center" }}>You're in</div>
              <div style={{ fontSize: 11, color: INK_MID, textAlign: "center" }}>Welcome to the circle.</div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
