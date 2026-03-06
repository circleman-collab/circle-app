// Inline tag input shown in the profile screen next to existing interest tags.
// Submits on Enter or Space to add a new tag.

import { useState } from "react";
import { INK_LIGHT, INK_MID } from "../../constants/theme.js";
import { font } from "../../constants/theme.js";

export function ProfileTagInput({ onAdd }) {
  var [val, setVal] = useState("");

  function submit() {
    var c = val.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (c) { onAdd(c); setVal(""); }
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); submit(); } }}
        placeholder="+ add tag"
        maxLength={20}
        style={{ background: "none", border: "none", borderBottom: "1px dashed " + INK_LIGHT, outline: "none", fontFamily: font, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: INK_MID, width: 68, padding: "3px 4px" }}
      />
    </span>
  );
}
