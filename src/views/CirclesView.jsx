// The Circles tab — a scrollable list of all circles within the drawn radius.
// Prompts users to draw a radius on the map first if they haven't yet.

import { INK, INK_LIGHT, INK_MID, BG } from "../constants/theme.js";
import { FistIcon } from "../components/icons/FistIcon.jsx";
import { SpectaclesIcon } from "../components/icons/SpectaclesIcon.jsx";
import { circleColor } from "../utils/avatar.js";

export function CirclesView({ hasRadius, allChats, currentUser, joinedIds, revealedIds, radius, onChatClick }) {
  if (!hasRadius) {
    return (
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
        <div style={{ padding: "32px 18px", color: INK_MID, fontSize: 13, fontStyle: "italic", textAlign: "center" }}>
          Draw your circle on the map first.
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
      {allChats.map(c => {
        var color = circleColor(c);
        var isHidden = c.type === "hidden";
        var isRevealed = revealedIds.has(c.id);
        var isJoined = joinedIds.has(c.id);

        if (isHidden && !isRevealed) return null;

        var sharedTags = (currentUser.tags || []).filter(t => c.tags.includes(t));
        var inRadius = c.r <= radius;
        var isActive = c.isOwn || isJoined || (c.type === "open" && inRadius);

        return (
          <div key={c.id} onClick={() => onChatClick(c)} style={{ padding: "15px 18px", borderBottom: "1px solid " + INK_LIGHT, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, minHeight: 64, opacity: isActive ? 1 : 0.4, transition: "opacity 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 11, height: 11, borderRadius: "50%", flexShrink: 0, background: c.type === "open" ? color : "none", border: "2px " + (c.type === "hidden" ? "dashed" : "solid") + " " + color }} />
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: INK }}>{isHidden && !isJoined ? "???" : c.name}</div>
                  <div style={{ fontSize: 10, color: INK_MID, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {c.dist}mi
                    {c.members ? " · " + c.members + " members" : ""}
                    {c.governance && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                        {" · "}{c.governance.mode === "democracy" ? <FistIcon size={14} /> : <SpectaclesIcon size={12} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", border: "1.5px " + (c.type === "hidden" ? "dashed" : "solid") + " " + color, padding: "4px 8px", color: c.type === "open" ? BG : color, background: c.type === "open" ? color : "none", flexShrink: 0 }}>
                {isHidden ? (isJoined ? "hidden" : "?") : c.type}
              </div>
            </div>
            {sharedTags.length > 0 && !isHidden && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, paddingLeft: 21 }}>
                <span style={{ fontSize: 8, color: INK_MID }}>shared:</span>
                {sharedTags.map(t => <span key={t} style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: INK, color: BG, padding: "1px 6px" }}>{t}</span>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
