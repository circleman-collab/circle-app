// Renders the static Andersonville street map as an SVG layer.
// Accepts panX/panY to offset the view as the user drags the map.

import { BG, BG_OUTER, INK_LIGHT, INK_MID } from "../../constants/theme.js";
import { CITY_BLOCKS } from "../../utils/map.js";
import { font } from "../../constants/theme.js";

export function CityMapLayer({ panX, panY }) {
  var { streets, labels, landmarks, buildings } = CITY_BLOCKS;
  var ox = 175 - 700 + panX, oy = 210 - 840 + panY;
  function wx(x) { return x + ox; }
  function wy(y) { return y + oy; }

  return (
    <g style={{ pointerEvents: "none" }}>
      <rect x={wx(0)} y={wy(0)} width={1400} height={1680} fill={BG} />
      <rect x={wx(250)} y={wy(350)} width={950} height={1000} fill={BG_OUTER} opacity="0.3" />

      {buildings.map((b, i) => (
        <rect key={i}
          x={wx(b.x)} y={wy(b.y)}
          width={b.w} height={b.h}
          fill={INK_LIGHT}
          stroke={INK_MID}
          strokeWidth="0.4"
          opacity="0.28"
          transform={`rotate(${b.angle},${wx(b.x)},${wy(b.y)})`}
        />
      ))}

      {streets.map((s, i) => (
        <line key={i}
          x1={wx(s.x1)} y1={wy(s.y1)} x2={wx(s.x2)} y2={wy(s.y2)}
          stroke={s.major ? INK_MID : INK_LIGHT}
          strokeWidth={s.major ? 1.4 : 0.6}
          opacity={s.diag && s.major ? 0.7 : s.major ? 0.55 : 0.3}
        />
      ))}

      {landmarks.map((l, i) => {
        var lines = l.name.split("\\n");
        return (
          <g key={i}>
            <rect x={wx(l.x)} y={wy(l.y)} width={l.w} height={l.h}
              fill={l.fill ? INK_LIGHT : BG} stroke={INK_LIGHT} strokeWidth="0.8" opacity="0.5" />
            {lines.map((line, j) => (
              <text key={j}
                x={wx(l.x + l.w / 2)}
                y={wy(l.y + l.h / 2 + (j - (lines.length - 1) / 2) * 7)}
                textAnchor="middle" fontSize="5" fontWeight="700"
                fill={INK_MID} fontFamily={font} letterSpacing="0.5" opacity="0.7">
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {labels.map((l, i) => {
        if (l.diagonal) {
          return (
            <text key={i} x={wx(l.x)} y={wy(l.y)}
              fontSize="5.5" fontWeight="700" fill={INK_MID} fontFamily={font}
              letterSpacing="0.8" opacity="0.6"
              transform={`rotate(-73,${wx(l.x)},${wy(l.y)})`}>
              {l.text}
            </text>
          );
        }
        return (
          <text key={i} x={wx(l.x)} y={wy(l.y)}
            fontSize="5" fontWeight="600" fill={INK_MID} fontFamily={font}
            letterSpacing="0.6" opacity="0.5"
            transform={l.horiz ? undefined : `rotate(-90,${wx(l.x)},${wy(l.y)})`}>
            {l.text}
          </text>
        );
      })}
    </g>
  );
}
