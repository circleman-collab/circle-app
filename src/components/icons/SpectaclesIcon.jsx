// Wire-frame spectacles — used to represent Admin Rule governance mode.

import { INK } from "../../constants/theme.js";

export function SpectaclesIcon({ size = 16, color = INK }) {
  var sw = 1.6;
  return (
    <svg width={size * 1.4} height={size * 0.7} viewBox="0 0 32 16" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <circle cx={8}  cy={8} r={6} fill="none" stroke={color} strokeWidth={sw} />
      <circle cx={24} cy={8} r={6} fill="none" stroke={color} strokeWidth={sw} />
      <path d="M 14 8 Q 16 6 18 8" fill="none" stroke={color} strokeWidth={sw} />
      <line x1={2}  y1={5} x2={0}  y2={3} stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={30} y1={5} x2={32} y2={3} stroke={color} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}
