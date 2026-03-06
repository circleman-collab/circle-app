// Root orchestrator — all state lives here, views are purely presentational.
// No JSX markup beyond layout shell and modal/overlay composition.

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { BG, BG_OUTER, INK, INK_LIGHT, INK_MID, NOTE_BG } from "./constants/theme.js";
import { font } from "./constants/theme.js";
import { MAP_CX, MAP_CY, MAP_MIN_R, MAP_MAX_R, MAP_BTN_R, MAP_STAGE_R, HOLD_MS, PLANT_MS, NOTE_EXPIRE_DAYS, NOTE_FADE_DAYS } from "./constants/settings.js";
import { NEARBY_USERS, PULSE_CIRCLES, INIT_CHATS, DEFAULT_PRESETS } from "./constants/data.js";
import { makeCircle, makeMessage } from "./utils/circles.js";
import { makeNote } from "./utils/notes.js";
import { genPulseParticles, genOutwardParticles, genInwardParticles, genPlantParticles, genCoalesceParticles } from "./utils/particles.js";

import { OnboardingFlow } from "./components/onboarding/OnboardingFlow.jsx";
import { BottomNav } from "./components/nav/BottomNav.jsx";
import { JoinModal } from "./components/circles/JoinModal.jsx";
import { CreateFlow } from "./components/circles/CreateFlow.jsx";
import { EditCircleModal } from "./components/circles/EditCircleModal.jsx";
import { PulseCheckCard } from "./components/pulse/PulseCheckCard.jsx";
import { CirclePulseCard } from "./components/pulse/CirclePulseCard.jsx";
import { PulseChat } from "./components/pulse/PulseChat.jsx";
import { SpontaneousCircleSheet } from "./components/pulse/SpontaneousCircleSheet.jsx";
import { InterestMatchNotif } from "./components/pulse/InterestMatchNotif.jsx";
import { ReadNoteModal } from "./components/notes/ReadNoteModal.jsx";
import { CrumpledNoteReveal } from "./components/notes/CrumpledNoteReveal.jsx";
import { UnfoldModal } from "./components/notes/UnfoldModal.jsx";

import { MapView } from "./views/MapView.jsx";
import { CirclesView } from "./views/CirclesView.jsx";
import { PulseView } from "./views/PulseView.jsx";
import { ProfileView } from "./views/ProfileView.jsx";
import { ChatView } from "./views/ChatView.jsx";

const CX = MAP_CX, CY = MAP_CY, MIN_R = MAP_MIN_R, MAX_R = MAP_MAX_R;
const BTN_R = MAP_BTN_R, STAGE_R = MAP_STAGE_R;
const NEARBY_DUR = 4200;

