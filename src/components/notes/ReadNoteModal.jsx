// Full-screen modal for reading a placed note.

import { Portal } from "../common/Portal.jsx";
import { NotePaper } from "./NotePaper.jsx";

export function ReadNoteModal({ note, onClose, smoothed = false }) {
  return (
    <Portal>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,10,0.5)", padding: "24px" }}
        onClick={onClose}
      >
        <div style={{ width: "100%", maxWidth: 340 }} onClick={e => e.stopPropagation()}>
          <NotePaper note={note} onClose={onClose} smoothed={smoothed} />
        </div>
      </div>
    </Portal>
  );
}
