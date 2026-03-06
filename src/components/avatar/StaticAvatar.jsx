// A non-animated avatar for use in lists, headers, and compact contexts.

import { INK, BG } from "../../constants/theme.js";
import { genAvatarPath } from "../../utils/avatar.js";

export function StaticAvatar({ tags, size = 24, color = INK, bg = BG }) {
  var path = genAvatarPath(tags, size);
  var cx = size / 2, cy = size / 2;
  var strokeW = size * 0.032 * (0.6 + (tags.length / 9) * 0.5);
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ display: "block", flexShrink: 0 }}>
      <path d={path} fill="none" stroke={color} strokeWidth={strokeW} />
      <circle cx={cx} cy={cy} r={size * 0.085} fill={color} />
      <circle cx={cx} cy={cy} r={size * 0.038} fill={bg} />
    </svg>
  );
}
