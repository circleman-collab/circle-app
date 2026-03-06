// Renders children directly into document.body, outside the normal React tree.
// This prevents iOS Safari from collapsing the app layout during keyboard transitions,
// and ensures modals / bottom sheets always sit above every other element.

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }) {
  var [el] = useState(() => document.createElement("div"));
  useEffect(() => {
    document.body.appendChild(el);
    return () => document.body.removeChild(el);
  }, [el]);
  return createPortal(children, el);
}
