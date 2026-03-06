// Slide-in panel showing the user's unplaced notes with options to compose or place them.

import { INK, INK_LIGHT, INK_MID, NOTE_BG } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";
import { NOTE_MAX_UNPLACED } from "../../constants/settings.js";
import { NotePaper } from "./NotePaper.jsx";

export function NotesPanel({ notes, onClose, onCompose, onPlace, onReadNote }) {
  var unplaced = notes.filter(n => !n.placed);
  var canCompose = unplaced.length < NOTE_MAX_UNPLACED;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1.5px solid " + INK, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: INK }}>Notes</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: INK, padding: 0 }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => { if (canCompose) onCompose(); }}
          style={{ width: "100%", background: canCompose ? INK : INK_LIGHT, color: canCompose ? NOTE_BG : "#e8e5de", border: "none", padding: "12px 0", fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: canCompose ? "pointer" : "default" }}>
          {canCompose ? `+ New Note` : `Full (${NOTE_MAX_UNPLACED}/${NOTE_MAX_UNPLACED})`}
        </button>

        {unplaced.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: INK_LIGHT, fontSize: 11, fontStyle: "italic" }}>
            No unplaced notes yet.
          </div>
        )}

        {unplaced.map(note => (
          <div key={note.id}>
            <NotePaper note={note} compact={true} />
            <button onClick={() => onPlace(note)} style={{ width: "100%", background: "none", border: "1.5px solid " + INK, borderTop: "none", padding: "10px 0", fontFamily: font, fontWeight: 700, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", color: INK }}>
              Place on Map →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
