// The Pulse tab — a large hold-to-fire pulse button plus Pulse Check controls.

import { INK, INK_LIGHT, INK_MID, BG } from "../constants/theme.js";
import { font } from "../constants/theme.js";
import { MAP_BTN_R, MAP_STAGE_R } from "../constants/settings.js";
import { PULSE_CIRCLES } from "../constants/data.js";
import { PulseParticles, BleedRings } from "../components/map/MapParticles.jsx";

export function PulseView({
  currentUser, pulseLabel, bumpActive, bumpPulse,
  pulseState, holdProgress, rippleProgress, returnProgress, pulseFired,
  touchPt, pulseParticles,
  nearbyUser, nearbyCircle, allChats,
  onPulseDown, onPulseUp, onPulseLeave,
  onTogglePulseCheck,
  onSimulatePersonPulse, onSimulateCirclePulse,
  onGoToMap,
}) {
  var BTN_R = MAP_BTN_R;
  var STAGE_R = MAP_STAGE_R;
  var isCharging = pulseState === "charging";
  var isFired = pulseState === "fired";
  var showReturn = returnProgress > 0;
  var eased = 1 - Math.pow(1 - returnProgress, 2);
  var retR = STAGE_R * (1 - eased) + BTN_R * eased;
  var retOp = returnProgress < 0.85 ? 0.7 : ((1 - returnProgress) / 0.15) * 0.7;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 24px", overflowY: "auto", overscrollBehavior: "contain" }}>
      {bumpActive && (
        <div style={{ width: "100%", background: INK, color: BG, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 14, transform: `scale(${bumpPulse})`, display: "inline-block" }}>◉</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Something nearby</div>
            <div style={{ fontSize: 9, opacity: 0.7 }}>Fire a pulse to find out what it is.</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>{pulseLabel}</div>

      <div
        style={{ position: "relative", width: BTN_R * 2 + 80, height: BTN_R * 2 + 80, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        onMouseDown={onPulseDown} onMouseUp={onPulseUp} onMouseLeave={onPulseLeave}
        onTouchStart={e => { e.preventDefault(); onPulseDown(e); }} onTouchEnd={onPulseUp}
      >
        <svg width={BTN_R * 2 + 80} height={BTN_R * 2 + 80} viewBox={(-40) + " " + (-40) + " " + (BTN_R * 2 + 80) + " " + (BTN_R * 2 + 80)} style={{ overflow: "visible" }}>
          {isCharging && <PulseParticles progress={holdProgress} tx={touchPt.x} ty={touchPt.y} fired={false} particles={pulseParticles} />}
          {isFired && pulseFired && <PulseParticles progress={rippleProgress} tx={touchPt.x} ty={touchPt.y} fired={true} particles={pulseParticles} />}
          {isFired && !showReturn && <BleedRings progress={rippleProgress} cx={BTN_R} cy={BTN_R} btnR={BTN_R} />}
          {showReturn && <circle cx={BTN_R} cy={BTN_R} r={STAGE_R} fill="none" stroke={INK} strokeWidth="0.5" opacity={0.15} />}
          {showReturn && <circle cx={BTN_R} cy={BTN_R} r={Math.max(BTN_R, retR)} fill="none" stroke={INK} strokeWidth="1.5" opacity={retOp} style={{ pointerEvents: "none" }} />}
          <circle cx={BTN_R} cy={BTN_R} r={BTN_R} fill={BG} />
          <defs><clipPath id="btnClip"><circle cx={BTN_R} cy={BTN_R} r={BTN_R - 1} /></clipPath></defs>
          <circle cx={BTN_R} cy={BTN_R} r={BTN_R - 1} fill="none" stroke={INK} strokeWidth="2" />
          <text x={BTN_R} y={BTN_R + 5} textAnchor="middle" fontSize="11" fontWeight="900" fill={INK} fontFamily={font} letterSpacing="3" style={{ pointerEvents: "none" }}>PULSE</text>
        </svg>
      </div>

      <div style={{ width: "100%", borderTop: "1px solid " + INK_LIGHT, paddingTop: 20, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: INK_MID }}>Pulse Check</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", border: "2px solid " + (currentUser.pulseCheck ? INK : INK_LIGHT), justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12, color: currentUser.pulseCheck ? INK : INK_MID }}>{currentUser.pulseCheck ? "Active — you're discoverable" : "Off — you're invisible"}</div>
            <div style={{ fontSize: 9, color: INK_MID, marginTop: 3, lineHeight: 1.6 }}>{currentUser.pulseCheck ? "Others with Pulse Check on can find you nearby." : "Enable to connect with people and circles around you."}</div>
          </div>
          <div onClick={onTogglePulseCheck} style={{ width: 36, height: 20, borderRadius: 10, background: currentUser.pulseCheck ? INK : INK_LIGHT, position: "relative", cursor: "pointer", transition: "background 0.15s", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 3, left: currentUser.pulseCheck ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: BG, transition: "left 0.15s" }} />
          </div>
        </div>

        <div style={{ width: "100%", padding: "14px 16px", border: "1.5px solid " + INK_LIGHT, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: INK_MID, marginBottom: 3 }}>Your Status</div>
            <div style={{ fontSize: 12, fontStyle: "italic", color: currentUser.status ? INK : INK_LIGHT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser.status ? `"${currentUser.status}"` : "not set"}
            </div>
          </div>
          <button onClick={onGoToMap} style={{ background: "none", border: "1px solid " + INK_LIGHT, color: INK_MID, fontFamily: font, fontWeight: 700, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", padding: "5px 10px", flexShrink: 0, minHeight: 32 }}>Edit →</button>
        </div>

        {currentUser.pulseCheck && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <button
              onClick={onSimulatePersonPulse}
              disabled={!!(nearbyUser || nearbyCircle)}
              style={{ width: "100%", background: (nearbyUser || nearbyCircle) ? "none" : INK, color: (nearbyUser || nearbyCircle) ? INK_LIGHT : BG, border: "2px solid " + ((nearbyUser || nearbyCircle) ? INK_LIGHT : INK), padding: "13px 0", fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: (nearbyUser || nearbyCircle) ? "default" : "pointer" }}>
              {nearbyUser ? "Signal active..." : "Simulate Nearby Person →"}
            </button>
            {(() => {
              var allFound = PULSE_CIRCLES.every(c => allChats.some(x => x.id === c.id));
              var busy = !!(nearbyUser || nearbyCircle);
              return (
                <button
                  onClick={onSimulateCirclePulse}
                  disabled={busy || allFound}
                  style={{ width: "100%", background: (busy || allFound) ? "none" : BG, color: (busy || allFound) ? INK_LIGHT : INK, border: "2px solid " + ((busy || allFound) ? INK_LIGHT : INK), padding: "13px 0", fontFamily: font, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: (busy || allFound) ? "default" : "pointer" }}>
                  {nearbyCircle ? "Signal active..." : allFound ? "All nearby circles found" : "Simulate Nearby Circle →"}
                </button>
              );
            })()}
          </div>
        )}

        {pulseState === "idle" && !bumpActive && (
          <div style={{ fontSize: 11, color: INK_MID, textAlign: "center", lineHeight: 1.8, maxWidth: 260 }}>
            A pulse signals your presence — and may reveal hidden circles nearby.
          </div>
        )}
      </div>
    </div>
  );
}
