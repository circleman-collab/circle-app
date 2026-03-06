// The chat panel shown when a user opens a specific circle.
// Displays the message thread and a send-message input.

import { INK, INK_LIGHT, INK_MID, BG } from "../constants/theme.js";
import { font } from "../constants/theme.js";

export function ChatView({ selectedChat, currentUser, msgs, msgInput, setMsgInput, onBack, onSendMsg, onEditCircle }) {
  var chatColor = selectedChat ? selectedChat.color || INK : INK;

  return (
    <>
      <div style={{ padding: "16px 18px", borderBottom: "1.5px solid " + INK, display: "flex", alignItems: "center", gap: 14, minHeight: 56 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: INK, padding: "0 8px 0 0", minWidth: 44, minHeight: 44, display: "flex", alignItems: "center" }}>&#8592;</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: chatColor, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", color: INK }}>{selectedChat.name}</div>
            <div style={{ fontSize: 10, color: INK_MID, letterSpacing: 0.8, marginTop: 2 }}>{selectedChat.type.toUpperCase()} · {selectedChat.dist}mi</div>
          </div>
        </div>
        {selectedChat.isOwn && (
          <button onClick={onEditCircle} style={{ background: "none", border: "1px solid " + INK_LIGHT, color: INK_MID, fontFamily: font, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "5px 10px", cursor: "pointer", minHeight: 32, flexShrink: 0 }}>Edit</button>
        )}
      </div>

      {selectedChat.tags && selectedChat.tags.length > 0 && (
        <div style={{ padding: "8px 18px", borderBottom: "1px solid " + INK_LIGHT, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {selectedChat.tags.map(t => <span key={t} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", border: "1px solid " + INK_LIGHT, padding: "2px 7px", color: INK_MID }}>{t}</span>)}
        </div>
      )}

      <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={m.id || i} style={{ paddingBottom: 10, borderBottom: "1px solid " + INK_LIGHT }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: m.senderId === currentUser.id ? INK : INK_MID, marginBottom: 3 }}>
              {m.senderId === currentUser.id ? "You" : m.senderHandle}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: INK }}>{m.text}</div>
          </div>
        ))}
        {msgs.length === 0 && <div style={{ color: INK_MID, fontSize: 13, fontStyle: "italic" }}>No messages yet. Say something.</div>}
      </div>

      <div style={{ padding: "12px 18px", borderTop: "1.5px solid " + INK, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={msgInput}
          onChange={e => setMsgInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSendMsg(); }}
          placeholder="Write something..."
          style={{ flex: 1, background: "none", border: "none", borderBottom: "1.5px solid " + INK, outline: "none", fontFamily: font, fontSize: 16, color: INK, padding: "6px 0" }}
        />
        <button onClick={onSendMsg} style={{ background: INK, color: BG, border: "none", padding: "10px 16px", fontFamily: font, fontWeight: 700, fontSize: 10, cursor: "pointer", letterSpacing: 1.5, minHeight: 44 }}>SEND</button>
      </div>
    </>
  );
}
