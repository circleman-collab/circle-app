// The Profile tab — shows user identity, owned circles, and app settings.

import { INK, INK_LIGHT, INK_MID, BG } from "../constants/theme.js";
import { font } from "../constants/theme.js";
import { circleColor } from "../utils/avatar.js";
import { UserAvatar } from "../components/avatar/UserAvatar.jsx";
import { ProfileTagInput } from "../components/profile/ProfileTagInput.jsx";

export function ProfileView({ currentUser, allChats, onUpdateUser, onSelectChat, onEditCircle }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", overscrollBehavior: "contain" }}>
      {/* Identity section */}
      <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid " + INK_LIGHT }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <UserAvatar tags={currentUser.tags} size={56} color={INK} bg={BG} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              value={currentUser.displayName}
              onChange={e => onUpdateUser({ displayName: e.target.value })}
              style={{ background: "none", border: "none", borderBottom: "1px solid " + INK_LIGHT, outline: "none", fontFamily: font, fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: "uppercase", color: INK, width: "100%", padding: "2px 0", marginBottom: 4 }}
            />
            <input
              value={currentUser.handle}
              onChange={e => onUpdateUser({ handle: e.target.value.replace(/[\s]/g, "") })}
              style={{ background: "none", border: "none", borderBottom: "1px solid " + INK_LIGHT, outline: "none", fontFamily: font, fontSize: 10, letterSpacing: 1, color: INK_MID, width: "100%", padding: "2px 0", marginBottom: 4 }}
            />
            <input
              value={currentUser.status || ""}
              onChange={e => onUpdateUser({ status: e.target.value })}
              placeholder='"set a status"'
              style={{ background: "none", border: "none", borderBottom: "1px dashed " + INK_LIGHT, outline: "none", fontFamily: font, fontSize: 11, fontStyle: "italic", color: INK_MID, width: "100%", padding: "2px 0" }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 8 }}>Your interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {currentUser.tags.map(t => (
              <span key={t} onClick={() => onUpdateUser({ tags: currentUser.tags.filter(x => x !== t) })} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", border: "1.5px solid " + INK, padding: "3px 8px", color: INK, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                {t} <span style={{ opacity: 0.4, fontSize: 9 }}>x</span>
              </span>
            ))}
            {currentUser.tags.length < 9 && (
              <ProfileTagInput onAdd={tag => { if (!currentUser.tags.includes(tag)) onUpdateUser({ tags: [...currentUser.tags, tag] }); }} />
            )}
          </div>
        </div>
      </div>

      {/* Your circles */}
      <div style={{ padding: "20px 28px", borderBottom: "1px solid " + INK_LIGHT }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 12 }}>Your Circles</div>
        {allChats.filter(c => c.isOwn).length === 0
          ? <div style={{ fontSize: 11, color: INK_LIGHT, fontStyle: "italic" }}>You haven't planted any circles yet.</div>
          : allChats.filter(c => c.isOwn).map(c => {
            var col = circleColor(c);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid " + INK_LIGHT }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: c.type === "open" ? col : "none", border: "2px solid " + col, flexShrink: 0 }} />
                <div onClick={() => onSelectChat(c)} style={{ fontWeight: 700, fontSize: 12, color: INK, letterSpacing: 0.5, flex: 1, cursor: "pointer" }}>{c.name}</div>
                <div style={{ fontSize: 9, color: INK_MID, letterSpacing: 1, textTransform: "uppercase", marginRight: 8 }}>{c.type}</div>
                <button onClick={() => onEditCircle(c)} style={{ background: "none", border: "1px solid " + INK_LIGHT, color: INK_MID, fontFamily: font, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", minHeight: 28 }}>Edit</button>
              </div>
            );
          })
        }
      </div>

      {/* Settings */}
      <div style={{ padding: "20px 28px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID, marginBottom: 12 }}>Settings</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid " + INK_LIGHT }}>
          <div>
            <div style={{ fontSize: 12, color: INK, fontWeight: 700 }}>Pulse Check</div>
            <div style={{ fontSize: 9, color: INK_MID, marginTop: 2 }}>{currentUser.pulseCheck ? "Active" : "Off"}</div>
          </div>
          <div onClick={() => onUpdateUser({ pulseCheck: !currentUser.pulseCheck })} style={{ width: 36, height: 20, borderRadius: 10, background: currentUser.pulseCheck ? INK : INK_LIGHT, position: "relative", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: currentUser.pulseCheck ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + INK_LIGHT }}>
          <div>
            <div style={{ fontSize: 12, color: INK, fontWeight: 600 }}>Notifications</div>
            <div style={{ fontSize: 9, color: INK_MID, marginTop: 2 }}>{currentUser.notifications ? "On — you'll be alerted to activity" : "Off"}</div>
          </div>
          <div onClick={() => onUpdateUser({ notifications: !currentUser.notifications })} style={{ width: 36, height: 20, borderRadius: 10, background: currentUser.notifications ? INK : INK_LIGHT, position: "relative", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: currentUser.notifications ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
