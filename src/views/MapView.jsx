// The Map tab — the main interactive canvas where circles and notes live.
// Handles the draw-radius gesture, map panning, circle planting hold, and note placement.

import { INK, INK_LIGHT, INK_MID, BG, NOTE_BG } from "../constants/theme.js";
import { font } from "../constants/theme.js";
import { MAP_CX, MAP_CY } from "../constants/settings.js";
import { CityMapLayer } from "../components/map/CityMapLayer.jsx";
import { ChatMarker } from "../components/map/ChatMarker.jsx";
import { NearbyUserMarker } from "../components/map/NearbyUserMarker.jsx";
import { NearbyCircleMarker } from "../components/map/NearbyCircleMarker.jsx";
import { EnvelopeMarker } from "../components/map/EnvelopeMarker.jsx";
import { RadiusEdgeLabel } from "../components/map/RadiusEdgeLabel.jsx";
import { CoalesceParticles } from "../components/map/CoalesceParticles.jsx";
import { OutwardBurst, InwardRush, PlantParticles, PulseRipples } from "../components/map/MapParticles.jsx";
import { StatusTab } from "../components/nav/StatusTab.jsx";
import { NotesPanel } from "../components/notes/NotesPanel.jsx";
import { NoteCompose } from "../components/notes/NoteCompose.jsx";
import { wobblyPath } from "../utils/circles.js";

