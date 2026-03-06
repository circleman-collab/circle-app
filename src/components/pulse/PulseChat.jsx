// Temporary limited chat between two users who found each other via Pulse.
// After PULSE_CHAT_LIMIT messages, the chat fades and prompts to start a circle.

import { useState, useRef, useEffect } from "react";
import { INK, INK_LIGHT, INK_MID, BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { PULSE_CHAT_LIMIT } from "../../constants/settings.js";
import { StaticAvatar } from "../avatar/StaticAvatar.jsx";
import { FloatingTagDisplay } from "../common/FloatingTagDisplay.jsx";

export function PulseChat({ currentUser, otherUser, onStartCircle, onConnect, onDismiss }) {
  var [msgs, setMsgs] = useState([]);
  var [input, setInput] = useState("");
  var [faded, setFaded] = useState(false);
  var [isTyping, setIsTyping] = useState(false);
  var inputRef = useRef(null);
  var msgsRef = useRef(null);
  var responseIdx = useRef(0);
  var sharedTags = (currentUser.tags || []).filter(t => (otherUser.tags || []).includes(t));
  var remaining = PULSE_CHAT_LIMIT - msgs.length;
  var locked = remaining <= 0 || faded;

  useEffect(() => { if (inputRef.current && !locked) inputRef.current.focus(); }, [locked]);
  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs, isTyping]);

  function send() {
    if (!input.trim() || locked) return;
    var nm = { id: Math.random().toString(36).slice(2), senderId: currentUser.id, senderHandle: currentUser.handle, text: input.trim() };
    var next = [...msgs, nm];
    setMsgs(next);
    setInput("");
    if (next.length >= PULSE_CHAT_LIMIT) { setFaded(true); return; }
    var pool = otherUser.responses || ["..."];
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      var resp = pool[responseIdx.current % pool.length];
      responseIdx.current++;
      var rm = { id: Math.random().toString(36).slice(2), senderId: otherUser.id, senderHandle: otherUser.handle, text: resp };
      setMsgs(prev => { var updated = [...prev, rm]; if (updated.length >= PULSE_CHAT_LIMIT) setFaded(true); return updated; });
    }, 850 + Math.random() * 600);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG }}>
      <div style={{ padding: "14px 18px", borderBottom: "1.5px solid " + INK, display: "flex", alignItems: "center", gap: 12, minHeight: 56 }}>
        <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: INK, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", padding: "0 8px 0 0" }}>←</button>
        <StaticAvatar tags={otherUser.tags} size={30} color={INK} bg={BG} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1, color: INK }}>{otherUser.displayName}</div>
          {otherUser.status && <div style={{ fontSize: 10, color: INK_MID, fontStyle: "italic" }}>"{otherUser.status}"</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: faded ? INK_LIGHT : remaining <= 2 ? INK : INK_MID }}>{remaining}</div>
          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: INK_LIGHT }}>left</div>
        </div>
      </div>

      <div ref={msgsRef} style={{ flex: 1, padding: "16px 18px", overflowY: "auto", overscrollBehavior: "contain", display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
        {msgs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
            {otherUser.status && <div style={{ fontSize: 12, color: INK_MID, fontStyle: "italic", textAlign: "center", padding: "8px 16px", border: "1px solid " + INK_LIGHT }}>"{otherUser.status}"</div>}
            <div style={{ fontSize: 11, color: INK_MID, textAlign: "center", lineHeight: 1.9, maxWidth: 220 }}>A temporary channel.<br />{PULSE_CHAT_LIMIT} messages to figure out what this is.</div>
            {sharedTags.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 }}>{sharedTags.map((t, i) => <FloatingTagDisplay key={t} tag={t} index={i} />)}</div>}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={m.id || i} style={{ display: "flex", flexDirection: "column", alignItems: m.senderId === currentUser.id ? "flex-end" : "flex-start", gap: 3 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK_MID }}>{m.senderId === currentUser.id ? "You" : m.senderHandle}</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: INK, maxWidth: "78%", textAlign: m.senderId === currentUser.id ? "right" : "left" }}>{m.text}</div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, opacity: 0.5 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK_MID }}>{otherUser.handle}</div>
            <div style={{ fontSize: 12, color: INK_MID, letterSpacing: 2 }}>···</div>
          </div>
        )}
        {faded && (
          <div style={{ marginTop: 12, padding: "14px 0", borderTop: "1px solid " + INK_LIGHT, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: INK_MID, fontStyle: "italic", textAlign: "center" }}>This pulse faded.</div>
            <button onClick={() => onStartCircle(otherUser, sharedTags)} style={{ background: INK, color: BG, border: "none", padding: "12px 24px", fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Start a Circle →</button>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 18px", borderTop: "1px solid " + INK_LIGHT, display: "flex", gap: 8 }}>
        <button onClick={() => onStartCircle(otherUser, sharedTags)} style={{ flex: 1, background: "none", border: "1.5px solid " + INK, color: INK, padding: "10px 0", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>Start a Circle →</button>
        <button onClick={onConnect} style={{ flex: 1, background: "none", border: "1.5px solid " + INK_LIGHT, color: INK_MID, padding: "10px 0", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>Connect →</button>
      </div>

      {!locked && (
        <div style={{ padding: "10px 18px 16px", borderTop: "1.5px solid " + INK, display: "flex", gap: 10, alignItems: "center" }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder="Say something..." style={{ flex: 1, background: "none", border: "none", borderBottom: "1.5px solid " + INK, outline: "none", fontFamily: font, fontSize: 16, color: INK, padding: "6px 0" }} />
          <button onClick={send} style={{ background: INK, color: BG, border: "none", padding: "10px 14px", fontFamily: font, fontWeight: 700, fontSize: 9, cursor: "pointer", letterSpacing: 1.5, minHeight: 44 }}>SEND</button>
        </div>
      )}
    </div>
  );
}
