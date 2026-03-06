// Renders a note as a piece of paper with ruled lines and a red margin.
// Used both in the notes panel (compact) and in the read modal (full).

import { INK, INK_LIGHT, INK_MID, NOTE_BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { noteDaysLeft } from "../../utils/notes.js";
import { NOTE_FADE_DAYS } from "../../constants/settings.js";

export function NotePaper({ note, onClose, compact = false, smoothed = false }) {
  var daysLeft = noteDaysLeft(note);
  var fading = daysLeft <= NOTE_FADE_DAYS;
  var lineCount = compact ? 5 : 8;

  return (
    <div style={{
      background: NOTE_BG,
      border: "1.5px solid " + INK,
      boxShadow: "3px 3px 0 " + INK,
      padding: compact ? "14px 16px" : "24px 22px",
      position: "relative",
      fontFamily: font,
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Ruled lines */}
      {Array.from({ length: lineCount }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: compact ? 16 : 22,
          right: compact ? 16 : 22,
          top: (compact ? 40 : 52) + i * (compact ? 22 : 26),
          height: 1,
          background: INK_LIGHT,
          opacity: 0.35,
        }} />
      ))}
      {/* Red margin line */}
      <div style={{ position: "absolute", left: compact ? 38 : 48, top: 0, bottom: 0, width: 1, background: "#c9a0a0", opacity: 0.4 }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: compact ? 10 : 16, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>
            {note.visibility.toUpperCase()}
          </span>
          {note.tags.length > 0 && (
            <span style={{ fontSize: 7, color: INK_LIGHT, letterSpacing: 1 }}>
              {note.tags.slice(0, 3).join(" · ")}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {fading && <span style={{ fontSize: 7, color: "#8a6a4a", fontWeight: 700, letterSpacing: 1 }}>{daysLeft}d left</span>}
          {onClose && <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: INK_MID, padding: 0, lineHeight: 1 }}>×</button>}
        </div>
      </div>

      {/* Note text */}
      <div style={{
        fontSize: compact ? 13 : 15,
        lineHeight: compact ? 1.65 : 1.7,
        color: INK,
        fontStyle: "italic",
        position: "relative",
        minHeight: compact ? 44 : 80,
        paddingLeft: compact ? 44 : 54,
      }}>
        {note.text || <span style={{ color: INK_LIGHT }}>empty note</span>}
      </div>

      {/* Drawing stub — reserved for a future feature */}
      {!compact && (
        <div style={{
          marginTop: 16, paddingTop: 12,
          borderTop: "1px dashed " + INK_LIGHT,
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 60, color: INK_LIGHT, fontSize: 9,
          fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
          position: "relative",
        }}>
          Drawing — coming soon
        </div>
      )}

      {/* Residual crinkle marks shown after a hidden note is smoothed */}
      {smoothed && (() => {
        var seed = note.id.charCodeAt(0) + (note.id.charCodeAt(1) || 7);
        return Array.from({ length: 6 }, (_, i) => {
          var x1 = ((seed * 17 + i * 31) % 160) + 20;
          var y1 = ((seed * 13 + i * 23) % 180) + 30;
          return (
            <div key={i} style={{
              position: "absolute",
              left: x1 + "%",
              top: y1 * 0.4 + "%",
              width: ((seed * 3 + i * 11) % 40) + 20,
              height: 1,
              background: INK_LIGHT,
              opacity: 0.18,
              transform: `rotate(${((seed + i * 7) % 30) - 15}deg)`,
              transformOrigin: "left center",
            }} />
          );
        });
      })()}
    </div>
  );
}
