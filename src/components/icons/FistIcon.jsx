// Raised solidarity fist — used to represent Democracy governance mode.

import { INK } from "../../constants/theme.js";

export function FistIcon({ size = 16, color = INK }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 24 26" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <rect x={5}   y={3}  width={4}  height={7} rx={2} fill={color} />
      <rect x={9.5} y={2}  width={4}  height={8} rx={2} fill={color} />
      <rect x={14}  y={3}  width={4}  height={7} rx={2} fill={color} />
      <rect x={5}   y={8}  width={13} height={3} rx={1} fill={color} />
      <rect x={5}   y={10} width={13} height={8} rx={1.5} fill={color} />
      <rect x={1.5} y={12} width={5}  height={4} rx={2} fill={color} />
      <rect x={6}   y={17} width={10} height={5} rx={1} fill={color} />
    </svg>
  );
}