export default function App() {
  // ── Global styles (iOS tap, scroll lock, animations) ──────────────────────
  useEffect(() => {
    var s = document.createElement("style");
    s.textContent = "*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;}input,textarea{-webkit-user-select:text;user-select:text;font-size:16px !important;}html{overflow:hidden;position:fixed;width:100%;height:100%;}body{overflow:hidden;position:fixed;width:100%;height:100%;overscroll-behavior:none;}#root{height:100%;width:100%;display:flex;flex-direction:column;}@keyframes envelopeWiggle{0%{transform:rotate(0deg);}20%{transform:rotate(-6deg);}40%{transform:rotate(5deg);}60%{transform:rotate(-3deg);}80%{transform:rotate(2deg);}100%{transform:rotate(0deg);}}@keyframes noteStamp{0%{transform:translateY(-18px) scale(1.15);opacity:0;}60%{transform:translateY(2px) scale(0.96);opacity:1;}80%{transform:translateY(-2px) scale(1.02);}100%{transform:translateY(0) scale(1);}}@keyframes noteUnfold{0%{transform:scaleY(0.05) scaleX(0.7);opacity:0;}60%{transform:scaleY(1.05) scaleX(1);}100%{transform:scaleY(1) scaleX(1);opacity:1;}}";
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  // ── User ──────────────────────────────────────────────────────────────────
  var [currentUser, setCurrentUser] = useState(null);
  var [tab, setTab] = useState("map");

  // ── Circles ───────────────────────────────────────────────────────────────
  var [allChats, setAllChats] = useState(INIT_CHATS);
  var [joinedIds, setJoinedIds] = useState(new Set());
  var [revealedIds, setRevealedIds] = useState(new Set());
  var [revealProgress, setRevealProgress] = useState({});
  var [joinTarget, setJoinTarget] = useState(null);
  var [selectedChat, setSelectedChat] = useState(null);
  var [editingCircle, setEditingCircle] = useState(null);
  var [creating, setCreating] = useState(false);
  var [pendingPos, setPendingPos] = useState(null);
  var [msgInput, setMsgInput] = useState("");
  var [highlightedCircleId, setHighlightedCircleId] = useState(null);
  var revealRafs = useRef({});

  // ── Notes ─────────────────────────────────────────────────────────────────
  var [notes, setNotes] = useState([]);
  var [revealedNoteIds, setRevealedNoteIds] = useState(new Set());
  var [smoothedNoteIds, setSmoothedNoteIds] = useState(new Set());
  var [crumpledNote, setCrumpledNote] = useState(null);
  var [stampingNoteId, setStampingNoteId] = useState(null);
  var [unfoldingNote, setUnfoldingNote] = useState(null);
  var [readingNote, setReadingNote] = useState(null);
  var [hiddenNoteNotif, setHiddenNoteNotif] = useState(null);
  var [notesPanelOpen, setNotesPanelOpen] = useState(false);
  var [notesView, setNotesView] = useState("list");
  var [placingNote, setPlacingNote] = useState(null);
  var placingNoteRef = useRef(null);
  var placeNoteRef = useRef(null);
  var hiddenNoteNotifTimer = useRef(null);
  function setPlacingNoteSync(v) { placingNoteRef.current = v; setPlacingNote(v); }

  // ── Map geometry ──────────────────────────────────────────────────────────
  var [radius, setRadius] = useState(null);
  var [drawPhase, setDrawPhase] = useState("idle");
  var drawPhaseRef = useRef("idle");
  function setDrawPhaseSync(v) { drawPhaseRef.current = v; setDrawPhase(v); }
  var [drawPath, setDrawPath] = useState([]);
  var [circleScale, setCircleScale] = useState(1);
  var [breathe, setBreathe] = useState(1);
  var [panX, setPanX] = useState(0);
  var [panY, setPanY] = useState(0);
  var svgRef = useRef(null);
  var svgRectCache = useRef(null);
  var dragging = useRef(false);
  var isPanning = useRef(false);
  var panOrigin = useRef(null);
  var panMoveTotal = useRef(0);
  var breatheRaf = useRef(null);

  // ── Plant hold ────────────────────────────────────────────────────────────
  var [plantHold, setPlantHold] = useState(0);
  var [plantPos, setPlantPos] = useState(null);
  var [plantStamp, setPlantStamp] = useState(0);
  var [plantParticles, setPlantParticles] = useState(() => genPlantParticles(85));
  var plantHoldActive = useRef(false);
  var plantHoldStart = useRef(null);
  var plantHoldProgressRef = useRef(0);
  var plantStampProgressRef = useRef(0);
  var plantPosRef = useRef(null);
  var plantRaf = useRef(null);
  var stampRaf = useRef(null);

  // ── Pulse ─────────────────────────────────────────────────────────────────
  var [pulseState, setPulseState] = useState("idle");
  var [holdProgress, setHoldProgress] = useState(0);
  var [rippleProgress, setRippleProgress] = useState(0);
  var [returnProgress, setReturnProgress] = useState(0);
  var [touchPt, setTouchPt] = useState({ x: 64, y: 64 });
  var [pulseFired, setPulseFired] = useState(false);
  var [pulseParticles, setPulseParticles] = useState(() => genPulseParticles(90));
  var [outwardParticles, setOutwardParticles] = useState(() => genOutwardParticles(69));
  var [inwardParticles, setInwardParticles] = useState(() => genInwardParticles(56));
  var pulseHoldStart = useRef(null);
  var pulseHoldRaf = useRef(null);
  var rippleRaf = useRef(null);
  var coolingTimer = useRef(null);

  // ── Nearby / Pulse Check ──────────────────────────────────────────────────
  var [nearbyUser, setNearbyUser] = useState(null);
  var [nearbyUserProgress, setNearbyUserProgress] = useState(0);
  var [nearbyUserCoalesce, setNearbyUserCoalesce] = useState(null);
  var [showPersonCard, setShowPersonCard] = useState(false);
  var [pulseChatUser, setPulseChatUser] = useState(null);
  var [spontaneousTarget, setSpontaneousTarget] = useState(null);
  var [nearbyCircle, setNearbyCircle] = useState(null);
  var [nearbyCircleProgress, setNearbyCircleProgress] = useState(0);
  var [nearbyCircleCoalesce, setNearbyCircleCoalesce] = useState(null);
  var [showCircleCard, setShowCircleCard] = useState(false);
  var [mapDimProgress, setMapDimProgress] = useState(0);
  var [bumpActive, setBumpActive] = useState(false);
  var [bumpPulse, setBumpPulse] = useState(1);
  var [interestMatchCircle, setInterestMatchCircle] = useState(null);
  var [interestMatchTags, setInterestMatchTags] = useState([]);
  var nearbyPersonRaf = useRef(null);
  var nearbyPersonStart = useRef(null);
  var nearbyCircleRaf = useRef(null);
  var nearbyCircleStart = useRef(null);
  var bumpRaf = useRef(null);
  var bumpT = useRef(0);
  var bumpTimer = useRef(null);
  var interestTimer = useRef(null);
  var pulseCheckKey = useRef(0);

  // ── Breathe loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "map") { cancelAnimationFrame(breatheRaf.current); return; }
    var t = 0;
    function loop() { t += 0.025; setBreathe(1 + 0.15 * Math.sin(t)); breatheRaf.current = requestAnimationFrame(loop); }
    breatheRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(breatheRaf.current);
  }, [tab]);

  // ── Bump pulse animation ──────────────────────────────────────────────────
  useEffect(() => {
    if (!bumpActive) { cancelAnimationFrame(bumpRaf.current); setBumpPulse(1); return; }
    function loop() { bumpT.current += 0.04; setBumpPulse(1 + 0.3 * Math.sin(bumpT.current)); bumpRaf.current = requestAnimationFrame(loop); }
    bumpRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(bumpRaf.current);
  }, [bumpActive]);

  // ── Pulse Check side effects ───────────────────────────────────────────────
  useEffect(() => {
    setBumpActive(false); setInterestMatchCircle(null);
    clearTimeout(bumpTimer.current); clearTimeout(interestTimer.current);
    cancelAnimationFrame(nearbyPersonRaf.current); cancelAnimationFrame(nearbyCircleRaf.current);
    setNearbyUser(null); setNearbyUserProgress(0); setNearbyUserCoalesce(null); setShowPersonCard(false);
    setNearbyCircle(null); setNearbyCircleProgress(0); setNearbyCircleCoalesce(null); setShowCircleCard(false);
    setMapDimProgress(0);
    if (!currentUser?.pulseCheck) return;
    var key = ++pulseCheckKey.current;
    bumpTimer.current = setTimeout(() => {
      if (pulseCheckKey.current !== key) return;
      setBumpActive(true); setTimeout(() => setBumpActive(false), 3000);
    }, 3000);
    interestTimer.current = setTimeout(() => {
      if (pulseCheckKey.current !== key) return;
      var userTags = currentUser.tags || [];
      var best = INIT_CHATS
        .filter(c => c.type !== "hidden" && !joinedIds.has(c.id))
        .map(c => ({ c, shared: c.tags.filter(t => userTags.includes(t)) }))
        .filter(x => x.shared.length > 0)
        .sort((a, b) => b.shared.length - a.shared.length)[0];
      if (best) { setInterestMatchCircle(best.c); setInterestMatchTags(best.shared); setTimeout(() => setInterestMatchCircle(null), 3000); }
    }, 6000);
    return () => { clearTimeout(bumpTimer.current); clearTimeout(interestTimer.current); };
  }, [currentUser?.pulseCheck]);

  // ── Hidden circle reveal animation ───────────────────────────────────────
  function revealHiddenCircle(id) {
    if (revealedIds.has(id)) return;
    setRevealedIds(prev => new Set([...prev, id]));
    var start = performance.now(), dur = 1800;
    function tick() { var p = Math.min(1, (performance.now() - start) / dur); setRevealProgress(prev => ({ ...prev, [id]: p })); if (p < 1) revealRafs.current[id] = requestAnimationFrame(tick); }
    revealRafs.current[id] = requestAnimationFrame(tick);
  }

  // ── Coalesce animation runner ─────────────────────────────────────────────
  function runCoalesceAnim(tx, ty, setProgress, setCoalesce, setCard, rafRef, startRef, onTick) {
    setProgress(0); setMapDimProgress(0); setCard(false);
    setCoalesce(genCoalesceParticles(65, tx, ty));
    startRef.current = performance.now();
    function tick() {
      var p = Math.min(1, (performance.now() - startRef.current) / NEARBY_DUR);
      setProgress(p); if (onTick) onTick(p);
      var dim = p < 0.55 ? (p / 0.55) * 0.46 : p < 0.78 ? 0.46 : Math.max(0, 0.46 * (1 - (p - 0.78) / 0.08));
      setMapDimProgress(dim);
      if (p < 1) { rafRef.current = requestAnimationFrame(tick); } else { setMapDimProgress(0); setCoalesce(null); setCard(true); }
    }
    rafRef.current = requestAnimationFrame(tick);
    setTab("map");
  }

  // ── Simulation handlers ───────────────────────────────────────────────────
  function simulatePersonPulse() {
    if (nearbyUser || nearbyCircle) return;
    setBumpActive(false); setInterestMatchCircle(null);
    var userTags = currentUser?.tags || [];
    var sorted = [...NEARBY_USERS].sort((a, b) => b.tags.filter(t => userTags.includes(t)).length - a.tags.filter(t => userTags.includes(t)).length);
    var picked = sorted[Math.floor(Math.random() * Math.min(2, sorted.length))];
    var tx = CX + picked.r * Math.cos((picked.angle * Math.PI) / 180), ty = CY + picked.r * Math.sin((picked.angle * Math.PI) / 180);
    setNearbyUser(picked);
    runCoalesceAnim(tx, ty, setNearbyUserProgress, setNearbyUserCoalesce, setShowPersonCard, nearbyPersonRaf, nearbyPersonStart);
  }

  function simulateCirclePulse() {
    if (nearbyUser || nearbyCircle) return;
    setBumpActive(false); setInterestMatchCircle(null);
    var existingIds = new Set(allChats.map(c => c.id));
    var userTags = currentUser?.tags || [];
    var available = [...PULSE_CIRCLES].filter(c => !existingIds.has(c.id)).sort((a, b) => b.tags.filter(t => userTags.includes(t)).length - a.tags.filter(t => userTags.includes(t)).length);
    if (!available.length) return;
    var picked = available[0];
    var nc = makeCircle({ id: picked.id, ownerId: "user_unknown", name: picked.name, type: "hidden", pulseable: true, passphrase: picked.passphrase || "", dist: parseFloat(((picked.r / MAX_R) * 2).toFixed(1)), members: picked.members, angle: picked.angle, r: picked.r, tags: picked.tags, governance: picked.governance, isOwn: false, discovered: true });
    setAllChats(prev => [...prev, nc]);
    setRevealedIds(prev => new Set([...prev, picked.id]));
    setRevealProgress(prev => ({ ...prev, [picked.id]: 0 }));
    var tx = CX + picked.r * Math.cos((picked.angle * Math.PI) / 180), ty = CY + picked.r * Math.sin((picked.angle * Math.PI) / 180);
    setNearbyCircle(nc);
    runCoalesceAnim(tx, ty, setNearbyCircleProgress, setNearbyCircleCoalesce, setShowCircleCard, nearbyCircleRaf, nearbyCircleStart, (p) => setRevealProgress(prev => ({ ...prev, [picked.id]: p })));
  }

  // ── Nearby person/circle dismiss & open ───────────────────────────────────
  function dismissPerson() { setShowPersonCard(false); setNearbyUser(null); setNearbyUserProgress(0); setNearbyUserCoalesce(null); setMapDimProgress(0); cancelAnimationFrame(nearbyPersonRaf.current); }
  function dismissCircle() { setShowCircleCard(false); setNearbyCircle(null); setNearbyCircleProgress(0); setNearbyCircleCoalesce(null); setMapDimProgress(0); cancelAnimationFrame(nearbyCircleRaf.current); }
  function openPulseChat(user) { setShowPersonCard(false); setPulseChatUser(user); }
  function closePulseChat() { setPulseChatUser(null); setNearbyUser(null); }
  function handleConnect() { setPulseChatUser(null); setNearbyUser(null); }
  function openSpontaneousSheet(user, sharedTags) {
    if (document.activeElement) document.activeElement.blur();
    setTimeout(() => { setPulseChatUser(null); setSpontaneousTarget({ user, sharedTags }); }, 500);
  }
  function handleSpontaneousCreate(data) {
    var nc = makeCircle({ ownerId: currentUser?.id || "user_local", name: data.name, type: "closed", pulseable: false, passphrase: "", dist: 0.1, members: 2, angle: -20, r: 90, tags: data.tags, governance: { mode: "admin", admins: [] }, isOwn: true });
    setAllChats(p => [...p, nc]); setJoinedIds(p => new Set([...p, nc.id]));
    setSpontaneousTarget(null); setSelectedChat(nc);
  }
  function openCircleJoin(circle) { setShowCircleCard(false); setJoinTarget(circle); }
  function goToInterestMatch(circle) { setInterestMatchCircle(null); setHighlightedCircleId(circle.id); setTab("map"); setTimeout(() => setHighlightedCircleId(null), 4000); }

  // ── Pulse button ──────────────────────────────────────────────────────────
  function revealHiddenNote(id, note) {
    setRevealedNoteIds(prev => {
      if (prev.has(id)) return prev;
      if (note) {
        clearTimeout(hiddenNoteNotifTimer.current);
        setHiddenNoteNotif(note);
        hiddenNoteNotifTimer.current = setTimeout(() => setHiddenNoteNotif(null), 4000);
      }
      return new Set([...prev, id]);
    });
  }

  const firePulse = useCallback(() => {
    cancelAnimationFrame(pulseHoldRaf.current);
    setPulseParticles(genPulseParticles(90)); setOutwardParticles(genOutwardParticles(69));
    setHoldProgress(1); setPulseState("fired"); setReturnProgress(0); setPulseFired(true); setBumpActive(false);
    setAllChats(chats => { chats.forEach(c => { if (c.type === "hidden" && c.pulseable !== false) revealHiddenCircle(c.id); }); return chats; });
    setNotes(ns => { ns.forEach(n => { if (n.placed && n.visibility === "hidden") revealHiddenNote(n.id, n); }); return ns; });
    var outDur = 2200, retDur = 1100, silMs = 300, outStart = performance.now();
    function outTick() {
      var p = Math.min(1, (performance.now() - outStart) / outDur);
      setRippleProgress(p);
      if (p < 1) { rippleRaf.current = requestAnimationFrame(outTick); } else {
        setPulseFired(false); setInwardParticles(genInwardParticles(56));
        var retStart = performance.now() + silMs;
        function retTick() {
          var now = performance.now();
          if (now < retStart) { rippleRaf.current = requestAnimationFrame(retTick); return; }
          var rp = Math.min(1, (now - retStart) / retDur);
          setReturnProgress(rp);
          if (rp < 1) { rippleRaf.current = requestAnimationFrame(retTick); } else {
            setRippleProgress(0); setReturnProgress(0); setHoldProgress(0);
            setPulseState("cooling"); coolingTimer.current = setTimeout(() => setPulseState("idle"), 2500);
          }
        }
        rippleRaf.current = requestAnimationFrame(retTick);
      }
    }
    rippleRaf.current = requestAnimationFrame(outTick);
  }, []);

  const startPulseHold = useCallback((e) => {
    if (pulseState !== "idle") return;
    var el = e.currentTarget.getBoundingClientRect();
    var cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY;
    setTouchPt({ x: ((cx - el.left) / el.width) * 128, y: ((cy - el.top) / el.width) * 128 });
    pulseHoldStart.current = performance.now(); setPulseState("charging");
    function tick() { var p = Math.min(1, (performance.now() - pulseHoldStart.current) / HOLD_MS); setHoldProgress(p); if (p < 1) pulseHoldRaf.current = requestAnimationFrame(tick); }
    pulseHoldRaf.current = requestAnimationFrame(tick);
  }, [pulseState]);

  const cancelPulseHold = useCallback(() => {
    if (pulseState !== "charging") return;
    cancelAnimationFrame(pulseHoldRaf.current);
    var p = Math.min(1, (performance.now() - pulseHoldStart.current) / HOLD_MS);
    if (p >= 0.8) { firePulse(); } else { setPulseState("idle"); setHoldProgress(0); }
  }, [pulseState, firePulse]);

  // ── SVG coordinate helper ─────────────────────────────────────────────────
  function toSVG(clientX, clientY) {
    if (!svgRef.current) return { x: 0, y: 0 };
    var rect = svgRectCache.current || svgRef.current.getBoundingClientRect();
    var scaleX = rect.width / 350, scaleY = rect.height / 420, scale = Math.min(scaleX, scaleY);
    var offX = (rect.width - 350 * scale) / 2, offY = (rect.height - 420 * scale) / 2;
    return { x: (clientX - rect.left - offX) / scale, y: (clientY - rect.top - offY) / scale };
  }

  // ── Draw gesture ──────────────────────────────────────────────────────────
  const onDrawStart = useCallback((e) => {
    e.preventDefault();
    if (svgRef.current) svgRectCache.current = svgRef.current.getBoundingClientRect();
    setDrawPhaseSync("drawing"); setDrawPath([]);
  }, []);

  const onDrawMove = useCallback((e) => {
    e.preventDefault();
    var c = e.touches ? e.touches[0] : e;
    var pos = toSVG(c.clientX, c.clientY);
    setDrawPath(p => [...p, pos]);
  }, []);

  const onDrawEnd = useCallback(() => {
    setDrawPhaseSync("done");
    setDrawPath(path => {
      if (path.length > 0) {
        var avg = path.reduce((sum, p) => sum + Math.sqrt((p.x - CX) ** 2 + (p.y - CY) ** 2), 0) / path.length;
        var fitted = Math.max(MIN_R, Math.min(MAX_R, avg));
        setRadius(fitted); setCircleScale(0);
        requestAnimationFrame(() => {
          var start = performance.now(), dur = 400;
          function tick() { var t = Math.min(1, (performance.now() - start) / dur); setCircleScale(1 - Math.pow(1 - t, 3)); if (t < 1) requestAnimationFrame(tick); }
          requestAnimationFrame(tick);
        });
      }
      return path;
    });
  }, []);

  // ── Plant hold ────────────────────────────────────────────────────────────
  const startPlantHold = useCallback((pos) => {
    setPlantParticles(genPlantParticles(85));
    plantHoldActive.current = true; plantHoldStart.current = performance.now();
    plantPosRef.current = pos; setPlantPos(pos); setPlantHold(0); setPlantStamp(0);
    plantHoldProgressRef.current = 0; plantStampProgressRef.current = 0;
    function tick() {
      if (!plantHoldActive.current) return;
      var p = Math.min(1, (performance.now() - plantHoldStart.current) / PLANT_MS);
      plantHoldProgressRef.current = p; setPlantHold(p);
      if (p < 1) { plantRaf.current = requestAnimationFrame(tick); } else {
        plantHoldActive.current = false;
        var ss = performance.now();
        function stampTick() {
          var sp = Math.min(1, (performance.now() - ss) / 400);
          plantStampProgressRef.current = sp; setPlantStamp(sp);
          if (sp < 1) { stampRaf.current = requestAnimationFrame(stampTick); } else {
            var fp = plantPosRef.current;
            setPendingPos(fp); setCreating(true); setPlantHold(0); setPlantPos(null); setPlantStamp(0);
            plantHoldProgressRef.current = 0; plantStampProgressRef.current = 0;
          }
        }
        stampRaf.current = requestAnimationFrame(stampTick);
      }
    }
    plantRaf.current = requestAnimationFrame(tick);
  }, []);

  const cancelPlantHold = useCallback(() => {
    plantHoldActive.current = false; cancelAnimationFrame(plantRaf.current);
    if (plantStampProgressRef.current === 0) { setPlantHold(0); setPlantPos(null); plantHoldProgressRef.current = 0; }
  }, []);

  // ── Map pointer handlers ──────────────────────────────────────────────────
  const onMapDown = useCallback((e) => {
    if (placingNoteRef.current) {
      var c0 = e.touches ? e.touches[0] : e;
      if (svgRef.current) svgRectCache.current = svgRef.current.getBoundingClientRect();
      placeNoteRef.current(toSVG(c0.clientX, c0.clientY));
      return;
    }
    if (drawPhaseRef.current === "idle") { onDrawStart(e); return; }
    if (drawPhaseRef.current === "drawing") return;
    if (drawPhaseRef.current === "done") {
      var c = e.touches ? e.touches[0] : e;
      if (svgRef.current) svgRectCache.current = svgRef.current.getBoundingClientRect();
      var pos = toSVG(c.clientX, c.clientY);
      panMoveTotal.current = 0; isPanning.current = false;
      var rectW = svgRectCache.current ? svgRectCache.current.width : 350;
      panOrigin.current = { clientX: c.clientX, clientY: c.clientY, px: panX, py: panY, scale: 350 / rectW };
      startPlantHold({ x: pos.x - panX, y: pos.y - panY });
    }
  }, [onDrawStart, startPlantHold, panX, panY]);

  const onMapMove = useCallback((e) => {
    if (drawPhaseRef.current === "drawing") { onDrawMove(e); return; }
    var c = e.touches ? e.touches[0] : e;
    if (dragging.current && svgRef.current) {
      e.preventDefault();
      var rect = svgRectCache.current || svgRef.current.getBoundingClientRect();
      var scale2 = Math.min(rect.width / 350, rect.height / 420);
      var offX2 = (rect.width - 350 * scale2) / 2, offY2 = (rect.height - 420 * scale2) / 2;
      var dx = (c.clientX - rect.left - offX2) / scale2 - CX, dy = (c.clientY - rect.top - offY2) / scale2 - CY;
      setRadius(Math.max(MIN_R, Math.min(MAX_R, Math.sqrt(dx * dx + dy * dy)))); return;
    }
    if (drawPhaseRef.current === "done" && panOrigin.current) {
      var dx2 = c.clientX - panOrigin.current.clientX, dy2 = c.clientY - panOrigin.current.clientY;
      var moved = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      panMoveTotal.current = moved;
      if (!isPanning.current && moved > 6) { isPanning.current = true; cancelPlantHold(); }
      if (isPanning.current) {
        e.preventDefault();
        setPanX(panOrigin.current.px + dx2 * (panOrigin.current.scale || 1));
        setPanY(panOrigin.current.py + dy2 * (panOrigin.current.scale || 1));
      }
    }
  }, [onDrawMove, cancelPlantHold]);

  const onMapUp = useCallback(() => {
    svgRectCache.current = null;
    if (drawPhaseRef.current === "drawing") { onDrawEnd(); return; }
    dragging.current = false;
    if (isPanning.current) { isPanning.current = false; panOrigin.current = null; return; }
    panOrigin.current = null; cancelPlantHold();
  }, [onDrawEnd, cancelPlantHold]);

  useEffect(() => {
    window.addEventListener("mousemove", onMapMove);
    window.addEventListener("mouseup", onMapUp);
    window.addEventListener("touchmove", onMapMove, { passive: false });
    window.addEventListener("touchend", onMapUp);
    return () => {
      window.removeEventListener("mousemove", onMapMove);
      window.removeEventListener("mouseup", onMapUp);
      window.removeEventListener("touchmove", onMapMove);
      window.removeEventListener("touchend", onMapUp);
    };
  }, [onMapMove, onMapUp]);

  function resetRadius() { setDrawPhaseSync("idle"); setRadius(null); setDrawPath([]); setCircleScale(1); setPanX(0); setPanY(0); }

  // ── Notes handlers ────────────────────────────────────────────────────────
  function finishNote(data) {
    var note = makeNote({ text: data.text, tags: data.tags, visibility: data.visibility, ownerId: currentUser?.id || "user_local" });
    setNotes(prev => [...prev, note]);
    setNotesView("list");
  }

  function startPlacingNote(note) { setNotesPanelOpen(false); setPlacingNoteSync(note); }

  function placeNote(svgPos) {
    var pn = placingNoteRef.current; if (!pn) return;
    var placed = { ...pn, placed: true, placedPos: { x: svgPos.x - panX, y: svgPos.y - panY } };
    setNotes(prev => prev.map(n => n.id === pn.id ? placed : n));
    setPlacingNoteSync(null);
    setStampingNoteId(pn.id); setTimeout(() => setStampingNoteId(null), 600);
  }
  placeNoteRef.current = placeNote;

  function handleNoteClick(note) {
    if (note.visibility === "hidden" && !smoothedNoteIds.has(note.id)) { setCrumpledNote(note); return; }
    setUnfoldingNote(note); setTimeout(() => { setUnfoldingNote(null); setReadingNote(note); }, 350);
  }

  function handleNoteSmoothed(note) {
    setSmoothedNoteIds(prev => new Set([...prev, note.id]));
    setCrumpledNote(null); setTimeout(() => setReadingNote(note), 200);
  }

  // Proximity reveal: hidden notes whose tags match user interests
  var hasProximityRun = useRef(false);
  useEffect(() => {
    if (!currentUser || !hasProximityRun.current) { hasProximityRun.current = true; return; }
    var userTags = currentUser.tags || [];
    notes.forEach(n => {
      if (n.placed && n.visibility === "hidden" && !revealedNoteIds.has(n.id)) {
        if (n.tags.filter(t => userTags.includes(t)).length > 0) revealHiddenNote(n.id, n);
      }
    });
  }, [notes]);

  // ── Circle handlers ───────────────────────────────────────────────────────
  function handleChatClick(chat) {
    if (chat.type === "hidden" && !joinedIds.has(chat.id)) { setJoinTarget(chat); return; }
    if (chat.type === "closed" && !joinedIds.has(chat.id) && !chat.isOwn) { setJoinTarget(chat); return; }
    setSelectedChat(chat);
  }

  function handleJoined(chat) { setJoinedIds(prev => new Set([...prev, chat.id])); setJoinTarget(null); if (chat.msgs !== undefined) setSelectedChat(chat); }
  function handleRequestSent(chatId, req) { setAllChats(prev => prev.map(c => c.id === chatId ? { ...c, pendingRequests: [...(c.pendingRequests || []), req] } : c)); }

  const handleCreateComplete = useCallback((data) => {
    var pos = pendingPos;
    var nc = makeCircle({ ownerId: currentUser?.id || "user_local", name: data.name, type: data.type, pulseable: data.type === "hidden" ? data.pulseable : true, passphrase: data.passphrase || "", dist: 0, members: 1, angle: Math.atan2(pos ? pos.y - CY : -1, pos ? pos.x - CX : 0) * 180 / Math.PI, r: pos ? Math.sqrt((pos.x - CX) ** 2 + (pos.y - CY) ** 2) : 80, tags: data.tags, governance: data.governance, isOwn: true, color: data.color || null });
    setAllChats(p => [...p, nc]); if (data.type !== "hidden") setJoinedIds(p => new Set([...p, nc.id]));
    setCreating(false); setPendingPos(null); setTab("map");
  }, [pendingPos, currentUser]);

  function handleCircleSave(updated, nameChanged, tagsChanged) {
    setAllChats(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selectedChat?.id === updated.id) setSelectedChat(updated);
    if (nameChanged || tagsChanged) {
      var msg = nameChanged && tagsChanged ? "Circle name and tags updated." : nameChanged ? `Circle name updated to "${updated.name}".` : "Circle tags updated.";
      setAllChats(prev => prev.map(c => c.id === updated.id ? { ...c, msgs: [...c.msgs, { id: Date.now(), text: msg, senderHandle: "system", senderId: "system", ts: Date.now() }] } : c));
    }
  }

  function sendMsg() {
    if (!msgInput.trim() || !selectedChat || !currentUser) return;
    var id = selectedChat.id, nm = makeMessage(msgInput.trim(), currentUser.id, currentUser.handle);
    setAllChats(prev => prev.map(c => c.id === id ? { ...c, msgs: [...c.msgs, nm] } : c));
    setMsgInput("");
  }

  function updateUser(patch) { setCurrentUser(u => ({ ...u, ...patch })); }
  function updateStatus(s) { setCurrentUser(u => ({ ...u, status: s })); }
  function updatePresets(p) { setCurrentUser(u => ({ ...u, statusPresets: p })); }

  // ── Derived values ────────────────────────────────────────────────────────
  var hasRadius = drawPhase === "done" && radius !== null;
  var isDrawing = drawPhase === "drawing";
  var isCharging = pulseState === "charging";
  var isFired = pulseState === "fired";
  var showReturn = returnProgress > 0;
  var pulseLabel = isCharging ? "charging..." : (isFired && !showReturn) ? "pulsing..." : showReturn ? "incoming..." : pulseState === "cooling" ? "sent" : "hold to pulse";
  var visibleChats = radius ? allChats.filter(c => {
    if (c.type === "hidden") return false;
    var x = CX + c.r * Math.cos((c.angle * Math.PI) / 180) + panX;
    var y = CY + c.r * Math.sin((c.angle * Math.PI) / 180) + panY;
    return Math.sqrt((x - CX) ** 2 + (y - CY) ** 2) <= radius;
  }) : [];
  var radiusMiles = radius ? ((radius / MAX_R) * 2).toFixed(1) : "—";
  var liveChat = selectedChat ? (allChats.find(c => c.id === selectedChat.id) || selectedChat) : null;
  var msgs = liveChat ? liveChat.msgs || [] : [];

  // ── Render ────────────────────────────────────────────────────────────────
  var outerShell = { background: BG_OUTER, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", fontFamily: font, userSelect: "none", WebkitUserSelect: "none", WebkitTapHighlightColor: "transparent", overflowX: "hidden", width: "100%", flex: 1 };
  var phoneCard = { background: BG, width: "100%", flex: 1, display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box" };

  if (!currentUser) return (
    <div style={outerShell}><div style={phoneCard}>
      <OnboardingFlow onComplete={u => setCurrentUser(u)} />
    </div></div>
  );

  var showOverlayScreen = pulseChatUser || spontaneousTarget || creating || selectedChat;

  return (
    <>
      <div style={outerShell}><div style={phoneCard}>

        {/* ── Portal overlays ── */}
        {joinTarget && <JoinModal chat={joinTarget} onClose={() => setJoinTarget(null)} onJoined={handleJoined} onRequestSent={handleRequestSent} />}
        {showPersonCard && nearbyUser && <PulseCheckCard user={nearbyUser} currentUser={currentUser} onStartPulseChat={openPulseChat} onDismiss={dismissPerson} />}
        {showCircleCard && nearbyCircle && <CirclePulseCard circle={nearbyCircle} currentUser={currentUser} onJoin={openCircleJoin} onDismiss={dismissCircle} />}
        {interestMatchCircle && <InterestMatchNotif circle={interestMatchCircle} sharedTags={interestMatchTags} onGo={() => goToInterestMatch(interestMatchCircle)} onDismiss={() => setInterestMatchCircle(null)} />}
        {readingNote && <ReadNoteModal note={readingNote} onClose={() => setReadingNote(null)} smoothed={smoothedNoteIds.has(readingNote.id)} />}
        {crumpledNote && <CrumpledNoteReveal note={crumpledNote} onSmoothed={handleNoteSmoothed} onCancel={() => setCrumpledNote(null)} />}
        {unfoldingNote && <UnfoldModal note={unfoldingNote} />}

        {/* Hidden note discovery notification */}
        {hiddenNoteNotif && (
          <div onClick={() => { setHiddenNoteNotif(null); setCrumpledNote(hiddenNoteNotif); }} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: INK, color: NOTE_BG, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: font, animation: "noteUnfold 0.3s ease" }}>
            <svg width={16} height={12} viewBox="0 0 16 12">
              <rect x={0} y={0} width={16} height={12} fill="none" stroke={NOTE_BG} strokeWidth="1" rx="0.5" />
              <polyline points="0,0 8,6.5 16,0" fill="none" stroke={NOTE_BG} strokeWidth="0.9" />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Hidden note found nearby</div>
              <div style={{ fontSize: 8, opacity: 0.6, marginTop: 1 }}>tap to reveal</div>
            </div>
            <button onClick={e => { e.stopPropagation(); setHiddenNoteNotif(null); }} style={{ background: "none", border: "none", color: NOTE_BG, fontSize: 16, cursor: "pointer", opacity: 0.5, padding: 0 }}>×</button>
          </div>
        )}

        {/* ── Pulse chat + spontaneous circle ── */}
        {pulseChatUser && <>
          {spontaneousTarget && <SpontaneousCircleSheet currentUser={currentUser} otherUser={spontaneousTarget.user} sharedTags={spontaneousTarget.sharedTags} onCreate={handleSpontaneousCreate} onDismiss={() => setSpontaneousTarget(null)} />}
          <PulseChat currentUser={currentUser} otherUser={pulseChatUser} onStartCircle={openSpontaneousSheet} onConnect={handleConnect} onDismiss={closePulseChat} />
        </>}
        {spontaneousTarget && !pulseChatUser && <SpontaneousCircleSheet currentUser={currentUser} otherUser={spontaneousTarget.user} sharedTags={spontaneousTarget.sharedTags} onCreate={handleSpontaneousCreate} onDismiss={() => setSpontaneousTarget(null)} />}

        {/* ── Create flow ── */}
        {creating && <CreateFlow onComplete={handleCreateComplete} onCancel={() => { setCreating(false); setPendingPos(null); }} />}

        {/* ── Chat view ── */}
        {selectedChat && !pulseChatUser && !creating && (
          <ChatView
            selectedChat={selectedChat}
            currentUser={currentUser}
            msgs={msgs}
            msgInput={msgInput}
            setMsgInput={setMsgInput}
            onBack={() => setSelectedChat(null)}
            onSendMsg={sendMsg}
            onEditCircle={() => setEditingCircle(liveChat)}
          />
        )}

        {/* ── Main app shell ── */}
        {!showOverlayScreen && <>
          <div style={{ padding: "14px 18px 11px", borderBottom: "2px solid " + INK, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 52 }}>
            <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: INK }}>Circle</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {bumpActive && (
                <div onClick={() => { setTab("pulse"); setBumpActive(false); }} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: "3px 8px", border: "1px solid " + INK }}>
                  <span style={{ fontSize: 10, transform: `scale(${bumpPulse})`, display: "inline-block", transition: "transform 0.05s", color: INK }}>◉</span>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: INK_MID, textTransform: "uppercase" }}>something nearby</span>
                </div>
              )}
              {currentUser.pulseCheck && !bumpActive && <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.5, color: INK_MID, border: "1px solid " + INK_LIGHT, padding: "2px 7px", textTransform: "uppercase" }}>Pulse Check ◉</span>}
              <span style={{ fontSize: 10, color: INK_MID, letterSpacing: 1.5, fontWeight: 600 }}>HICKORY HILLS</span>
            </div>
          </div>

          {tab === "map" && (
            <MapView
              currentUser={currentUser}
              onUpdateStatus={updateStatus}
              onUpdatePresets={updatePresets}
              svgRef={svgRef}
              panX={panX} panY={panY}
              drawPhase={drawPhase} drawPath={drawPath}
              radius={radius} circleScale={circleScale}
              breathe={breathe}
              hasRadius={hasRadius} isDrawing={isDrawing}
              radiusMiles={radiusMiles} visibleChats={visibleChats}
              isFired={isFired} pulseFired={pulseFired}
              rippleProgress={rippleProgress} returnProgress={returnProgress}
              showReturn={showReturn}
              outwardParticles={outwardParticles} inwardParticles={inwardParticles}
              nearbyUser={nearbyUser} nearbyUserProgress={nearbyUserProgress} nearbyUserCoalesce={nearbyUserCoalesce}
              nearbyCircle={nearbyCircle} nearbyCircleProgress={nearbyCircleProgress} nearbyCircleCoalesce={nearbyCircleCoalesce}
              mapDimProgress={mapDimProgress}
              allChats={allChats} revealProgress={revealProgress}
              highlightedCircleId={highlightedCircleId} joinedIds={joinedIds}
              plantPos={plantPos} plantHold={plantHold} plantStamp={plantStamp} plantParticles={plantParticles}
              notes={notes} notesPanelOpen={notesPanelOpen} notesView={notesView}
              placingNote={placingNote} stampingNoteId={stampingNoteId} revealedNoteIds={revealedNoteIds}
              onMapDown={onMapDown} onMapMove={onMapMove} onMapUp={onMapUp}
              onChatClick={handleChatClick} onNoteClick={handleNoteClick}
              onNearbyUserClick={() => setShowPersonCard(true)}
              onNearbyCircleClick={() => setShowCircleCard(true)}
              onResetRadius={resetRadius} onResetPan={() => { setPanX(0); setPanY(0); }}
              onOpenNotesPanel={() => setNotesPanelOpen(true)}
              onCloseNotesPanel={() => setNotesPanelOpen(false)}
              onSetNotesView={setNotesView}
              onStartPlacingNote={startPlacingNote}
              onCancelPlacingNote={() => setPlacingNoteSync(null)}
              onFinishNote={finishNote}
              onUpdateUser={updateUser}
            />
          )}

          {tab === "circles" && (
            <CirclesView
              hasRadius={hasRadius}
              allChats={allChats}
              currentUser={currentUser}
              joinedIds={joinedIds}
              revealedIds={revealedIds}
              radius={radius}
              onChatClick={handleChatClick}
            />
          )}

          {tab === "pulse" && (
            <PulseView
              currentUser={currentUser}
              pulseLabel={pulseLabel}
              bumpActive={bumpActive} bumpPulse={bumpPulse}
              pulseState={pulseState}
              holdProgress={holdProgress} rippleProgress={rippleProgress}
              returnProgress={returnProgress} pulseFired={pulseFired}
              touchPt={touchPt} pulseParticles={pulseParticles}
              nearbyUser={nearbyUser} nearbyCircle={nearbyCircle}
              allChats={allChats}
              onPulseDown={startPulseHold} onPulseUp={cancelPulseHold} onPulseLeave={cancelPulseHold}
              onTogglePulseCheck={() => setCurrentUser(u => ({ ...u, pulseCheck: !u.pulseCheck }))}
              onSimulatePersonPulse={simulatePersonPulse}
              onSimulateCirclePulse={simulateCirclePulse}
              onGoToMap={() => setTab("map")}
            />
          )}

          {tab === "profile" && (
            <ProfileView
              currentUser={currentUser}
              allChats={allChats}
              onUpdateUser={updateUser}
              onSelectChat={setSelectedChat}
              onEditCircle={setEditingCircle}
            />
          )}

          <BottomNav tab={tab} setTab={setTab} currentUser={currentUser} />
        </>}

      </div></div>

      {/* EditCircleModal renders outside the card so it can overlay everything */}
      {editingCircle && <EditCircleModal circle={editingCircle} onSave={handleCircleSave} onClose={() => setEditingCircle(null)} />}
    </>
  );
}