export function MapView({
  // user
  currentUser, onUpdateStatus, onUpdatePresets,
  // map state
  svgRef, panX, panY, drawPhase, drawPath, radius, circleScale,
  breathe, hasRadius, isDrawing, radiusMiles, visibleChats,
  // pulse state
  isFired, pulseFired, rippleProgress, returnProgress, showReturn,
  outwardParticles, inwardParticles,
  // nearby pulse
  nearbyUser, nearbyUserProgress, nearbyUserCoalesce,
  nearbyCircle, nearbyCircleProgress, nearbyCircleCoalesce,
  mapDimProgress,
  // circle data
  allChats, revealProgress, highlightedCircleId, joinedIds,
  // plant
  plantPos, plantHold, plantStamp, plantParticles,
  // notes
  notes, notesPanelOpen, notesView, placingNote, stampingNoteId, revealedNoteIds,
  // handlers
  onMapDown, onMapMove, onMapUp,
  onChatClick, onNoteClick,
  onNearbyUserClick, onNearbyCircleClick,
  onResetRadius, onResetPan,
  onOpenNotesPanel, onCloseNotesPanel, onSetNotesView,
  onStartPlacingNote, onCancelPlacingNote, onFinishNote,
  onUpdateUser,
}) {
  var CX = MAP_CX, CY = MAP_CY;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
      <StatusTab currentUser={currentUser} onUpdateStatus={onUpdateStatus} onUpdatePresets={onUpdatePresets} />

      {hasRadius && !allChats.some(c => c.isOwn) && (
        <div style={{ padding: "5px 18px", borderBottom: "1px solid " + INK_LIGHT, fontSize: 9, color: INK_MID, fontStyle: "italic" }}>
          Press and hold to plant a new circle
        </div>
      )}

      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 350 420"
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block", flex: 1, touchAction: "none" }}
          onMouseDown={onMapDown} onMouseMove={onMapMove} onMouseUp={onMapUp}
          onTouchStart={onMapDown} onTouchMove={onMapMove} onTouchEnd={onMapUp}
        >
          <CityMapLayer panX={panX} panY={panY} />

          {/* Distance reference rings */}
          {[70, 130, 190, 250].map(r => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={INK_LIGHT} strokeWidth="0.8" opacity="0.35" />
          ))}

          {/* Draw-radius prompt */}
          {drawPhase === "idle" && (
            <g>
              <circle cx={CX} cy={CY} r={160} fill="none" stroke={INK_LIGHT} strokeWidth="1.2" strokeDasharray="6 5" opacity="0.5" />
              <text x={CX} y={CY - 172} textAnchor="middle" fontSize="9" fontWeight="700" fill={INK_MID} fontFamily={font} letterSpacing="2">DRAW YOUR CIRCLE</text>
            </g>
          )}

          {/* Live draw path */}
          {isDrawing && drawPath.length > 1 && (
            <polyline points={drawPath.map(p => p.x + "," + p.y).join(" ")} fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="4 3" opacity="0.7" />
          )}

          {/* Radius lens */}
          {hasRadius && (
            <g transform={`translate(${CX},${CY}) scale(${circleScale}) translate(${-CX},${-CY})`}>
              <path d={wobblyPath(CX, CY, radius, 3.7)} fill={INK} fillOpacity="0.04" />
              <path d={wobblyPath(CX, CY, radius, 3.7)} fill="none" stroke="transparent" strokeWidth="28" style={{ cursor: "grab" }}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                onTouchStart={e => { e.stopPropagation(); }}
              />
              <path d={wobblyPath(CX, CY, radius, 3.7)} fill="none" stroke={INK} strokeWidth="2" style={{ pointerEvents: "none" }} />
              {[0, 90, 180, 270].map(ang => {
                var rad = (ang * Math.PI) / 180;
                var wr = radius + 2.2 * Math.sin(rad * 5 + 3.7) + 0.9 * Math.sin(rad * 11 + 3.32);
                var ox = CX + wr * Math.cos(rad - Math.PI / 2), oy = CY + wr * Math.sin(rad - Math.PI / 2);
                var nx = Math.cos(rad - Math.PI / 2), ny = Math.sin(rad - Math.PI / 2);
                return <line key={ang} x1={ox - nx * 7} y1={oy - ny * 7} x2={ox + nx * 7} y2={oy + ny * 7} stroke={INK} strokeWidth="1.5" style={{ pointerEvents: "none" }} />;
              })}
              {isFired && <PulseRipples cx={CX} cy={CY} maxR={radius} progress={rippleProgress} />}
              {isFired && pulseFired && <OutwardBurst progress={rippleProgress} cx={CX} cy={CY} radius={radius} particles={outwardParticles} />}
              {showReturn && <InwardRush progress={returnProgress} cx={CX} cy={CY} radius={radius} particles={inwardParticles} />}
            </g>
          )}

          {hasRadius && <RadiusEdgeLabel cx={CX} cy={CY} radius={radius} radiusMiles={radiusMiles} visibleCount={visibleChats.length} onReset={onResetRadius} />}

          {/* Pan group — all world-space objects */}
          <g transform={`translate(${panX},${panY})`}>
            {plantPos && <PlantParticles progress={plantHold} px={plantPos.x} py={plantPos.y} stamp={false} particles={plantParticles} />}
            {plantPos && plantStamp > 0 && <PlantParticles progress={plantStamp} px={plantPos.x} py={plantPos.y} stamp={true} particles={plantParticles} />}
            {plantPos && plantHold > 0 && (
              <g style={{ pointerEvents: "none" }}>
                <line x1={plantPos.x - 8} y1={plantPos.y} x2={plantPos.x + 8} y2={plantPos.y} stroke={INK} strokeWidth="1.5" opacity={plantHold} />
                <line x1={plantPos.x} y1={plantPos.y - 8} x2={plantPos.x} y2={plantPos.y + 8} stroke={INK} strokeWidth="1.5" opacity={plantHold} />
              </g>
            )}
            {nearbyUserCoalesce && <CoalesceParticles progress={nearbyUserProgress} particles={nearbyUserCoalesce} />}
            {nearbyCircleCoalesce && <CoalesceParticles progress={nearbyCircleProgress} particles={nearbyCircleCoalesce} />}
            {nearbyUser && <NearbyUserMarker user={nearbyUser} cx={CX} cy={CY} progress={nearbyUserProgress} onClick={onNearbyUserClick} />}
            {nearbyCircle && <NearbyCircleMarker circle={nearbyCircle} cx={CX} cy={CY} progress={nearbyCircleProgress} onClick={onNearbyCircleClick} />}
            {allChats.map(c => (
              <ChatMarker key={c.id} chat={c} cx={CX} cy={CY} onClick={onChatClick} radius={radius} revealProgress={revealProgress[c.id] || 0} highlighted={highlightedCircleId === c.id} panX={panX} panY={panY} />
            ))}
            {notes
              .filter(n => n.placed && n.placedPos)
              .filter(n => n.visibility !== "hidden" || revealedNoteIds.has(n.id) || n.ownerId === (currentUser?.id || "user_local"))
              .map(n => (
                <EnvelopeMarker key={n.id} note={n} x={n.placedPos.x} y={n.placedPos.y} onClick={onNoteClick} radius={radius} panX={panX} panY={panY} stamping={stampingNoteId === n.id} revealed={revealedNoteIds.has(n.id)} isOwn={n.ownerId === (currentUser?.id || "user_local")} />
              ))}
          </g>

          {/* User position dot */}
          <circle cx={CX} cy={CY} r={7 * breathe} fill="none" stroke={INK} strokeWidth="0.8" opacity={0.2} style={{ pointerEvents: "none" }} />
          <circle cx={CX} cy={CY} r={4} fill={INK} style={{ pointerEvents: "none" }} />
          <circle cx={CX} cy={CY} r={1.5} fill={BG} style={{ pointerEvents: "none" }} />
          <text x={CX + 8} y={CY + 13} fontSize="8" fill={INK_MID} fontFamily={font} letterSpacing="1" fontWeight="600" style={{ pointerEvents: "none" }}>
            {currentUser.handle.toUpperCase()}
          </text>
        </svg>

        {/* Return-to-me button */}
        {(panX !== 0 || panY !== 0) && (
          <button onClick={onResetPan} title="Return to me" style={{ position: "absolute", bottom: 14, left: 14, width: 36, height: 36, background: BG, border: "1.5px solid " + INK, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 40, boxShadow: "1px 1px 0 " + INK_LIGHT, fontFamily: font, fontSize: 14, lineHeight: 1 }}>◎</button>
        )}

        {/* Notes side tab toggle */}
        {!notesPanelOpen && !placingNote && (
          <button onClick={() => { onOpenNotesPanel(); onSetNotesView("list"); }} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: NOTE_BG, border: "1.5px solid " + INK, borderRight: "none", width: 38, padding: "16px 0", cursor: "pointer", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: "-1px 1px 0 " + INK_LIGHT }}>
            <svg width={16} height={18} viewBox="0 0 16 18">
              <rect x={1} y={2} width={14} height={15} fill={NOTE_BG} stroke={INK} strokeWidth="1.2" rx="0.5" />
              <rect x={5} y={0} width={2} height={4} fill={NOTE_BG} stroke={INK} strokeWidth="1.2" rx="0.5" />
              <rect x={9} y={0} width={2} height={4} fill={NOTE_BG} stroke={INK} strokeWidth="1.2" rx="0.5" />
              <line x1={4} y1={8}  x2={12} y2={8}  stroke={INK} strokeWidth="1" strokeLinecap="round" />
              <line x1={4} y1={11} x2={12} y2={11} stroke={INK} strokeWidth="1" strokeLinecap="round" />
              <line x1={4} y1={14} x2={9}  y2={14} stroke={INK} strokeWidth="1" strokeLinecap="round" />
            </svg>
            {notes.filter(n => !n.placed).length > 0 && (
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: NOTE_BG, lineHeight: 1 }}>{notes.filter(n => !n.placed).length}</span>
              </div>
            )}
          </button>
        )}

        {/* Notes slide panel */}
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "88%", maxWidth: 320, background: BG, borderLeft: "2px solid " + INK, transform: notesPanelOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)", zIndex: 60, display: "flex", flexDirection: "column", boxShadow: notesPanelOpen ? "-4px 0 0 " + INK_LIGHT : "none", pointerEvents: notesPanelOpen ? "auto" : "none" }}>
          {notesView === "list" && (
            <NotesPanel notes={notes} onClose={onCloseNotesPanel} onCompose={() => onSetNotesView("compose")} onPlace={onStartPlacingNote} onReadNote={() => {}} />
          )}
          {notesView === "compose" && (
            <NoteCompose onFinish={onFinishNote} onCancel={() => onSetNotesView("list")} />
          )}
        </div>

        {/* Note placement banner */}
        {placingNote && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 70, background: INK, color: NOTE_BG, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: font }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Tap map to place note</span>
            <button onClick={onCancelPlacingNote} style={{ background: "none", border: "1px solid " + NOTE_BG, color: NOTE_BG, fontFamily: font, fontWeight: 700, fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", padding: "4px 10px" }}>Cancel</button>
          </div>
        )}

        {/* Map dim overlay during Pulse Check animation */}
        {mapDimProgress > 0 && (
          <div style={{ position: "absolute", inset: 0, background: INK, opacity: mapDimProgress, pointerEvents: "none", transition: "opacity 0.08s" }} />
        )}
      </div>
    </div>
  );
}
