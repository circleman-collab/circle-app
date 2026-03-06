// Plays an unfold animation before a note is shown in the read modal.
// Appears briefly, then the parent swaps it for ReadNoteModal.

import { Portal } from "../common/Portal.jsx";
import { NotePaper } from "./NotePaper.jsx";

export function UnfoldModal({ note }) {
  return (
    <Portal>
      <div style={{ position: "fixed", inset: 0, zIndex: 350, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 340, animation: "noteUnfold 0.35s cubic-bezier(0.22,1,0.36,1)", transformOrigin: "center bottom" }}>
          <NotePaper note={note} />
        </div>
      </div>
    </Portal>
  );
}
