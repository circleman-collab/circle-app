// Animated avatar — breathes continuously and plays burst effects when tags change.
// animStyle controls the burst type: 0=pop, 1=spin, 2=scatter, 3=ripple

import { useState, useRef, useEffect, useMemo } from "react";
import { INK, BG } from "../../constants/theme.js";
import { genAvatarPath, genAvatarParticles } from "../../utils/avatar.js";

export function UserAvatar({ tags, size = 40, color = INK, bg = BG, burst = false, grand = false, animStyle = 0, onBurstEnd }) {
  var path = useMemo(() => genAvatarPath(tags, size), [tags.join(","), size]);
  var cx = size / 2, cy = size / 2, n = tags.length;
  var breatheAmp = 0.018 + (n / 9) * 0.055;
  var breatheSpeed = 0.018 + (n / 9) * 0.014;

  var [breathe, setBreathe] = useState(1);
  var breatheRaf = useRef(null);
  var breatheT = useRef(Math.random() * Math.PI * 2);
  useEffect(() => {
    function loop() {
      breatheT.current += breatheSpeed;
      setBreathe(1 + breatheAmp * Math.sin(breatheT.current));
      breatheRaf.current = requestAnimationFrame(loop);
    }
    breatheRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(breatheRaf.current);
  }, [breatheAmp, breatheSpeed]);

  var [particles, setParticles] = useState(null);
  var [burstProg, setBurstProg] = useState(0);
  var [expand, setExpand] = useState(1);
  var [rotate, setRotate] = useState(0);
  var burstRaf = useRef(null);
  var burstStart = useRef(null);
  var BURST_DUR = grand ? 1100 : animStyle === 3 ? 900 : animStyle === 2 ? 750 : 620;

  useEffect(() => {
    if (!burst) return;
    var pCount = animStyle === 2 ? 28 : 18;
    setParticles(genAvatarParticles(pCount, size, grand));
    setBurstProg(0); setExpand(1); setRotate(0);
    burstStart.current = performance.now();
    function tick() {
      var p = Math.min(1, (performance.now() - burstStart.current) / BURST_DUR);
      setBurstProg(p);
      if (animStyle === 0 || grand) {
        var ep = p < 0.18 ? p / 0.18 : 1 - ((p - 0.18) / 0.82);
        setExpand(1 + ep * (grand ? 0.13 : 0.08));
      } else if (animStyle === 1) {
        setRotate(p * p * 22);
        setExpand(1 + Math.sin(p * Math.PI) * 0.1);
      } else if (animStyle === 2) {
        setExpand(1 + Math.sin(p * Math.PI) * 0.05);
      } else if (animStyle === 3) {
        setExpand(1 + Math.sin(Math.min(p, 0.5) * Math.PI) * 0.15);
      }
      if (p < 1) {
        burstRaf.current = requestAnimationFrame(tick);
      } else {
        setParticles(null); setBurstProg(0); setExpand(1); setRotate(0);
        onBurstEnd && onBurstEnd();
      }
    }
    burstRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(burstRaf.current);
  }, [burst]);

  var strokeW = size * 0.032 * (0.6 + (n / 9) * 0.5);
  var particleDistMult = animStyle === 2 ? 1.6 : 1;

  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ overflow: "visible", flexShrink: 0 }}>
      {grand && burst && burstProg > 0 && [0, 0.15, 0.3].map((off, i) => {
        var rp = Math.max(0, Math.min(1, (burstProg - off) / 0.7));
        if (rp <= 0) return null;
        return <circle key={i} cx={cx} cy={cy} r={size * (0.36 + rp * 0.55)} fill="none" stroke={color} strokeWidth={(1 - rp) * size * 0.022} opacity={(1 - rp) * 0.5} style={{ pointerEvents: "none" }} />;
      })}
      {animStyle === 3 && burst && burstProg > 0 && [0, 0.2].map((off, i) => {
        var rp = Math.max(0, Math.min(1, (burstProg - off) / 0.8));
        if (rp <= 0) return null;
        return <circle key={i} cx={cx} cy={cy} r={size * (0.3 + rp * 0.6)} fill="none" stroke={color} strokeWidth={(1 - rp) * size * 0.018} opacity={(1 - rp) * 0.4} style={{ pointerEvents: "none" }} />;
      })}
      {particles && particles.map((p, i) => {
        var lp = Math.max(0, Math.min(1, (burstProg - p.delay) / (1 - p.delay)));
        if (lp <= 0) return null;
        var e = Math.pow(lp, animStyle === 2 ? 0.4 : 0.5);
        var dist = p.dist * particleDistMult;
        var lat = p.drift * Math.sin(e * Math.PI * p.driftFreq);
        var pa = p.angle + Math.PI / 2;
        var px = cx + Math.cos(p.angle) * dist * e + Math.cos(pa) * lat;
        var py = cy + Math.sin(p.angle) * dist * e + Math.sin(pa) * lat;
        var fadeExp = animStyle === 2 ? 0.55 : grand ? 0.7 : 0.9;
        return <circle key={i} cx={px} cy={py} r={Math.max(0.1, p.size * (1 - e * 0.5))} fill={color} opacity={Math.pow(1 - e, fadeExp) * (grand ? 0.95 : 0.85)} style={{ pointerEvents: "none" }} />;
      })}
      <g transform={`translate(${cx},${cy}) scale(${breathe * expand}) rotate(${rotate}) translate(${-cx},${-cy})`}>
        <path d={path} fill="none" stroke={color} strokeWidth={strokeW} />
        <circle cx={cx} cy={cy} r={size * 0.085} fill={color} />
        <circle cx={cx} cy={cy} r={size * 0.038} fill={bg} />
      </g>
    </svg>
  );
}
