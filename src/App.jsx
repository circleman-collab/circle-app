import { useState, useRef, useEffect, useCallback } from "react";

const BG="#f0ece3", BG_OUTER="#e8e5de", INK="#0a0a0a", INK_LIGHT="#bfb9ae", INK_MID="#6b6860";
const font="'Helvetica Neue', Arial, sans-serif";
const DRAFT_COLORS={1:"#7a6a3a",2:"#3a5a4a",3:"#4a3a6a",4:"#7a3a3a",5:"#3a5a6a",6:"#6a4a3a"};
const HOLD_MS=1500, PLANT_MS=1200;

// ── Semantic Avatar Axes ──────────────────────────────────────────────────────
const TAG_AXES = {
  "coffee":        [0.1, 0.1, 0.9, 0.5],
  "food":          [0.1, 0.1, 0.9, 0.2],
  "gaming":        [0.5, 0.1, 0.2, 0.9],
  "tech":          [0.5, 0.1, 0.1, 0.9],
  "art":           [0.1, 0.1, 0.2, 0.9],
  "design":        [0.1, 0.1, 0.2, 0.9],
  "film":          [0.1, 0.1, 0.8, 0.5],
  "books":         [0.1, 0.1, 0.8, 0.6],
  "jazz":          [0.1, 0.5, 0.5, 0.2],
  "vinyl":         [0.1, 0.4, 0.5, 0.3],
  "hiking":        [0.5, 0.5, 0.8, 0.1],
  "outdoors":      [0.5, 0.6, 0.8, 0.1],
  "fitness":       [0.9, 0.1, 0.2, 0.5],
  "cycling":       [0.8, 0.1, 0.2, 0.6],
  "rock":          [0.9, 0.9, 0.2, 0.1],
  "metal":         [0.9, 0.9, 0.1, 0.1],
  "climbing":      [0.9, 0.9, 0.5, 0.1],
  "skateboarding": [0.9, 0.5, 0.2, 0.1],
  "photography":   [0.1, 0.1, 0.5, 0.9],
  "cooking":       [0.1, 0.1, 0.9, 0.5],
  "theatre":       [0.5, 0.1, 0.9, 0.5],
  "poetry":        [0.1, 0.5, 0.2, 0.1],
  "travel":        [0.5, 0.5, 0.5, 0.1],
  "dancing":       [0.9, 0.1, 0.5, 0.1],
  "ceramics":      [0.1, 0.5, 0.9, 0.1],
  "astrology":     [0.1, 0.1, 0.5, 0.9],
  "tattoos":       [0.9, 0.9, 0.2, 0.1],
  "dogs":          [0.1, 0.1, 0.9, 0.1],
  "night owl":     [0.1, 0.5, 0.2, 0.1],
  "introvert":     [0.1, 0.1, 0.5, 0.9],
  "slow mornings": [0.1, 0.1, 0.9, 0.5],
  "overthinker":   [0.5, 0.5, 0.2, 0.9],
  "homebody":      [0.1, 0.1, 0.9, 0.9],
  "chaotic good":  [0.9, 0.9, 0.2, 0.1],
  "early bird":    [0.1, 0.1, 0.5, 0.9],
  "empath":        [0.1, 0.1, 0.9, 0.1],
  "restless":      [0.9, 0.5, 0.2, 0.1],
  "daydreamer":    [0.1, 0.5, 0.5, 0.1],
  "punk":          [0.9, 0.9, 0.2, 0.1],
  "indie":         [0.1, 0.5, 0.2, 0.1],
  "hip-hop":       [0.7, 0.4, 0.5, 0.3],
  "r&b":           [0.2, 0.3, 0.7, 0.3],
  "country":       [0.3, 0.6, 0.7, 0.2],
  "religious":     [0.1, 0.1, 0.9, 0.8],
  "activist":      [0.8, 0.7, 0.4, 0.2],
  "academic":      [0.1, 0.1, 0.7, 0.9],
  "nightlife":     [0.7, 0.3, 0.4, 0.2],
  "sports":        [0.8, 0.2, 0.5, 0.5],
  "foodie":        [0.1, 0.2, 0.9, 0.3],
  "maker":         [0.6, 0.8, 0.5, 0.2],
  "spiritual":     [0.1, 0.2, 0.7, 0.6],
  "theater kid":   [0.6, 0.2, 0.8, 0.4],
  "military":      [0.4, 0.2, 0.6, 0.9],
  "immigrant":     [0.3, 0.5, 0.8, 0.3],
  "parent":        [0.1, 0.1, 0.9, 0.7],
  "creative":      [0.4, 0.3, 0.4, 0.5],
  "hustler":       [0.8, 0.6, 0.3, 0.3],
  "performer":     [0.8, 0.3, 0.6, 0.2],
};

const NEUTRAL_AXES = [0.3, 0.3, 0.5, 0.5];

function getAvatarAxes(tags) {
  if (!tags || tags.length === 0) return NEUTRAL_AXES;
  var sums = [0, 0, 0, 0], count = 0;
  tags.forEach(t => {
    var axes = TAG_AXES[t.toLowerCase().trim()] || NEUTRAL_AXES;
    for (var i = 0; i < 4; i++) sums[i] += axes[i];
    count++;
  });
  return sums.map(s => s / count);
}

function genAvatarPath(tags, size) {
  var axes = getAvatarAxes(tags);
  var spikiness = axes[0], roughness = axes[1], fullness = axes[2], regularity = axes[3];
  var cx = size / 2, cy = size / 2;
  var baseR = size * (0.25 + fullness * 0.15);
  var steps = 120;
  var numSpikes = Math.round(3 + spikiness * 5);
  var spikeDepth = size * spikiness * 0.18;
  var roughAmp = size * roughness * 0.055;
  var roughFreq = 7 + Math.round(roughness * 9);
  var seed = 0;
  (tags || []).forEach(t => { for (var i = 0; i < t.length; i++) seed = (seed * 31 + t.charCodeAt(i)) >>> 0; });
  function sr(i) { var x = Math.sin(seed + i * 127.1) * 43758.5453123; return x - Math.floor(x); }
  var spikes = [];
  for (var p = 0; p < numSpikes; p++) {
    var baseAngle = (p / numSpikes) * Math.PI * 2;
    var jitter = (1 - regularity) * (sr(p + 1) * 1.4 - 0.7);
    var width = 0.18 + (1 - regularity) * sr(p + 20) * 0.35 + regularity * 0.12;
    spikes.push({ angle: baseAngle + jitter, depth: spikeDepth, width });
  }
  var d = "";
  for (var i = 0; i <= steps; i++) {
    var t = (i / steps) * Math.PI * 2;
    var spikeTotal = 0;
    for (var si = 0; si < spikes.length; si++) {
      var diff = t - spikes[si].angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      spikeTotal += Math.exp(-(diff * diff) / (2 * spikes[si].width * spikes[si].width)) * spikes[si].depth;
    }
    var rough = roughAmp * Math.sin(t * roughFreq + seed % 6.28) + roughAmp * 0.4 * Math.sin(t * (roughFreq + 3) + seed * 0.7);
    var r = baseR + spikeTotal + rough;
    d += (i === 0 ? "M " : "L ") + (cx + r * Math.cos(t - Math.PI / 2)).toFixed(2) + " " + (cy + r * Math.sin(t - Math.PI / 2)).toFixed(2) + " ";
  }
  return d + "Z";
}

const ALL_INTEREST_TAGS = [
  "coffee","food","gaming","tech","art","design","film","books","jazz","vinyl",
  "hiking","outdoors","fitness","cycling","rock","metal","climbing","skateboarding",
  "photography","cooking","theatre","poetry","travel","dancing","ceramics","astrology","tattoos","dogs",
  "night owl","introvert","slow mornings","overthinker","homebody","chaotic good",
  "early bird","empath","restless","daydreamer",
  "punk","indie","hip-hop","r&b","country","religious","activist","academic",
  "nightlife","sports","foodie","maker","spiritual","theater kid","military",
  "immigrant","parent","creative","hustler","performer",
];

const TAG_SUGGESTIONS = ALL_INTEREST_TAGS;

const DEFAULT_PRESETS=[
  "got a window seat",
  "killing time",
  "open to weird conversations",
  "have 20 minutes",
  "just passing through",
  "here for a while",
];

const NEARBY_USERS=[
  {id:"user_nearby_1",handle:"@maren",displayName:"Maren",tags:["jazz","vinyl","coffee","film","cycling"],status:"got a window seat and nowhere to be",angle:-80,r:95,
   responses:["didn't expect a ping right now","what are you doing around here?","good timing actually","i've been sitting here for an hour, say something interesting","this seat's been mine for the last two coffees"]},
  {id:"user_nearby_2",handle:"@sol",displayName:"Sol",tags:["rock","metal","coffee","night owl","gaming"],status:"open to conversation",angle:40,r:120,
   responses:["hey, what's up","yeah i'm around","what made you reach out?","been a slow night honestly","open to it, what do you have in mind"]},
  {id:"user_nearby_3",handle:"@fitz",displayName:"Fitz",tags:["books","jazz","coffee","hiking","photography"],status:"reading, but happy to look up",angle:130,r:85,
   responses:["i'll fold the page","what's going on over there","interesting timing","you pulled me out of a good chapter, worth it?","alright, you've got my attention"]},
  {id:"user_nearby_4",handle:"@yuna",displayName:"Yuna",tags:["yoga","art","cooking","travel","slow mornings"],status:"thirty minutes before my next thing",angle:-30,r:110,
   responses:["clock's ticking, make it count","i was just thinking about leaving","okay i'm listening","what's the move","thirty minutes, go"]},
];

const PULSE_CIRCLES=[
  {id:"pc_1",name:"The Still Room",tags:["jazz","vinyl","coffee"],passphrase:"after midnight",angle:55,r:100,members:7,governance:{mode:"admin",admins:["user_still"]},type:"hidden",pulseable:true},
  {id:"pc_2",name:"Fold & Gather",tags:["art","design","books","academic"],passphrase:"",angle:-100,r:130,members:12,governance:{mode:"democracy",admins:[]},type:"hidden",pulseable:true},
  {id:"pc_3",name:"The Back Channel",tags:["rock","metal","indie","gaming"],passphrase:"signal lost",angle:160,r:90,members:4,governance:{mode:"admin",admins:["user_bc"]},type:"hidden",pulseable:true},
];

function tagSeed(tags){var s=0;(tags||[]).forEach(t=>{for(var i=0;i<t.length;i++)s=(s*31+t.charCodeAt(i))>>>0;});return s;}

function genAvatarParticles(count,size,grand){
  var pts=[],n=grand?count*2:count;
  for(var i=0;i<n;i++){var a=(i/n)*Math.PI*2+(Math.random()-.5)*0.6;pts.push({angle:a,dist:size*(grand?0.28+Math.random()*0.42:0.18+Math.random()*0.28),size:size*(grand?0.022+Math.random()*0.038:0.018+Math.random()*0.028),delay:Math.random()*(grand?0.32:0.2),drift:(Math.random()-.5)*size*(grand?0.1:0.06),driftFreq:2+Math.random()*3});}
  return pts;
}

function genCustomTagParticles(count, size) {
  var pts = [], n = count * 3;
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.9;
    pts.push({angle:a,dist:size*(0.35+Math.random()*0.55),size:size*(0.028+Math.random()*0.048),delay:Math.random()*0.45,drift:(Math.random()-0.5)*size*0.14,driftFreq:1.5+Math.random()*4});
  }
  return pts;
}

function RoughUnderline({width, color=INK_MID}){
  var seed = width * 7;
  function sr(i){var x=Math.sin(seed+i*127.1)*43758.5453123;return x-Math.floor(x);}
  var pts=[], steps=Math.max(4,Math.floor(width/5));
  for(var i=0;i<=steps;i++){pts.push((i/steps)*width+","+(1.5+(sr(i)*2.5-1.2)));}
  return(
    <svg width={width} height={6} style={{position:"absolute",bottom:-5,left:0,pointerEvents:"none",overflow:"visible"}}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  );
}

function StaticAvatar({tags,size=24,color=INK,bg=BG}){
  var path=genAvatarPath(tags,size),cx=size/2,cy=size/2,strokeW=size*0.032*(0.6+(tags.length/9)*0.5);
  return(<svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{display:"block"}}><path d={path} fill="none" stroke={color} strokeWidth={strokeW}/><circle cx={cx} cy={cy} r={size*0.085} fill={color}/><circle cx={cx} cy={cy} r={size*0.038} fill={bg}/></svg>);
}

function UserAvatar({tags,size=40,color=INK,bg=BG,burst=false,grand=false,customBurst=false,onBurstEnd}){
  var path=genAvatarPath(tags,size),cx=size/2,cy=size/2,n=tags.length;
  var breatheAmp=0.018+(n/9)*0.055,breatheSpeed=0.018+(n/9)*0.014;
  var [breathe,setBreathe]=useState(1);
  var breatheRaf=useRef(null),breatheT=useRef(Math.random()*Math.PI*2);
  useEffect(()=>{function loop(){breatheT.current+=breatheSpeed;setBreathe(1+breatheAmp*Math.sin(breatheT.current));breatheRaf.current=requestAnimationFrame(loop);}breatheRaf.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(breatheRaf.current);},[breatheAmp,breatheSpeed]);
  var isCustom=customBurst;
  var BURST_DUR=isCustom?1600:(grand?1100:620);
  var [particles,setParticles]=useState(null),[burstProg,setBurstProg]=useState(0),[expand,setExpand]=useState(1);
  var burstRaf=useRef(null),burstStart=useRef(null);
  useEffect(()=>{
    if(!burst)return;
    setParticles(isCustom?genCustomTagParticles(18,size):genAvatarParticles(18,size,grand));
    setBurstProg(0);setExpand(1);burstStart.current=performance.now();
    function tick(){
      var p=Math.min(1,(performance.now()-burstStart.current)/BURST_DUR);
      setBurstProg(p);
      if(isCustom){var ep=p<0.15?p/0.15:1-((p-0.15)/0.85);setExpand(1+ep*0.22);}
      else if(grand){var ep2=p<0.18?p/0.18:1-((p-0.18)/0.82);setExpand(1+ep2*0.13);}
      if(p<1){burstRaf.current=requestAnimationFrame(tick);}
      else{setParticles(null);setBurstProg(0);setExpand(1);onBurstEnd&&onBurstEnd();}
    }
    burstRaf.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(burstRaf.current);
  },[burst]);
  var strokeW=size*0.032*(0.6+(n/9)*0.5);
  var ringCount=isCustom?[0,0.1,0.2,0.32]:[0,0.15,0.3];
  return(<svg width={size} height={size} viewBox={"0 0 "+size+" "+size} style={{overflow:"visible"}}>
    {((grand&&burst)||isCustom)&&burst&&burstProg>0&&ringCount.map((off,i)=>{var rp=Math.max(0,Math.min(1,(burstProg-off)/0.7));if(rp<=0)return null;var maxE=isCustom?0.75:0.55;return <circle key={i} cx={cx} cy={cy} r={size*(0.36+rp*maxE)} fill="none" stroke={color} strokeWidth={(1-rp)*size*(isCustom?0.03:0.022)} opacity={(1-rp)*(isCustom?0.65:0.5)} style={{pointerEvents:"none"}}/>;  })}
    {particles&&particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(burstProg-p.delay)/(1-p.delay)));if(lp<=0)return null;var e=Math.pow(lp,0.5),lat=p.drift*Math.sin(e*Math.PI*p.driftFreq);var pa=p.angle+Math.PI/2;var px=cx+Math.cos(p.angle)*p.dist*e+Math.cos(pa)*lat,py=cy+Math.sin(p.angle)*p.dist*e+Math.sin(pa)*lat;return <circle key={i} cx={px} cy={py} r={Math.max(0.1,p.size*(1-e*0.5))} fill={color} opacity={Math.pow(1-e,isCustom?0.6:0.9)*(isCustom?0.98:0.85)} style={{pointerEvents:"none"}}/>;  })}
    <g transform={`translate(${cx},${cy}) scale(${breathe*expand}) translate(${-cx},${-cy})`}><path d={path} fill="none" stroke={color} strokeWidth={strokeW}/><circle cx={cx} cy={cy} r={size*0.085} fill={color}/><circle cx={cx} cy={cy} r={size*0.038} fill={bg}/></g>
  </svg>);
}

function genCoalesceParticles(count,tx,ty){
  var pts=[];
  for(var i=0;i<count;i++){
    var spawnX,spawnY,edge=Math.floor(Math.random()*4);
    if(edge===0){spawnX=-20+Math.random()*390;spawnY=-30+Math.random()*60;}
    else if(edge===1){spawnX=-20+Math.random()*390;spawnY=390+Math.random()*60;}
    else if(edge===2){spawnX=-40+Math.random()*60;spawnY=-20+Math.random()*460;}
    else{spawnX=330+Math.random()*60;spawnY=-20+Math.random()*460;}
    pts.push({sx:spawnX,sy:spawnY,tx,ty,size:0.6+Math.random()*2.0,delay:Math.random()*0.5,drift:(Math.random()-.5)*18,driftFreq:1+Math.random()*2,speed:0.55+Math.random()*0.45});
  }
  return pts;
}

function CoalesceParticles({progress,particles}){
  if(!particles||progress<=0)return null;
  return <g style={{pointerEvents:"none"}}>{particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(progress-p.delay)/((1-p.delay)*p.speed)));if(lp<=0)return null;var e=Math.pow(Math.min(1,lp),0.55),lat=p.drift*Math.sin(e*Math.PI*p.driftFreq);var perpX=-(p.ty-p.sy),perpY=(p.tx-p.sx),len=Math.sqrt(perpX*perpX+perpY*perpY)||1;var nx=perpX/len,ny=perpY/len;var x=p.sx+(p.tx-p.sx)*e+nx*lat*(1-e),y=p.sy+(p.ty-p.sy)*e+ny*lat*(1-e);var fadeIn=Math.min(1,lp*3),fadeOut=e>0.82?Math.pow(1-(e-0.82)/0.18,0.6):1;return <circle key={i} cx={x} cy={y} r={Math.max(0.1,p.size*(1-e*0.5))} fill={INK} opacity={fadeIn*fadeOut*0.8}/>;})}</g>;
}

function useTremor(active,freq,amp){
  var [offset,setOffset]=useState(0);
  var rafRef=useRef(null);
  useEffect(()=>{if(!active){cancelAnimationFrame(rafRef.current);setOffset(0);return;}function loop(){setOffset(Math.sin(performance.now()/freq)*amp);rafRef.current=requestAnimationFrame(loop);}rafRef.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(rafRef.current);},[active,freq,amp]);
  return offset;
}

function FloatingTagDisplay({tag,index,isCustom=false}){
  var [offset,setOffset]=useState({x:0,y:0}),[opacity,setOpacity]=useState(0),[scale,setScale]=useState(0.5);
  var [width,setWidth]=useState(0);
  var rafRef=useRef(null),startTime=useRef(Date.now()),phase=useRef(index*1.3+Math.random()*Math.PI*2);
  var labelRef=useRef(null);
  useEffect(()=>{
    var t0=Date.now();
    function animate(){var ep=Math.min(1,(Date.now()-t0)/400),e=1-Math.pow(1-ep,3);setOpacity(e);setScale(0.5+e*0.5);if(ep<1){rafRef.current=requestAnimationFrame(animate);}else{function drift(){var t=(Date.now()-startTime.current)/1000;setOffset({x:Math.sin(t*0.7+phase.current)*5,y:Math.cos(t*0.5+phase.current*1.3)*3.5});rafRef.current=requestAnimationFrame(drift);}rafRef.current=requestAnimationFrame(drift);}}
    rafRef.current=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  useEffect(()=>{if(labelRef.current)setWidth(labelRef.current.offsetWidth);},[tag]);
  return(
    <div style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})`,opacity,display:"inline-flex",alignItems:"center",padding:"5px 11px",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:INK_MID,border:"1.5px solid "+INK_LIGHT,background:BG,position:"relative"}}>
      <span ref={labelRef}>{tag}</span>
      {isCustom&&width>0&&<RoughUnderline width={width} color={INK_MID}/>}
    </div>
  );
}

function NearbyUserMarker({user,cx,cy,progress,onClick}){
  var x=cx+user.r*Math.cos((user.angle*Math.PI)/180),y=cy+user.r*Math.sin((user.angle*Math.PI)/180);
  var held=progress>=0.60&&progress<0.82,resolved=progress>=0.82;
  var heldP=held?Math.min(1,(progress-0.60)/0.18):0,resolveP=resolved?Math.min(1,(progress-0.82)/0.18):0;
  var tremor=useTremor(held,55,1.8*heldP*(1-heldP));
  var tx2=x+tremor,ty2=y+tremor*0.6;
  if(!held&&!resolved)return null;
  var markerOp=held?heldP*0.45:resolveP;
  return(<g style={{pointerEvents:resolveP>=1?"auto":"none"}} onClick={()=>resolveP>=1&&onClick(user)}>
    <circle cx={tx2} cy={ty2} r={10+heldP*4} fill="none" stroke={INK} strokeWidth="0.8" opacity={held?heldP*0.2:resolveP*0.35} strokeDasharray="2 3"/>
    <circle cx={tx2} cy={ty2} r={7} fill={BG} stroke={INK} strokeWidth={held?"1":"1.5"} opacity={markerOp} strokeDasharray="2.5 2"/>
    <g opacity={markerOp} style={{pointerEvents:"none"}}><path d={genAvatarPath(user.tags,14)} transform={`translate(${tx2-7},${ty2-7})`} fill="none" stroke={INK} strokeWidth="0.8"/></g>
    <text x={tx2} y={ty2-13} textAnchor="middle" fontSize="7" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={resolveP}>{user.handle.toUpperCase()}</text>
  </g>);
}

function NearbyCircleMarker({circle,cx,cy,progress,onClick}){
  var x=cx+circle.r*Math.cos((circle.angle*Math.PI)/180),y=cy+circle.r*Math.sin((circle.angle*Math.PI)/180);
  var held=progress>=0.60&&progress<0.82,resolved=progress>=0.82;
  var heldP=held?Math.min(1,(progress-0.60)/0.18):0,resolveP=resolved?Math.min(1,(progress-0.82)/0.18):0;
  var tremor=useTremor(held,60,2.0*heldP*(1-heldP));
  var tx=x+tremor,ty=y+tremor*0.7;
  if(!held&&!resolved)return null;
  var op=held?heldP*0.45:resolveP;
  var color=DRAFT_COLORS[Math.abs(tagSeed(circle.tags))%6+1]||INK;
  var R=10,hatch=[];
  for(var i=-R;i<=R;i+=3.5){var hw=Math.sqrt(Math.max(0,R*R-i*i));hatch.push(<line key={i} x1={tx-hw} y1={ty+i} x2={tx+hw} y2={ty+i} stroke={color} strokeWidth="0.7" opacity={0.5}/>);}
  return(<g style={{pointerEvents:resolveP>=1?"auto":"none"}} onClick={()=>resolveP>=1&&onClick(circle)}>
    <circle cx={tx} cy={ty} r={22} fill="transparent"/>
    {held&&<circle cx={tx} cy={ty} r={R+8*heldP} fill="none" stroke={color} strokeWidth="1" opacity={heldP*0.3}/>}
    <clipPath id={"pcclip"+circle.id}><circle cx={tx} cy={ty} r={R}/></clipPath>
    <g clipPath={"url(#pcclip"+circle.id+")"} opacity={op}>{hatch}</g>
    <circle cx={tx} cy={ty} r={R} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 2.5" opacity={op}/>
    <text x={tx} y={ty+4} textAnchor="middle" fontSize="10" fontWeight="900" fill={color} fontFamily={font} opacity={op}>?</text>
    <text x={tx} y={ty-R-6} textAnchor="middle" fontSize="8" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={resolveP}>{circle.name.toUpperCase()}</text>
  </g>);
}

function SpontaneousCircleSheet({currentUser,otherUser,sharedTags,onCreate,onDismiss}){
  var [visible,setVisible]=useState(false);
  var names=[currentUser.displayName,otherUser.displayName].sort();
  var autoName=names[0]+" & "+names[1]+"'s Circle";
  var [circleName,setCircleName]=useState(autoName);
  var inputRef=useRef(null);
  useEffect(()=>{var t=setTimeout(()=>{setVisible(true);setTimeout(()=>inputRef.current&&inputRef.current.focus(),350);},80);return()=>clearTimeout(t);},[]);
  var tags=sharedTags.length>0?sharedTags:otherUser.tags.slice(0,4);
  function handleCreate(){onCreate({name:circleName.trim()||autoName,tags,type:"closed",governance:{mode:"admin",admins:[]},passphrase:"",pulseable:false});}
  return(<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:200,transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.4s cubic-bezier(0.22,1,0.36,1)"}}>
    <div style={{background:BG,border:"2px solid "+INK,borderBottom:"none",padding:"22px 22px 32px",boxShadow:"0 -4px 0 "+INK}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Start a Circle</div>
        <button onClick={onDismiss} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:0}}>×</button>
      </div>
      <input ref={inputRef} value={circleName} onChange={e=>setCircleName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleCreate();}} maxLength={48} style={{background:"none",border:"none",borderBottom:"2px solid "+INK,outline:"none",fontFamily:font,color:INK,width:"100%",fontSize:17,fontWeight:900,padding:"6px 0",letterSpacing:0.5,marginBottom:10}}/>
      <div style={{fontSize:9,color:INK_MID,marginBottom:tags.length>0?16:22}}>Private · admin rule · {tags.length>0?"your shared tags":"no shared tags yet"}</div>
      {tags.length>0&&(<div style={{marginBottom:20}}><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:10}}>Starting from</div><div style={{display:"flex",flexWrap:"wrap",gap:8,minHeight:36}}>{tags.map((t,i)=><FloatingTagDisplay key={t} tag={t} index={i}/>)}</div></div>)}
      <button onClick={handleCreate} style={{width:"100%",background:INK,color:BG,border:"none",padding:"14px 0",fontFamily:font,fontWeight:700,fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Create Circle →</button>
    </div>
  </div>);
}

const PULSE_CHAT_LIMIT=7;
function PulseChat({currentUser,otherUser,onStartCircle,onConnect,onDismiss}){
  var [msgs,setMsgs]=useState([]);var [input,setInput]=useState("");var [faded,setFaded]=useState(false);var [isTyping,setIsTyping]=useState(false);
  var inputRef=useRef(null),msgsRef=useRef(null),responseIdx=useRef(0);
  var sharedTags=(currentUser.tags||[]).filter(t=>(otherUser.tags||[]).includes(t));
  var remaining=PULSE_CHAT_LIMIT-msgs.length,locked=remaining<=0||faded;
  useEffect(()=>{if(inputRef.current&&!locked)inputRef.current.focus();},[locked]);
  useEffect(()=>{if(msgsRef.current)msgsRef.current.scrollTop=msgsRef.current.scrollHeight;},[msgs,isTyping]);
  function send(){
    if(!input.trim()||locked)return;
    var nm={id:Math.random().toString(36).slice(2),senderId:currentUser.id,senderHandle:currentUser.handle,text:input.trim()};
    var next=[...msgs,nm];setMsgs(next);setInput("");
    if(next.length>=PULSE_CHAT_LIMIT){setFaded(true);return;}
    setIsTyping(true);
    setTimeout(()=>{setIsTyping(false);var resp=(otherUser.responses||["..."])[responseIdx.current%((otherUser.responses||["..."]).length)];responseIdx.current++;var rm={id:Math.random().toString(36).slice(2),senderId:otherUser.id,senderHandle:otherUser.handle,text:resp};setMsgs(prev=>{var updated=[...prev,rm];if(updated.length>=PULSE_CHAT_LIMIT)setFaded(true);return updated;});},850+Math.random()*600);
  }
  return(<div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
    <div style={{padding:"14px 18px",borderBottom:"1.5px solid "+INK,display:"flex",alignItems:"center",gap:12,minHeight:56}}>
      <button onClick={onDismiss} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",padding:"0 8px 0 0"}}>←</button>
      <StaticAvatar tags={otherUser.tags} size={30} color={INK} bg={BG}/>
      <div style={{flex:1}}><div style={{fontWeight:900,fontSize:14,letterSpacing:1,color:INK}}>{otherUser.displayName}</div>{otherUser.status&&<div style={{fontSize:10,color:INK_MID,fontStyle:"italic"}}>"{otherUser.status}"</div>}</div>
      <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:900,color:faded?INK_LIGHT:remaining<=2?INK:INK_MID}}>{remaining}</div><div style={{fontSize:7,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:INK_LIGHT}}>left</div></div>
    </div>
    <div ref={msgsRef} style={{flex:1,padding:"16px 18px",overflowY:"auto",display:"flex",flexDirection:"column",gap:10,position:"relative"}}>
      {msgs.length===0&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:16}}>
        {otherUser.status&&<div style={{fontSize:12,color:INK_MID,fontStyle:"italic",textAlign:"center",padding:"8px 16px",border:"1px solid "+INK_LIGHT}}>"{otherUser.status}"</div>}
        <div style={{fontSize:11,color:INK_MID,textAlign:"center",lineHeight:1.9,maxWidth:220}}>A temporary channel.<br/>{PULSE_CHAT_LIMIT} messages to figure out what this is.</div>
        {sharedTags.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:8}}>{sharedTags.map((t,i)=><FloatingTagDisplay key={t} tag={t} index={i}/>)}</div>}
      </div>)}
      {msgs.map((m,i)=>(<div key={m.id||i} style={{display:"flex",flexDirection:"column",alignItems:m.senderId===currentUser.id?"flex-end":"flex-start",gap:3}}><div style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:INK_MID}}>{m.senderId===currentUser.id?"You":m.senderHandle}</div><div style={{fontSize:14,lineHeight:1.6,color:INK,maxWidth:"78%",textAlign:m.senderId===currentUser.id?"right":"left"}}>{m.text}</div></div>))}
      {isTyping&&(<div style={{display:"flex",alignItems:"center",gap:5,opacity:0.5}}><div style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:INK_MID}}>{otherUser.handle}</div><div style={{fontSize:12,color:INK_MID,letterSpacing:2}}>···</div></div>)}
      {faded&&(<div style={{marginTop:12,padding:"14px 0",borderTop:"1px solid "+INK_LIGHT,display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}><div style={{fontSize:11,color:INK_MID,fontStyle:"italic",textAlign:"center"}}>This pulse faded.</div><button onClick={()=>onStartCircle(otherUser,sharedTags)} style={{background:INK,color:BG,border:"none",padding:"12px 24px",fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Start a Circle →</button></div>)}
    </div>
    <div style={{padding:"10px 18px",borderTop:"1px solid "+INK_LIGHT,display:"flex",gap:8}}>
      <button onClick={()=>onStartCircle(otherUser,sharedTags)} style={{flex:1,background:"none",border:"1.5px solid "+INK,color:INK,padding:"10px 0",fontFamily:font,fontWeight:700,fontSize:9,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>Start a Circle →</button>
      <button onClick={onConnect} style={{flex:1,background:"none",border:"1.5px solid "+INK_LIGHT,color:INK_MID,padding:"10px 0",fontFamily:font,fontWeight:700,fontSize:9,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>Connect →</button>
    </div>
    {!locked&&(<div style={{padding:"10px 18px 16px",borderTop:"1.5px solid "+INK,display:"flex",gap:10,alignItems:"center"}}>
      <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Say something..." style={{flex:1,background:"none",border:"none",borderBottom:"1.5px solid "+INK,outline:"none",fontFamily:font,fontSize:14,color:INK,padding:"6px 0"}}/>
      <button onClick={send} style={{background:INK,color:BG,border:"none",padding:"10px 14px",fontFamily:font,fontWeight:700,fontSize:9,cursor:"pointer",letterSpacing:1.5,minHeight:44}}>SEND</button>
    </div>)}
  </div>);
}

function PulseCheckCard({user,currentUser,onStartPulseChat,onDismiss}){
  var [visible,setVisible]=useState(false);
  useEffect(()=>{var t=setTimeout(()=>setVisible(true),80);return()=>clearTimeout(t);},[]);
  var sharedTags=(currentUser.tags||[]).filter(t=>(user.tags||[]).includes(t));
  return(<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:150,transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.45s cubic-bezier(0.22,1,0.36,1)"}}>
    <div style={{background:BG,border:"2px solid "+INK,borderBottom:"none",padding:"22px 22px 28px",boxShadow:"0 -4px 0 "+INK}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}><div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>◉ Pulse Check</div><button onClick={onDismiss} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:0}}>×</button></div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <StaticAvatar tags={user.tags} size={56} color={INK} bg={BG}/>
        <div><div style={{fontWeight:900,fontSize:17,letterSpacing:1,color:INK}}>{user.displayName}</div><div style={{fontSize:10,color:INK_MID,letterSpacing:.8,marginTop:2}}>{user.handle}</div>{user.status&&<div style={{fontSize:11,color:INK,marginTop:5,fontStyle:"italic",lineHeight:1.5}}>"{user.status}"</div>}</div>
      </div>
      {sharedTags.length>0&&<div style={{marginBottom:18}}><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:7}}>You both care about</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sharedTags.map(t=><span key={t} style={{fontSize:9,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",background:INK,color:BG,padding:"3px 9px"}}>{t}</span>)}</div></div>}
      {sharedTags.length===0&&<div style={{marginBottom:18,fontSize:11,color:INK_MID,fontStyle:"italic"}}>Both open to connection nearby.</div>}
      <button onClick={()=>onStartPulseChat(user)} style={{width:"100%",background:INK,color:BG,border:"none",padding:"14px 0",fontFamily:font,fontWeight:700,fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Start a Pulse Chat →</button>
    </div>
  </div>);
}

function CirclePulseCard({circle,currentUser,onJoin,onDismiss}){
  var [visible,setVisible]=useState(false);
  useEffect(()=>{var t=setTimeout(()=>setVisible(true),80);return()=>clearTimeout(t);},[]);
  var sharedTags=(currentUser.tags||[]).filter(t=>(circle.tags||[]).includes(t));
  var color=DRAFT_COLORS[Math.abs(tagSeed(circle.tags))%6+1]||INK;
  return(<div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:150,transform:visible?"translateY(0)":"translateY(100%)",transition:"transform 0.45s cubic-bezier(0.22,1,0.36,1)"}}>
    <div style={{background:BG,border:"2px solid "+INK,borderBottom:"none",padding:"22px 22px 28px",boxShadow:"0 -4px 0 "+INK}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}><div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>◉ Pulse Check — Hidden Circle</div><button onClick={onDismiss} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:0}}>×</button></div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:36,height:36,border:"2px dashed "+color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16,fontWeight:900,color}}>?</span></div>
        <div><div style={{fontWeight:900,fontSize:17,letterSpacing:1,color:INK}}>{circle.name}</div><div style={{fontSize:10,color:INK_MID,marginTop:2,display:"flex",alignItems:"center",gap:6}}><span>Hidden</span><span>·</span><span>{circle.members} members</span><span>·</span><span>{circle.governance.mode==="democracy"?"Democracy":"Admin rule"}</span></div></div>
      </div>
      {circle.tags.length>0&&<div style={{marginBottom:sharedTags.length>0?12:18}}><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{circle.tags.map(t=><span key={t} style={{fontSize:9,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",border:"1px solid "+INK_LIGHT,padding:"2px 7px",color:INK_MID}}>{t}</span>)}</div></div>}
      {sharedTags.length>0&&<div style={{marginBottom:18}}><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:7}}>Matches your interests</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sharedTags.map(t=><span key={t} style={{fontSize:9,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",background:INK,color:BG,padding:"3px 9px"}}>{t}</span>)}</div></div>}
      <button onClick={()=>onJoin(circle)} style={{width:"100%",background:INK,color:BG,border:"none",padding:"14px 0",fontFamily:font,fontWeight:700,fontSize:11,letterSpacing:2,textTransform:"uppercase",cursor:"pointer"}}>Try to Get In →</button>
    </div>
  </div>);
}

function StatusTab({currentUser,onUpdateStatus,onUpdatePresets}){
  var [open,setOpen]=useState(false),[customInput,setCustomInput]=useState(""),[addingCustom,setAddingCustom]=useState(false);
  var inputRef=useRef(null);
  var presets=currentUser.statusPresets||DEFAULT_PRESETS,currentStatus=currentUser.status||"";
  useEffect(()=>{if(addingCustom&&inputRef.current)inputRef.current.focus();},[addingCustom]);
  function selectPreset(p){onUpdateStatus(p);setOpen(false);}
  function clearStatus(){onUpdateStatus("");setOpen(false);}
  function addCustom(){var v=customInput.trim();if(!v)return;onUpdatePresets([...presets,v]);onUpdateStatus(v);setCustomInput("");setAddingCustom(false);setOpen(false);}
  function removePreset(p,e){e.stopPropagation();var next=presets.filter(x=>x!==p);onUpdatePresets(next);if(currentStatus===p)onUpdateStatus("");}
  var hasStatus=!!currentStatus;
  // Taller row (40px), larger status text (13px)
  return(<div style={{position:"relative",zIndex:60}}>
    <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 18px",height:40,background:open?INK:BG,borderBottom:"1.5px solid "+(open?INK:INK_LIGHT),cursor:"pointer",transition:"background 0.15s",position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,pointerEvents:"none",overflow:"hidden"}}><svg width="100%" height="40" style={{position:"absolute",top:0,left:0}}><rect x="0" y="0" width="100%" height="40" fill={open?INK:BG}/></svg></div>
      <div style={{display:"flex",alignItems:"center",gap:10,position:"relative",zIndex:1,minWidth:0}}>
        <span style={{fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:open?BG:INK_MID,flexShrink:0}}>STATUS</span>
        <span style={{fontSize:13,fontStyle:"italic",color:open?BG:(hasStatus?INK:INK_LIGHT),fontWeight:hasStatus?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{hasStatus?`"${currentStatus}"`:`"set a status"`}</span>
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"center",gap:6}}>
        {hasStatus&&!open&&<span onClick={e=>{e.stopPropagation();clearStatus();}} style={{fontSize:14,color:INK_LIGHT,cursor:"pointer",lineHeight:1,padding:"4px"}}>×</span>}
        <span style={{fontSize:9,color:open?BG:INK_MID,transition:"transform 0.2s",display:"inline-block",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
      </div>
    </div>
    {open&&(<div style={{position:"absolute",top:"100%",left:0,right:0,background:BG,border:"1.5px solid "+INK,borderTop:"none",boxShadow:"0 4px 0 "+INK_LIGHT,zIndex:100,maxHeight:280,overflowY:"auto"}}>
      {hasStatus&&<div style={{padding:"8px 16px",borderBottom:"1px solid "+INK_LIGHT,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID}}>Active</span><button onClick={clearStatus} style={{background:"none",border:"1px solid "+INK_LIGHT,color:INK_MID,fontFamily:font,fontWeight:700,fontSize:8,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",padding:"3px 8px"}}>Clear</button></div>}
      {presets.map((p,i)=>{var isActive=p===currentStatus;return(<div key={i} onClick={()=>selectPreset(p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",borderBottom:"1px solid "+INK_LIGHT,cursor:"pointer",background:isActive?INK:BG,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>{isActive&&<span style={{fontSize:8,color:BG,flexShrink:0}}>◉</span>}<span style={{fontSize:13,fontStyle:"italic",color:isActive?BG:INK,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{p}"</span></div>
        {!isActive&&<span onClick={e=>removePreset(p,e)} style={{fontSize:11,color:INK_LIGHT,cursor:"pointer",flexShrink:0,padding:"0 2px"}}>×</span>}
      </div>);})}
      {addingCustom?(<div style={{padding:"10px 16px",borderBottom:"1px solid "+INK_LIGHT,display:"flex",gap:8,alignItems:"center"}}><input ref={inputRef} value={customInput} onChange={e=>setCustomInput(e.target.value.slice(0,50))} onKeyDown={e=>{if(e.key==="Enter")addCustom();if(e.key==="Escape"){setAddingCustom(false);setCustomInput("");}}} placeholder="write your own..." style={{flex:1,background:"none",border:"none",borderBottom:"1.5px solid "+INK,outline:"none",fontFamily:font,fontSize:13,fontStyle:"italic",color:INK,padding:"4px 0"}}/><button onClick={addCustom} style={{background:INK,color:BG,border:"none",padding:"6px 12px",fontFamily:font,fontWeight:700,fontSize:9,cursor:"pointer",letterSpacing:1,minHeight:32}}>Add</button></div>)
      :(<div onClick={()=>setAddingCustom(true)} style={{padding:"11px 16px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><span style={{fontSize:12,color:INK_LIGHT,lineHeight:1}}>+</span><span style={{fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:INK_MID}}>Add custom</span></div>)}
    </div>)}
  </div>);
}

function makeMessage(text,senderId,senderHandle){return{id:Math.random().toString(36).slice(2),senderId,senderHandle,text,timestamp:Date.now()};}
function normalizeMsgs(msgs){return(msgs||[]).map(m=>typeof m==="string"?makeMessage(m,"user_unknown","@member"):m);}
function makeCircle(o){return{id:Date.now(),ownerId:"",name:"",type:"open",pulseable:true,passphrase:"",dist:0,members:1,angle:0,r:80,msgs:[],tags:[],governance:{mode:"admin",admins:[]},pendingRequests:[],inviteCodes:[],isOwn:false,...o};}

const INIT_CHATS=[
  makeCircle({id:1,ownerId:"user_meridian",name:"Meridian Coffee",type:"open",dist:0.2,members:12,angle:-55,r:80,msgs:normalizeMsgs(["good espresso today","anyone tried the new pour over?","yes, highly recommend"]),tags:["coffee","food","slow mornings"],governance:{mode:"admin",admins:["user_meridian"]}}),
  makeCircle({id:2,ownerId:"user_park",name:"Park Regulars",type:"open",dist:0.5,members:34,angle:30,r:140,msgs:normalizeMsgs(["dogs welcome south side","bring frisbees tmr?"]),tags:["outdoors","dogs","sports"],governance:{mode:"democracy",admins:[]}}),
  makeCircle({id:3,ownerId:"user_block",name:"Block Watch",type:"closed",dist:0.8,members:8,angle:155,r:170,msgs:normalizeMsgs(["meeting thursday 7pm","confirmed"]),tags:["local","maker","parent"],governance:{mode:"admin",admins:["user_block"]}}),
  makeCircle({id:4,ownerId:"user_unknown",name:"???",type:"hidden",dist:1.1,members:null,angle:-130,r:210,msgs:[],tags:[],pulseable:true,passphrase:"velvet fog",governance:{mode:"admin",admins:["user_unknown"]}}),
  makeCircle({id:5,ownerId:"user_market",name:"Night Market",type:"open",dist:0.3,members:67,angle:85,r:105,msgs:normalizeMsgs(["opens at 6","cash only tonight"]),tags:["food","foodie","nightlife"],governance:{mode:"democracy",admins:[]}}),
  makeCircle({id:6,ownerId:"user_studio",name:"Studio Session",type:"closed",dist:0.9,members:4,angle:-18,r:188,msgs:normalizeMsgs(["tracking starts 8pm"]),tags:["rock","metal","indie","performer"],governance:{mode:"admin",admins:["user_studio"]}}),
];

function wobblyPath(cx,cy,r,seed,steps,amp){steps=steps||120;amp=amp||2.2;var d="";for(var i=0;i<=steps;i++){var t=(i/steps)*Math.PI*2;var wr=r+amp*Math.sin(t*5+seed)+amp*0.4*Math.sin(t*11+seed*0.9);d+=(i===0?"M ":"L ")+(cx+wr*Math.cos(t-Math.PI/2))+" "+(cy+wr*Math.sin(t-Math.PI/2))+" ";}return d+"Z";}
function genPulseParticles(c){var p=[];for(var i=0;i<c;i++){var a=(i/c)*Math.PI*2+(Math.random()-.5)*.55;p.push({angle:a,dist:55+Math.random()*110,size:0.8+Math.random()*2.8,delay:Math.random()*.28,drift:(Math.random()-.5)*4.5,driftFreq:1.2+Math.random()*3.5});}return p;}
function genOutwardParticles(c){var p=[];for(var i=0;i<c;i++){var a=(i/c)*Math.PI*2+(Math.random()-.5)*.25;p.push({angle:a,travelMult:1.1+Math.random()*1.8,size:.8+Math.random()*2.2,delay:Math.random()*.22,drift:(Math.random()-.5)*3.5,driftFreq:1.5+Math.random()*3,brightness:.4+Math.random()*.6});}return p;}
function genInwardParticles(c){var p=[];for(var i=0;i<c;i++){var a=(i/c)*Math.PI*2+(Math.random()-.5)*.4;p.push({angle:a,spawnMult:1.3+Math.random()*1.4,size:.8+Math.random()*1.8,delay:Math.random()*.28,drift:(Math.random()-.5)*2.8,driftFreq:1.5+Math.random()*2.5,brightness:.35+Math.random()*.65});}return p;}
function genPlantParticles(c){var p=[];for(var i=0;i<c;i++){var a=(i/c)*Math.PI*2;p.push({angle:a+(Math.random()-.5)*.5,scatter:22+Math.random()*28,size:1.2+Math.random()*1.2,delay:Math.random()*.2,drift:(Math.random()-.5)*2.2,driftFreq:2+Math.random()*2.5});}return p;}

function FistIcon({size=12,color=INK}){var lo=color===BG||color==="white"?"rgba(0,0,0,0.15)":"rgba(255,255,255,0.2)";return(<svg width={size} height={size} viewBox="0 0 24 28" style={{display:"inline-block",verticalAlign:"middle",flexShrink:0}}><path d="M 5 14 L 5 9 Q 5 7 7 7 L 10 7 Q 10 5 12 5 L 13 5 Q 15 5 15 7 L 17 7 Q 19 7 19 9 L 19 11 Q 19 13 17 13 L 17 14 Q 17 16 15 16 L 7 16 Q 5 16 5 14 Z" fill={color}/><path d="M 5 13 Q 3 12 2 10 Q 1 8 3 8 Q 5 8 6 10 L 6 13 Z" fill={color}/><path d="M 5 16 Q 5 20 6 22 L 18 22 Q 19 20 19 16 Q 17 16 15 16 L 7 16 Q 5 16 5 16 Z" fill={color}/><line x1="8" y1="7.5" x2="8" y2="10" stroke={lo} strokeWidth="0.8"/><line x1="12" y1="5.5" x2="12" y2="9" stroke={lo} strokeWidth="0.8"/><line x1="16" y1="7.5" x2="16" y2="10" stroke={lo} strokeWidth="0.8"/></svg>);}

function InterestMatchPip({circle, cx, cy, userTags, onDismiss, onGo}) {
  var [pipPulse, setPipPulse] = useState(0);
  var rafRef = useRef(null);
  var sharedTags = userTags.filter(t => (circle.tags||[]).includes(t));
  var color = DRAFT_COLORS[circle.id] || INK;
  var x = cx + circle.r * Math.cos((circle.angle * Math.PI) / 180);
  var y = cy + circle.r * Math.sin((circle.angle * Math.PI) / 180);

  useEffect(() => {
    var start = performance.now();
    function loop() {
      var t = (performance.now() - start) / 1000;
      setPipPulse(0.5 + 0.5 * Math.sin(t * 2.8));
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  var px = x + 8, py = y - 8;

  return (
    <g>
      {/* Pulsing halo */}
      <circle cx={px} cy={py} r={6 + pipPulse * 4} fill="none" stroke={color}
        strokeWidth="0.8" opacity={0.3 * (1 - pipPulse)} style={{pointerEvents:"none"}}/>
      {/* Pip dot — tap to go, long-press area around it to dismiss */}
      <circle cx={px} cy={py} r={4.5} fill={color} opacity={0.9}
        style={{cursor:"pointer",pointerEvents:"auto"}} onClick={(e)=>{e.stopPropagation();onGo(circle);}}/>
      {/* Shared tag count */}
      <text x={px} y={py + 1.5} textAnchor="middle" dominantBaseline="middle"
        fontSize="5" fontWeight="900" fill={BG} fontFamily={font}
        style={{pointerEvents:"none"}}>{sharedTags.length}</text>
    </g>
  );
}

// ── Radius edge label ─────────────────────────────────────────────────────────
function RadiusEdgeLabel({cx, cy, radius, radiusMiles, visibleCount}) {
  if (!radius) return null;
  var lx = cx;
  var ly = cy + radius + 14;
  return (
    <g style={{pointerEvents:"none"}}>
      <text x={lx} y={ly} textAnchor="middle" fontSize="8.5" fontWeight="700"
        fill={INK_MID} fontFamily={font} letterSpacing="0.8">
        {radiusMiles} mi · {visibleCount} visible
      </text>
    </g>
  );
}

function ChatMarker({chat,cx,cy,onClick,radius,revealProgress,highlighted,interestMatch,userTags,onMatchGo,onMatchDismiss}){
  var R=10,color=DRAFT_COLORS[chat.id]||INK;
  var x=cx+chat.r*Math.cos((chat.angle*Math.PI)/180),y=cy+chat.r*Math.sin((chat.angle*Math.PI)/180);
  var inRange=radius===null||chat.r<=radius,baseOp=inRange?1:0.2;
  if(chat.type==="hidden"){
    if(!revealProgress||revealProgress<=0)return null;
    var rp=revealProgress,sh=0.4+0.6*Math.sin(rp*Math.PI),hatch=[];
    for(var i=-R;i<=R;i+=3.5){var hw=Math.sqrt(Math.max(0,R*R-i*i));hatch.push(<line key={i} x1={x-hw} y1={y+i} x2={x+hw} y2={y+i} stroke={color} strokeWidth="0.7" opacity={0.45*rp}/>);}
    return(<g onClick={()=>onClick(chat)} style={{cursor:"pointer",opacity:rp*baseOp}}>
      <circle cx={x} cy={y} r={22} fill="transparent"/>
      <circle cx={x} cy={y} r={R+8*sh} fill="none" stroke={color} strokeWidth="1" opacity={sh*.5*(1-rp*.5)}/>
      <clipPath id={"hclip"+chat.id}><circle cx={x} cy={y} r={R}/></clipPath>
      <g clipPath={"url(#hclip"+chat.id+")"}>{hatch}</g>
      <circle cx={x} cy={y} r={R} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={chat.pulseable!==false?"3 2.5":"none"}/>
      <text x={x} y={y+4} textAnchor="middle" fontSize="10" fontWeight="900" fill={color} fontFamily={font}>?</text>
    </g>);
  }
  return(<g onClick={()=>onClick(chat)} style={{cursor:"pointer",opacity:baseOp,transition:"opacity 0.25s"}}>
    <circle cx={x} cy={y} r={22} fill="transparent"/>
    {highlighted&&<circle cx={x} cy={y} r={R+10} fill="none" stroke={color} strokeWidth="1.5" opacity={0.6} strokeDasharray="3 3"/>}
    {highlighted&&<circle cx={x} cy={y} r={R+18} fill="none" stroke={color} strokeWidth="0.8" opacity={0.25} strokeDasharray="2 4"/>}
    {chat.type==="open"&&<circle cx={x} cy={y} r={R} fill={color}/>}
    {chat.type==="closed"&&<circle cx={x} cy={y} r={R} fill={BG} stroke={color} strokeWidth="2"/>}
    <text x={x} y={y-R-6} textAnchor="middle" fontSize="8" fontWeight="700" fill={INK} fontFamily={font} letterSpacing="0.8" opacity={inRange?1:0.3}>{chat.name.toUpperCase()}</text>
    {/* Interest match pip rendered here, inside the marker group */}
    {interestMatch&&<InterestMatchPip circle={chat} cx={cx} cy={cy} userTags={userTags||[]} onDismiss={onMatchDismiss} onGo={onMatchGo}/>}
  </g>);
}

function JoinModal({chat,onClose,onJoined,onRequestSent}){
  var [track,setTrack]=useState(null),[input,setInput]=useState(""),[status,setStatus]=useState(null);
  var color=DRAFT_COLORS[chat.id]||INK;
  var bb={fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",padding:"12px 0",border:"none",width:"100%"};
  var ii={background:"none",border:"none",borderBottom:"2px solid "+INK,outline:"none",fontFamily:font,color:INK,width:"100%",fontSize:15,padding:"6px 0"};
  function tryPassphrase(){if(!input.trim())return;if(input.trim().toLowerCase()===(chat.passphrase||"").toLowerCase()){setStatus("success");setTimeout(()=>onJoined(chat),900);}else{setStatus("error");setTimeout(()=>setStatus(null),1400);}}
  function submitRequest(){if(!input.trim())return;onRequestSent(chat.id,{id:Math.random().toString(36).slice(2),senderId:"user_local",senderHandle:"@you",message:input.trim(),timestamp:Date.now(),status:"pending"});setStatus("pending");}
  function tryInvite(){if(input.trim().length===6){setStatus("success");setTimeout(()=>onJoined(chat),900);}else{setStatus("error");setTimeout(()=>setStatus(null),1400);}}
  return(<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(10,10,10,0.45)"}}><div style={{background:BG,border:"2px solid "+INK,borderBottom:"none",width:"100%",maxWidth:390,padding:"28px 24px 36px",boxShadow:"0 -4px 0 "+INK}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}><div><div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:4}}>Hidden Circle</div><div style={{fontSize:20,fontWeight:900,letterSpacing:1,textTransform:"uppercase",color:INK}}>{chat.name||"???"}</div></div><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",justifyContent:"flex-end"}}>×</button></div>
    {!track&&status!=="success"&&(<div style={{display:"flex",flexDirection:"column",gap:10}}><div style={{fontSize:11,color:INK_MID,marginBottom:8,lineHeight:1.7}}>You've discovered something. How do you want to get in?</div>{[{key:"passphrase",label:"I know the passphrase",icon:"◈"},{key:"request",label:"Request access",icon:"◎"},{key:"invite",label:"I have an invite code",icon:"◉"}].map(opt=>(<div key={opt.key} onClick={()=>{setTrack(opt.key);setInput("");setStatus(null);}} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",border:"2px solid "+INK_LIGHT,cursor:"pointer"}}><span style={{fontSize:16,color}}>{opt.icon}</span><span style={{fontWeight:700,fontSize:12,color:INK,letterSpacing:.5}}>{opt.label}</span></div>))}</div>)}
    {track==="passphrase"&&status!=="success"&&(<div style={{display:"flex",flexDirection:"column",gap:18}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Enter the passphrase</div><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")tryPassphrase();}} placeholder="speak the words..." style={{...ii,fontStyle:"italic"}} autoFocus/>{status==="error"&&<div style={{fontSize:10,color:"#7a3a3a",fontWeight:700,letterSpacing:1}}>Wrong passphrase. Try again.</div>}<div style={{display:"flex",gap:10}}><button onClick={()=>setTrack(null)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={tryPassphrase} style={{...bb,flex:2,background:INK,color:BG}}>Enter →</button></div></div>)}
    {track==="request"&&status!=="pending"&&status!=="success"&&(<div style={{display:"flex",flexDirection:"column",gap:18}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Make your case</div><textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Why should they let you in?" rows={4} style={{...ii,resize:"none",lineHeight:1.6,fontSize:13,borderBottom:"none",border:"1.5px solid "+INK_LIGHT,padding:"10px 12px"}} autoFocus/><div style={{display:"flex",gap:10}}><button onClick={()=>setTrack(null)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={submitRequest} style={{...bb,flex:2,background:INK,color:BG}}>Send Request</button></div></div>)}
    {track==="request"&&status==="pending"&&(<div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"12px 0"}}><div style={{fontSize:24,opacity:.3}}>◎</div><div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,textAlign:"center"}}>Request Sent</div><div style={{fontSize:11,color:INK_MID,textAlign:"center",lineHeight:1.8,maxWidth:240}}>{chat.governance?.mode==="democracy"?"The circle will vote on your request.":"An admin will review your request."}</div><button onClick={onClose} style={{...bb,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID,marginTop:8}}>Close</button></div>)}
    {track==="invite"&&status!=="success"&&(<div style={{display:"flex",flexDirection:"column",gap:18}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Invite code</div><input value={input} onChange={e=>setInput(e.target.value.toUpperCase().slice(0,6))} onKeyDown={e=>{if(e.key==="Enter")tryInvite();}} placeholder="XXXXXX" style={{...ii,letterSpacing:6,fontSize:22,fontWeight:900}} autoFocus/>{status==="error"&&<div style={{fontSize:10,color:"#7a3a3a",fontWeight:700,letterSpacing:1}}>Invalid code.</div>}<div style={{display:"flex",gap:10}}><button onClick={()=>setTrack(null)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={tryInvite} style={{...bb,flex:2,background:input.length===6?INK:"none",color:input.length===6?BG:INK_LIGHT,border:"2px solid "+(input.length===6?INK:INK_LIGHT)}}>Verify →</button></div></div>)}
    {status==="success"&&(<div style={{display:"flex",flexDirection:"column",gap:14,alignItems:"center",padding:"12px 0"}}><div style={{fontSize:28}}>◉</div><div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK,textAlign:"center"}}>You're in</div><div style={{fontSize:11,color:INK_MID,textAlign:"center"}}>Welcome to the circle.</div></div>)}
  </div></div>);
}

function PulseParticles({progress,tx,ty,fired,particles}){if(!particles||progress<=0)return null;var BTN_R=64;return <g>{particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(progress-p.delay)/(1-p.delay)));if(lp<=0)return null;var e=fired?Math.pow(lp,.55):1-Math.pow(1-lp,.7);var dist=fired?e*BTN_R*4.2:p.dist*(1-e);var lat=p.drift*Math.sin(e*Math.PI*p.driftFreq),pa=p.angle+Math.PI/2;var px=BTN_R+Math.cos(p.angle)*dist+Math.cos(pa)*lat,py=BTN_R+Math.sin(p.angle)*dist+Math.sin(pa)*lat;var op=fired?Math.pow(1-e,.8)*.8:(.2+e*.8);var sz=fired?p.size*(1-e*.6):p.size*(.3+e*.7);return <circle key={i} cx={px} cy={py} r={Math.max(.1,sz)} fill={INK} opacity={op} style={{pointerEvents:"none"}}/>;})}</g>;}
function OutwardBurst({progress,cx,cy,radius,particles}){if(!particles||!progress||progress<=0||!radius)return null;return <g style={{pointerEvents:"none"}}>{particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(progress-p.delay)/(1-p.delay)));if(lp<=0)return null;var e=Math.pow(lp,.5),maxD=radius*p.travelMult,dist=e*maxD;var lat=p.drift*Math.sin(e*Math.PI*p.driftFreq),pa=p.angle+Math.PI/2;var x=cx+Math.cos(p.angle)*dist+Math.cos(pa)*lat,y=cy+Math.sin(p.angle)*dist+Math.sin(pa)*lat;var fade=dist>radius?Math.max(0,1-(dist-radius)/(maxD-radius)):1;return <circle key={i} cx={x} cy={y} r={Math.max(.1,p.size*(1-e*.55))} fill={INK} opacity={Math.pow(1-e,.6)*p.brightness*fade}/>;})}</g>;}
function InwardRush({progress,cx,cy,radius,particles}){if(!particles||!progress||progress<=0||!radius)return null;return <g style={{pointerEvents:"none"}}>{particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(progress-p.delay)/(1-p.delay)));if(lp<=0)return null;var e=1-Math.pow(1-lp,.7),spawnD=radius*p.spawnMult,dist=spawnD*(1-e);var lat=p.drift*Math.sin(e*Math.PI*p.driftFreq),pa=p.angle+Math.PI/2;var x=cx+Math.cos(p.angle)*dist+Math.cos(pa)*lat,y=cy+Math.sin(p.angle)*dist+Math.sin(pa)*lat;var fadeIn=Math.min(1,e*3),fadeOut=dist<20?dist/20:1;return <circle key={i} cx={x} cy={y} r={Math.max(.1,p.size*(.4+e*.6))} fill={INK} opacity={fadeIn*fadeOut*p.brightness*.75}/>;})}</g>;}
function PlantParticles({progress,px,py,stamp,particles}){if(!particles||progress<=0||!px)return null;return <g>{particles.map((p,i)=>{var lp=Math.max(0,Math.min(1,(progress-p.delay)/(1-p.delay)));if(lp<=0)return null;var e=stamp?Math.pow(lp,.5):1-Math.pow(1-lp,.75);var dist=stamp?e*20:p.scatter*(1-e);var lat=p.drift*Math.sin(e*Math.PI*p.driftFreq),pa=p.angle+Math.PI/2;var x=px+Math.cos(p.angle)*dist+Math.cos(pa)*lat,y=py+Math.sin(p.angle)*dist+Math.sin(pa)*lat;var op=stamp?Math.pow(1-e,.7)*.85:(.15+e*.85);return <circle key={i} cx={x} cy={y} r={Math.max(.1,p.size*(stamp?1-e*.8:.3+e*.7))} fill={INK} opacity={op} style={{pointerEvents:"none"}}/>;})}</g>;}
function BleedRings({progress,cx,cy,btnR}){return <g>{[0,.18,.36].map((off,i)=>{var p=Math.max(0,Math.min(1,(progress-off)/.72));if(p<=0)return null;return <circle key={i} cx={cx} cy={cy} r={btnR+p*btnR*3.5} fill="none" stroke={INK} strokeWidth={(1-p)*2.5} opacity={(1-p)*.18} style={{pointerEvents:"none"}}/>;})}</g>;}
function PulseRipples({cx,cy,maxR,progress}){return <g>{[0,.25,.5].map((off,i)=>{var p=Math.max(0,Math.min(1,(progress-off)/.6));if(p<=0)return null;return <circle key={i} cx={cx} cy={cy} r={p*maxR} fill="none" stroke={INK} strokeWidth={1.5-p} opacity={(1-p)*.6} strokeDasharray="6 4"/>;})}</g>;}

function FloatingTag({tag,confirming,onRemove,isCustom=false}){
  var [offset,setOffset]=useState({x:0,y:0}),[opacity,setOpacity]=useState(0),[scale,setScale]=useState(.5);
  var [labelWidth,setLabelWidth]=useState(0);
  var rafRef=useRef(null),startTime=useRef(Date.now()),phase=useRef(Math.random()*Math.PI*2);
  var labelRef=useRef(null);
  useEffect(()=>{setOpacity(0);setScale(.5);var t0=Date.now();function animate(){var ep=Math.min(1,(Date.now()-t0)/300),e=1-Math.pow(1-ep,3);setOpacity(e);setScale(.5+e*.5);if(ep<1){rafRef.current=requestAnimationFrame(animate);}else{function drift(){var t=(Date.now()-startTime.current)/1000;setOffset({x:Math.sin(t*.7+phase.current)*4,y:Math.cos(t*.5+phase.current*1.3)*3});rafRef.current=requestAnimationFrame(drift);}rafRef.current=requestAnimationFrame(drift);}}rafRef.current=requestAnimationFrame(animate);return()=>cancelAnimationFrame(rafRef.current);},[]);
  useEffect(()=>{if(labelRef.current)setLabelWidth(labelRef.current.offsetWidth);},[tag]);
  var cs=confirming?Math.max(0,1-confirming*2):1;
  return(<div style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${scale*cs})`,opacity:opacity*cs,display:"inline-flex",alignItems:"center",gap:6,border:"1.5px solid "+INK,padding:"5px 11px",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer",color:INK,background:BG,boxShadow:"1px 1px 0 "+INK_LIGHT,position:"relative"}} onClick={()=>onRemove(tag)}>
    <span ref={labelRef}>{tag}</span><span style={{opacity:.4,fontSize:11}}>×</span>
    {isCustom&&labelWidth>0&&<RoughUnderline width={labelWidth} color={INK}/>}
  </div>);
}

function OnboardingFlow({onComplete}){
  var [step,setStep]=useState(1),[name,setName]=useState(""),[handle,setHandle]=useState(""),[tags,setTags]=useState([]),[customTags,setCustomTags]=useState(new Set()),[tagInput,setTagInput]=useState(""),[status,setStatus]=useState(""),[pulseCheck,setPulseCheck]=useState(false),[avatarBurst,setAvatarBurst]=useState(false),[avatarGrand,setAvatarGrand]=useState(false),[avatarCustomBurst,setAvatarCustomBurst]=useState(false);
  var inputRef=useRef(null);
  var bb={fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",padding:"12px 0",border:"none",width:"100%"};
  var ii={background:"none",border:"none",borderBottom:"2px solid "+INK,outline:"none",fontFamily:font,color:INK,width:"100%"};
  useEffect(()=>{if(inputRef.current)inputRef.current.focus();},[step]);

  function addTag(t,fromSuggestion=false){
    var c=t.trim().toLowerCase().replace(/[^a-z0-9&\- ]/g,"").trim();
    if(!c||tags.includes(c)||tags.length>=9)return;
    var next=[...tags,c];
    setTags(next);setTagInput("");
    var isCustom=!fromSuggestion&&!ALL_INTEREST_TAGS.includes(c);
    if(isCustom){setCustomTags(prev=>new Set([...prev,c]));setAvatarCustomBurst(true);setAvatarBurst(true);}
    else{var isGrand=next.length===9;setAvatarGrand(isGrand);setAvatarBurst(true);}
  }

  function removeTag(t){setTags(p=>p.filter(x=>x!==t));setCustomTags(prev=>{var n=new Set(prev);n.delete(t);return n;});setAvatarGrand(false);setAvatarBurst(true);}

  var canNext1=name.trim().length>=2&&handle.trim().length>=2,canNext2=tags.length>=5;
  function finish(){var hh=handle.trim().startsWith("@")?handle.trim():"@"+handle.trim();onComplete({id:"user_local",displayName:name.trim(),handle:hh,tags,customTags:Array.from(customTags),status:status.trim(),pulseCheck,statusPresets:[...DEFAULT_PRESETS]});}

  return(<div style={{flex:1,display:"flex",flexDirection:"column",background:BG}}>
    <div style={{padding:"32px 28px 0"}}><div style={{fontWeight:900,fontSize:28,letterSpacing:4,textTransform:"uppercase",color:INK,marginBottom:6}}>Circle</div><div style={{fontSize:10,color:INK_MID,letterSpacing:2,fontWeight:700,marginBottom:28}}>STEP {step} OF 3</div><div style={{height:2,background:INK_LIGHT,marginBottom:32,position:"relative"}}><div style={{position:"absolute",top:0,left:0,height:"100%",background:INK,width:((step/3)*100)+"%",transition:"width 0.4s"}}/></div></div>
    {step===1&&(<div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 28px 32px",gap:28,overflowY:"auto"}}>
      <div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:6}}>Who are you?</div><div style={{fontSize:13,color:INK_MID,lineHeight:1.7}}>No photo required. Your identity here is your name, your handle, and what you care about.</div></div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"20px 0"}}>
        <UserAvatar tags={tags} size={72} color={INK} bg={BG} burst={avatarBurst} grand={avatarGrand} customBurst={avatarCustomBurst} onBurstEnd={()=>{setAvatarBurst(false);setAvatarGrand(false);setAvatarCustomBurst(false);}}/>
        <div style={{fontSize:9,color:INK_LIGHT,letterSpacing:1.5,textTransform:"uppercase"}}>Your avatar — shaped by your interests</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        <div><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:8}}>Display name</div><input ref={inputRef} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" maxLength={32} style={{...ii,fontSize:20,fontWeight:900,padding:"6px 0"}} onKeyDown={e=>{if(e.key==="Enter"&&canNext1)setStep(2);}}/></div>
        <div><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:8}}>Handle</div><input value={handle} onChange={e=>setHandle(e.target.value.replace(/\s/g,""))} placeholder="@yourhandle" maxLength={24} style={{...ii,fontSize:16,fontWeight:700,padding:"6px 0",color:INK_MID}} onKeyDown={e=>{if(e.key==="Enter"&&canNext1)setStep(2);}}/><div style={{fontSize:9,color:INK_LIGHT,marginTop:6}}>This is how others see you in circles.</div></div>
      </div>
      <button onClick={()=>{if(canNext1)setStep(2);}} style={{...bb,background:canNext1?INK:"none",color:canNext1?BG:INK_LIGHT,border:"2px solid "+(canNext1?INK:INK_LIGHT),marginTop:"auto"}}>Continue →</button>
    </div>)}
    {step===2&&(<div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 28px 32px",gap:20,overflowY:"auto"}}>
      <div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:6}}>What are you into?</div><div style={{fontSize:13,color:INK_MID,lineHeight:1.7}}>Pick 5–9 interests. These shape your avatar, your pulse signal, and what circles find you.</div></div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"12px 0"}}>
        <UserAvatar tags={tags} size={64} color={INK} bg={BG} burst={avatarBurst} grand={avatarGrand} customBurst={avatarCustomBurst} onBurstEnd={()=>{setAvatarBurst(false);setAvatarGrand(false);setAvatarCustomBurst(false);}}/>
        <div style={{fontSize:9,color:INK_LIGHT,letterSpacing:1,textTransform:"uppercase"}}>{tags.length} / 9 selected</div>
      </div>
      <div style={{minHeight:56,display:"flex",flexWrap:"wrap",gap:8,alignItems:"flex-start"}}>
        {tags.length===0&&<span style={{fontSize:10,color:INK_LIGHT,fontStyle:"italic"}}>Tap interests below to add them</span>}
        {tags.map(t=>(<div key={t} onClick={()=>removeTag(t)} style={{display:"inline-flex",alignItems:"center",gap:5,background:INK,color:BG,padding:"5px 10px",fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",position:"relative"}}>
          <span>{t}</span><span style={{opacity:.5}}>×</span>
          {customTags.has(t)&&<RoughUnderline width={t.length*6.5} color={BG}/>}
        </div>))}
      </div>
      {tags.length<9&&(<div style={{display:"flex",gap:8,alignItems:"center"}}><input ref={step===2?inputRef:null} value={tagInput} onChange={e=>setTagInput(e.target.value.toLowerCase())} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();addTag(tagInput,false);}}} placeholder="or type your own..." maxLength={24} style={{...ii,fontSize:13,padding:"6px 0",flex:1}}/><button onClick={()=>addTag(tagInput,false)} style={{background:tagInput.trim()?INK:"none",color:tagInput.trim()?BG:INK_LIGHT,border:"none",padding:"8px 14px",fontFamily:font,fontWeight:700,fontSize:10,cursor:"pointer",letterSpacing:1,minHeight:44}}>+</button></div>)}
      <div><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:10}}>Suggestions</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
          {ALL_INTEREST_TAGS.filter(s=>!tags.includes(s)).map(s=>(<div key={s} onClick={()=>{if(tags.length<9)addTag(s,true);}} style={{border:"1.5px solid "+INK_LIGHT,padding:"5px 10px",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:tags.length<9?"pointer":"default",color:tags.length<9?INK_MID:INK_LIGHT}}>{s}</div>))}
        </div>
      </div>
      <div style={{fontSize:9,color:INK_MID}}>{Math.max(0,5-tags.length)} more needed to continue</div>
      <div style={{display:"flex",gap:10,marginTop:"auto"}}><button onClick={()=>setStep(1)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={()=>{if(canNext2)setStep(3);}} style={{...bb,flex:2,background:canNext2?INK:"none",color:canNext2?BG:INK_LIGHT,border:"2px solid "+(canNext2?INK:INK_LIGHT)}}>Continue →</button></div>
    </div>)}
    {step===3&&(<div style={{flex:1,display:"flex",flexDirection:"column",padding:"0 28px 32px",gap:24,overflowY:"auto"}}>
      <div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:6}}>Right now</div><div style={{fontSize:13,color:INK_MID,lineHeight:1.7}}>A short, optional signal. What are you open to?</div></div>
      <div><input ref={step===3?inputRef:null} value={status} onChange={e=>setStatus(e.target.value.slice(0,50))} placeholder="open to chat, have a seat..." style={{...ii,fontSize:16,fontWeight:600,fontStyle:status?"normal":"italic",padding:"6px 0"}} onKeyDown={e=>{if(e.key==="Enter")finish();}}/><div style={{fontSize:9,color:INK_LIGHT,marginTop:6,textAlign:"right"}}>{status.length}/50</div></div>
      <div style={{border:"2px solid "+INK,padding:"18px 16px",display:"flex",gap:16,alignItems:"flex-start"}}>
        <div onClick={()=>setPulseCheck(p=>!p)} style={{width:36,height:20,borderRadius:10,background:pulseCheck?INK:INK_LIGHT,position:"relative",flexShrink:0,cursor:"pointer",transition:"background 0.15s",marginTop:2}}><div style={{position:"absolute",top:3,left:pulseCheck?18:3,width:14,height:14,borderRadius:"50%",background:BG,transition:"left 0.15s"}}/></div>
        <div><div style={{fontWeight:900,fontSize:13,color:INK,letterSpacing:.5,marginBottom:4}}>Pulse Check</div><div style={{fontSize:11,color:INK_MID,lineHeight:1.7}}>{pulseCheck?"Active. When you're near someone open to connection, both of you will feel it.":"Off. Enable to be discovered by people and circles nearby in real time."}</div></div>
      </div>
      <div style={{background:BG_OUTER,padding:"14px 16px",fontSize:10,color:INK_MID,lineHeight:1.8}}><span style={{fontWeight:700,color:INK}}>Pulse Check</span> uses approximate location only. You control when it's on.</div>
      <div style={{display:"flex",alignItems:"center",gap:16,padding:"12px 0",borderTop:"1px solid "+INK_LIGHT}}>
        <UserAvatar tags={tags} size={52} color={INK} bg={BG}/>
        <div><div style={{fontWeight:900,fontSize:16,color:INK,letterSpacing:1}}>{name||"You"}</div><div style={{fontSize:10,color:INK_MID,marginTop:2}}>{handle.startsWith("@")?handle:"@"+handle}</div><div style={{fontSize:10,color:INK_MID,marginTop:2,fontStyle:"italic"}}>{status||"no status set"}</div></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:"auto"}}><button onClick={()=>setStep(2)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={finish} style={{...bb,flex:2,background:INK,color:BG}}>Enter Circle →</button></div>
    </div>)}
  </div>);
}

function CreateFlow({onComplete,onCancel}){
  var [step,setStep]=useState(1),[name,setName]=useState(""),[ctype,setCtype]=useState(null),[pulseable,setPulseable]=useState(true),[tags,setTags]=useState([]),[tagInput,setTagInput]=useState(""),[govMode,setGovMode]=useState("admin"),[adminsInput,setAdminsInput]=useState(""),[passphrase,setPassphrase]=useState(""),[confirming,setConfirming]=useState(0);
  var inputRef=useRef(null),confirmRaf=useRef(null);
  useEffect(()=>{if(inputRef.current)inputRef.current.focus();},[step]);
  function addTag(t){var c=t.trim().toLowerCase().replace(/[^a-z0-9&\- ]/g,"").trim();if(!c||tags.includes(c)||tags.length>=6)return;setTags(p=>[...p,c]);setTagInput("");}
  function removeTag(t){setTags(p=>p.filter(x=>x!==t));}
  function handleCreate(){if(!canCreate)return;var start=Date.now();function anim(){var p=Math.min(1,(Date.now()-start)/500);setConfirming(p);if(p<1){confirmRaf.current=requestAnimationFrame(anim);}else{onComplete({name:name.trim(),type:ctype,pulseable,tags,passphrase:passphrase.trim(),governance:{mode:govMode,admins:adminsInput.split(",").map(s=>s.trim()).filter(Boolean)}});}}confirmRaf.current=requestAnimationFrame(anim);}
  var canNext1=name.trim().length>=2,canNext2=ctype!==null,canNext3=tags.length>=3,canCreate=canNext3;
  var totalSteps=ctype==="hidden"?5:4;
  var typeOptions=[{key:"open",label:"Open",desc:"Anyone nearby can join"},{key:"closed",label:"Closed",desc:"Invite only"},{key:"hidden",label:"Hidden",desc:"Discovered via Pulse"}];
  var bb={fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",padding:"12px 0",border:"none"};
  var ii={background:"none",border:"none",borderBottom:"2px solid "+INK,outline:"none",fontFamily:font,color:INK,width:"100%"};
  return(<div style={{flex:1,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"14px 18px",borderBottom:"1.5px solid "+INK,display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:52}}><button onClick={onCancel} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:INK,minWidth:44,minHeight:44,display:"flex",alignItems:"center",padding:0}}>←</button><span style={{fontWeight:900,fontSize:11,letterSpacing:2,textTransform:"uppercase",color:INK}}>New Circle</span><span style={{fontSize:10,fontWeight:700,color:INK_MID,letterSpacing:1,minWidth:44,textAlign:"right"}}>{step} / {totalSteps}</span></div>
    {step===1&&(<div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 28px",gap:32}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Name your circle</div><input ref={inputRef} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&canNext1)setStep(2);}} placeholder="WHAT IS IT CALLED" maxLength={32} style={{...ii,fontSize:22,fontWeight:900,letterSpacing:1,padding:"8px 0",textTransform:"uppercase"}}/><button onClick={()=>{if(canNext1)setStep(2);}} style={{...bb,background:canNext1?INK:"none",color:canNext1?BG:INK_LIGHT,border:"2px solid "+(canNext1?INK:INK_LIGHT)}}>Continue →</button></div>)}
    {step===2&&(<div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 28px",gap:14}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:4}}>What kind of circle?</div>{typeOptions.map(opt=>{var sel=ctype===opt.key;return(<div key={opt.key}><div onClick={()=>{setCtype(opt.key);if(opt.key!=="hidden")setPulseable(true);}} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",border:"2px solid "+(sel?INK:INK_LIGHT),cursor:"pointer",background:sel?INK:BG}}><svg width="22" height="22" viewBox="0 0 22 22">{opt.key==="open"&&<circle cx="11" cy="11" r="9" fill={sel?BG:INK}/>}{opt.key==="closed"&&<circle cx="11" cy="11" r="8" fill="none" stroke={sel?BG:INK} strokeWidth="2"/>}{opt.key==="hidden"&&<g>{[-3,-1,1,3].map(ii2=>{var hw=Math.sqrt(Math.max(0,81-ii2*ii2*4));return <line key={ii2} x1={11-hw} y1={11+ii2*1.8} x2={11+hw} y2={11+ii2*1.8} stroke={sel?BG:INK} strokeWidth="0.8" opacity="0.5"/>;})}<circle cx="11" cy="11" r="8" fill="none" stroke={sel?BG:INK} strokeWidth="1.5" strokeDasharray="3 2"/></g>}</svg><div><div style={{fontWeight:900,fontSize:13,color:sel?BG:INK,letterSpacing:.5}}>{opt.label}</div><div style={{fontSize:10,color:sel?INK_LIGHT:INK_MID,marginTop:2}}>{opt.desc}</div></div></div>{opt.key==="hidden"&&sel&&(<div onClick={()=>setPulseable(p=>!p)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderLeft:"2px solid "+INK,borderRight:"2px solid "+INK,borderBottom:"2px solid "+INK,cursor:"pointer",background:BG}}><div style={{width:32,height:18,borderRadius:9,background:pulseable?INK:INK_LIGHT,position:"relative",flexShrink:0,transition:"background 0.15s"}}><div style={{position:"absolute",top:3,left:pulseable?16:3,width:12,height:12,borderRadius:"50%",background:BG,transition:"left 0.15s"}}/></div><div><div style={{fontSize:11,fontWeight:700,color:INK,letterSpacing:.5}}>Discoverable via Pulse</div><div style={{fontSize:9,color:INK_MID,marginTop:1}}>{pulseable?"Others can sense this circle nearby":"Invite only — completely off the map"}</div></div></div>)}</div>);})} <div style={{display:"flex",gap:10,marginTop:8}}><button onClick={()=>setStep(1)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={()=>{if(canNext2)setStep(3);}} style={{...bb,flex:2,background:canNext2?INK:"none",color:canNext2?BG:INK_LIGHT,border:"2px solid "+(canNext2?INK:INK_LIGHT)}}>Continue →</button></div></div>)}
    {step===3&&(<div style={{flex:1,display:"flex",flexDirection:"column",padding:"32px 28px",gap:20}}><div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Tag it</div><div style={{fontSize:10,color:INK_MID,marginTop:6,lineHeight:1.7}}>Min 3, max 6.</div></div><div style={{minHeight:80,display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",padding:"12px 0"}}>{tags.map(t=><FloatingTag key={t} tag={t} confirming={confirming} onRemove={removeTag}/>)}{tags.length===0&&<span style={{fontSize:10,color:INK_LIGHT,fontStyle:"italic"}}>Tags will float here</span>}</div>{tags.length<6&&(<div style={{display:"flex",gap:8,alignItems:"center"}}><input ref={inputRef} value={tagInput} onChange={e=>setTagInput(e.target.value.toLowerCase())} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();addTag(tagInput);}}} placeholder="add a tag..." maxLength={24} style={{...ii,fontSize:14,padding:"6px 0",flex:1}}/><button onClick={()=>addTag(tagInput)} style={{background:INK,color:BG,border:"none",padding:"8px 14px",fontFamily:font,fontWeight:700,fontSize:10,cursor:"pointer",letterSpacing:1,minHeight:44}}>+</button></div>)}<div><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:8}}>Suggestions</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{TAG_SUGGESTIONS.filter(s=>!tags.includes(s)).slice(0,12).map(s=><div key={s} onClick={()=>addTag(s)} style={{border:"1px dashed "+INK_LIGHT,padding:"3px 9px",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",color:INK_MID}}>{s}</div>)}</div></div><div style={{fontSize:9,color:INK_MID}}>{tags.length}/6 · {Math.max(0,3-tags.length)} more needed</div><div style={{display:"flex",gap:10,marginTop:"auto"}}><button onClick={()=>setStep(2)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={()=>{if(canNext3)setStep(4);}} style={{...bb,flex:2,background:canNext3?INK:"none",color:canNext3?BG:INK_LIGHT,border:"2px solid "+(canNext3?INK:INK_LIGHT)}}>Continue →</button></div></div>)}
    {step===4&&(<div style={{flex:1,display:"flex",flexDirection:"column",padding:"32px 28px",gap:22}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Governance</div><div style={{display:"flex",border:"2px solid "+INK}}>{[{key:"admin",label:"Admin Rule"},{key:"democracy",label:"Democracy"}].map((opt,i)=>{var sel=govMode===opt.key;return(<button key={opt.key} onClick={()=>setGovMode(opt.key)} style={{flex:1,padding:"12px 0",background:sel?INK:BG,color:sel?BG:INK,border:"none",borderRight:i===0?"2px solid "+INK:"none",fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer"}}>{opt.key==="democracy"?<span style={{display:"inline-flex",alignItems:"center",gap:6}}><FistIcon size={11} color={sel?BG:INK}/> Democracy</span>:"Admin Rule"}</button>);})}</div><div style={{fontSize:10,color:INK_MID,lineHeight:1.7}}>{govMode==="admin"?"Admins approve requests.":"Members vote. Majority rules."}</div><input value={adminsInput} onChange={e=>setAdminsInput(e.target.value)} placeholder="@handle, @handle..." style={{...ii,fontSize:13,padding:"6px 0"}}/><div style={{display:"flex",gap:10,marginTop:"auto"}}><button onClick={()=>setStep(3)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={()=>setStep(ctype==="hidden"?5:99)} style={{...bb,flex:2,background:INK,color:BG}}>{ctype==="hidden"?"Continue →":"Plant Circle"}</button></div></div>)}
    {step===5&&ctype==="hidden"&&(<div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 28px",gap:28}}><div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Set the passphrase</div><div style={{fontSize:10,color:INK_MID,marginTop:6,lineHeight:1.7}}>Optional. A secret phrase to enter.</div></div><input ref={inputRef} value={passphrase} onChange={e=>setPassphrase(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleCreate();}} placeholder="velvet fog..." maxLength={48} style={{...ii,fontSize:18,fontWeight:700,fontStyle:"italic",padding:"8px 0"}}/><div style={{display:"flex",gap:10}}><button onClick={()=>setStep(4)} style={{...bb,flex:1,background:"none",border:"2px solid "+INK_LIGHT,color:INK_MID}}>← Back</button><button onClick={handleCreate} style={{...bb,flex:2,background:INK,color:BG}}>Plant Circle</button></div></div>)}
    {step===99&&handleCreate()}
  </div>);
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
// Active tab: icon replaced by animated label. Inactive tabs: icon only.
function BottomNav({tab, setTab, currentUser}) {
  var tabs = ["map","circles","pulse","profile"];
  var [animatingTab, setAnimatingTab] = useState(tab);
  var [labelOpacity, setLabelOpacity] = useState(1);
  var rafRef = useRef(null);

  useEffect(() => {
    // Fade out, swap, fade in
    setLabelOpacity(0);
    var timer = setTimeout(() => {
      setAnimatingTab(tab);
      var start = performance.now();
      function fadeIn() {
        var p = Math.min(1, (performance.now() - start) / 180);
        setLabelOpacity(p);
        if (p < 1) rafRef.current = requestAnimationFrame(fadeIn);
      }
      rafRef.current = requestAnimationFrame(fadeIn);
    }, 90);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [tab]);

  function getIcon(name, active) {
    var color = active ? BG : INK_MID;
    if (name === "map") return (
      <svg width={20} height={20} viewBox="0 0 20 20">
        <circle cx={10} cy={10} r={8} fill={active ? BG : INK}/>
        <circle cx={10} cy={10} r={3} fill={active ? INK : BG}/>
      </svg>
    );
    if (name === "circles") return <span style={{fontSize:18,color,lineHeight:1}}>◈</span>;
    if (name === "pulse") return <span style={{fontSize:18,color,lineHeight:1}}>◉</span>;
    if (name === "profile") return <StaticAvatar tags={currentUser?.tags||[]} size={26} color={color} bg={active?INK:BG}/>;
    return null;
  }

  return (
    <div style={{borderTop:"2px solid "+INK,display:"flex",background:BG}}>
      {tabs.map((name, i) => {
        var active = tab === name;
        return (
          <button key={name} onClick={() => setTab(name)} style={{
            flex:1, minHeight:62, background:active?INK:BG,
            border:"none",
            borderRight: i < 3 ? "1px solid " + (active ? INK : INK_LIGHT) : "none",
            fontFamily:font, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"background 0.18s",
            position:"relative", overflow:"hidden",
          }}>
            {active ? (
              <span style={{
                fontSize:9, fontWeight:900, letterSpacing:2.5,
                textTransform:"uppercase", color:BG,
                opacity:animatingTab===name?labelOpacity:0,
                transition:"opacity 0.09s",
                userSelect:"none",
              }}>
                {name}
              </span>
            ) : (
              getIcon(name, false)
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function App(){
  var [currentUser,setCurrentUser]=useState(null);
  var [tab,setTab]=useState("map");
  var [radius,setRadius]=useState(null);
  var [drawPhase,setDrawPhase]=useState("idle");
  var [drawPath,setDrawPath]=useState([]);
  var [liveRadius,setLiveRadius]=useState(0);
  var [circleScale,setCircleScale]=useState(1);
  var [selectedChat,setSelectedChat]=useState(null);
  var [joinTarget,setJoinTarget]=useState(null);
  var [msgInput,setMsgInput]=useState("");
  var [allChats,setAllChats]=useState(INIT_CHATS);
  var [joinedIds,setJoinedIds]=useState(new Set());
  var [revealedIds,setRevealedIds]=useState(new Set());
  var [revealProgress,setRevealProgress]=useState({});
  var [breathe,setBreathe]=useState(1);
  var [holdProgress,setHoldProgress]=useState(0);
  var [pulseState,setPulseState]=useState("idle");
  var [rippleProgress,setRippleProgress]=useState(0);
  var [returnProgress,setReturnProgress]=useState(0);
  var [touchPt,setTouchPt]=useState({x:64,y:64});
  var [plantHold,setPlantHold]=useState(0);
  var [plantPos,setPlantPos]=useState(null);
  var [plantStamp,setPlantStamp]=useState(0);
  var [creating,setCreating]=useState(false);
  var [pendingPos,setPendingPos]=useState(null);
  var [pulseFired,setPulseFired]=useState(false);
  var [pulseParticles,setPulseParticles]=useState(()=>genPulseParticles(72));
  var [outwardParticles,setOutwardParticles]=useState(()=>genOutwardParticles(55));
  var [inwardParticles,setInwardParticles]=useState(()=>genInwardParticles(45));
  var [plantParticles,setPlantParticles]=useState(()=>genPlantParticles(22));
  var [nearbyUser,setNearbyUser]=useState(null);
  var [nearbyUserProgress,setNearbyUserProgress]=useState(0);
  var [nearbyUserCoalesce,setNearbyUserCoalesce]=useState(null);
  var [showPersonCard,setShowPersonCard]=useState(false);
  var [pulseChatUser,setPulseChatUser]=useState(null);
  var [spontaneousTarget,setSpontaneousTarget]=useState(null);
  var [nearbyCircle,setNearbyCircle]=useState(null);
  var [nearbyCircleProgress,setNearbyCircleProgress]=useState(0);
  var [nearbyCircleCoalesce,setNearbyCircleCoalesce]=useState(null);
  var [showCircleCard,setShowCircleCard]=useState(false);
  var [mapDimProgress,setMapDimProgress]=useState(0);
  var [interestMatchCircle,setInterestMatchCircle]=useState(null);
  var [interestMatchTags,setInterestMatchTags]=useState([]);
  var [highlightedCircleId,setHighlightedCircleId]=useState(null);
  var [bumpActive,setBumpActive]=useState(false);
  var [bumpPulse,setBumpPulse]=useState(1);

  var bumpRaf=useRef(null),bumpT=useRef(0);
  var nearbyPersonRaf=useRef(null),nearbyPersonStart=useRef(null);
  var nearbyCircleRaf=useRef(null),nearbyCircleStart=useRef(null);
  var NEARBY_DUR=4200;
  var svgRef=useRef(null),dragging=useRef(false);
  var plantHoldActive=useRef(false),plantHoldStart=useRef(null);
  var plantHoldProgressRef=useRef(0),plantStampProgressRef=useRef(0),plantPosRef=useRef(null);
  var pulseHoldStart=useRef(null),pulseHoldRaf=useRef(null);
  var rippleRaf=useRef(null),coolingTimer=useRef(null);
  var plantRaf=useRef(null),stampRaf=useRef(null),breatheRaf=useRef(null);
  var revealRafs=useRef({});
  var bumpTimer=useRef(null),interestTimer=useRef(null);
  const CX=175,CY=210,MIN_R=70,MAX_R=250,BTN_R=64,STAGE_R=130;

  useEffect(()=>{plantPosRef.current=plantPos;},[plantPos]);
  useEffect(()=>{plantStampProgressRef.current=plantStamp;},[plantStamp]);
  useEffect(()=>{plantHoldProgressRef.current=plantHold;},[plantHold]);
  useEffect(()=>{var t=0;function loop(){t+=.025;setBreathe(1+.15*Math.sin(t));breatheRaf.current=requestAnimationFrame(loop);}breatheRaf.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(breatheRaf.current);},[]);
  useEffect(()=>{if(!bumpActive){cancelAnimationFrame(bumpRaf.current);setBumpPulse(1);return;}function loop(){bumpT.current+=0.04;setBumpPulse(1+0.3*Math.sin(bumpT.current));bumpRaf.current=requestAnimationFrame(loop);}bumpRaf.current=requestAnimationFrame(loop);return()=>cancelAnimationFrame(bumpRaf.current);},[bumpActive]);

  var pulseCheckKey=useRef(0);
  useEffect(()=>{
    setBumpActive(false);setInterestMatchCircle(null);clearTimeout(bumpTimer.current);clearTimeout(interestTimer.current);
    cancelAnimationFrame(nearbyPersonRaf.current);cancelAnimationFrame(nearbyCircleRaf.current);
    setNearbyUser(null);setNearbyUserProgress(0);setNearbyUserCoalesce(null);setShowPersonCard(false);
    setNearbyCircle(null);setNearbyCircleProgress(0);setNearbyCircleCoalesce(null);setShowCircleCard(false);
    setMapDimProgress(0);
    if(!currentUser?.pulseCheck)return;
    var key=++pulseCheckKey.current;
    bumpTimer.current=setTimeout(()=>{if(pulseCheckKey.current!==key)return;setBumpActive(true);},3000);
    interestTimer.current=setTimeout(()=>{
      if(pulseCheckKey.current!==key)return;
      var userTags=currentUser.tags||[];
      var best=INIT_CHATS.filter(c=>c.type!=="hidden"&&!joinedIds.has(c.id)).map(c=>({c,shared:c.tags.filter(t=>userTags.includes(t))})).filter(x=>x.shared.length>0).sort((a,b)=>b.shared.length-a.shared.length)[0];
      if(best){setInterestMatchCircle(best.c);setInterestMatchTags(best.shared);}
    },6000);
    return()=>{clearTimeout(bumpTimer.current);clearTimeout(interestTimer.current);};
  },[currentUser?.pulseCheck]);

  function revealHiddenCircle(id){
    if(revealedIds.has(id))return;
    setRevealedIds(prev=>new Set([...prev,id]));
    var start=performance.now(),dur=1800;
    function tick(){var p=Math.min(1,(performance.now()-start)/dur);setRevealProgress(prev=>({...prev,[id]:p}));if(p<1){revealRafs.current[id]=requestAnimationFrame(tick);}}
    revealRafs.current[id]=requestAnimationFrame(tick);
  }

  function runCoalesceAnim(tx,ty,setProgress,setCoalesce,setCard,rafRef,startRef,onTick){
    setProgress(0);setMapDimProgress(0);setCard(false);
    setCoalesce(genCoalesceParticles(65,tx,ty));
    startRef.current=performance.now();
    function tick(){
      var p=Math.min(1,(performance.now()-startRef.current)/NEARBY_DUR);
      setProgress(p);if(onTick)onTick(p);
      var dim=p<0.55?(p/0.55)*0.46:p<0.78?0.46:Math.max(0,0.46*(1-(p-0.78)/0.08));
      setMapDimProgress(dim);
      if(p<1){rafRef.current=requestAnimationFrame(tick);}else{setMapDimProgress(0);setCard(true);}
    }
    rafRef.current=requestAnimationFrame(tick);
    setTab("map");
  }

  function simulatePersonPulse(){
    if(nearbyUser||nearbyCircle)return;
    setBumpActive(false);setInterestMatchCircle(null);
    var userTags=currentUser?.tags||[];
    var sorted=[...NEARBY_USERS].sort((a,b)=>b.tags.filter(t=>userTags.includes(t)).length-a.tags.filter(t=>userTags.includes(t)).length);
    var picked=sorted[Math.floor(Math.random()*Math.min(2,sorted.length))];
    var tx=CX+picked.r*Math.cos((picked.angle*Math.PI)/180),ty=CY+picked.r*Math.sin((picked.angle*Math.PI)/180);
    setNearbyUser(picked);
    runCoalesceAnim(tx,ty,setNearbyUserProgress,setNearbyUserCoalesce,setShowPersonCard,nearbyPersonRaf,nearbyPersonStart);
  }

  function simulateCirclePulse(){
    if(nearbyUser||nearbyCircle)return;
    setBumpActive(false);setInterestMatchCircle(null);
    var existingIds=new Set(allChats.map(c=>c.id));
    var userTags=currentUser?.tags||[];
    var available=[...PULSE_CIRCLES].filter(c=>!existingIds.has(c.id)).sort((a,b)=>b.tags.filter(t=>userTags.includes(t)).length-a.tags.filter(t=>userTags.includes(t)).length);
    if(!available.length)return;
    var picked=available[0];
    var nc=makeCircle({id:picked.id,ownerId:"user_unknown",name:picked.name,type:"hidden",pulseable:true,passphrase:picked.passphrase||"",dist:parseFloat(((picked.r/MAX_R)*2).toFixed(1)),members:picked.members,angle:picked.angle,r:picked.r,msgs:[],tags:picked.tags,governance:picked.governance,isOwn:false,discovered:true});
    setAllChats(prev=>[...prev,nc]);
    setRevealedIds(prev=>new Set([...prev,picked.id]));
    setRevealProgress(prev=>({...prev,[picked.id]:0}));
    var tx=CX+picked.r*Math.cos((picked.angle*Math.PI)/180),ty=CY+picked.r*Math.sin((picked.angle*Math.PI)/180);
    setNearbyCircle(nc);
    runCoalesceAnim(tx,ty,setNearbyCircleProgress,setNearbyCircleCoalesce,setShowCircleCard,nearbyCircleRaf,nearbyCircleStart,(p)=>setRevealProgress(prev=>({...prev,[picked.id]:p})));
  }

  function dismissPerson(){setShowPersonCard(false);setNearbyUser(null);setNearbyUserProgress(0);setNearbyUserCoalesce(null);setMapDimProgress(0);cancelAnimationFrame(nearbyPersonRaf.current);}
  function dismissCircle(){setShowCircleCard(false);setNearbyCircle(null);setNearbyCircleProgress(0);setNearbyCircleCoalesce(null);setMapDimProgress(0);cancelAnimationFrame(nearbyCircleRaf.current);}
  function openPulseChat(user){setShowPersonCard(false);setPulseChatUser(user);}
  function closePulseChat(){setPulseChatUser(null);setNearbyUser(null);}
  function handleConnect(){setPulseChatUser(null);setNearbyUser(null);}
  function openSpontaneousSheet(user,sharedTags){setPulseChatUser(null);setSpontaneousTarget({user,sharedTags});}
  function handleSpontaneousCreate(data){
    var nc=makeCircle({ownerId:currentUser?.id||"user_local",name:data.name,type:"closed",pulseable:false,passphrase:"",dist:0.1,members:2,angle:-20,r:90,tags:data.tags,governance:{mode:"admin",admins:[]},isOwn:true});
    setAllChats(p=>[...p,nc]);setJoinedIds(p=>new Set([...p,nc.id]));
    setSpontaneousTarget(null);setSelectedChat(nc);
  }
  function openCircleJoin(circle){setShowCircleCard(false);setJoinTarget(circle);}
  function goToInterestMatch(circle){
    setInterestMatchCircle(null);
    setHighlightedCircleId(circle.id);
    setTab("map");
    setTimeout(()=>setHighlightedCircleId(null),4000);
  }
  function updateStatus(s){setCurrentUser(u=>({...u,status:s}));}
  function updatePresets(p){setCurrentUser(u=>({...u,statusPresets:p}));}

  const firePulse=useCallback(()=>{
    cancelAnimationFrame(pulseHoldRaf.current);
    setPulseParticles(genPulseParticles(72));setOutwardParticles(genOutwardParticles(55));
    setHoldProgress(1);setPulseState("fired");setReturnProgress(0);setPulseFired(true);setBumpActive(false);
    setAllChats(chats=>{chats.forEach(c=>{if(c.type==="hidden"&&c.pulseable!==false)revealHiddenCircle(c.id);});return chats;});
    var outDur=2200,retDur=1100,silMs=300,outStart=performance.now();
    function outTick(){var p=Math.min(1,(performance.now()-outStart)/outDur);setRippleProgress(p);if(p<1){rippleRaf.current=requestAnimationFrame(outTick);}else{setPulseFired(false);setInwardParticles(genInwardParticles(45));var retStart=performance.now()+silMs;function retTick(){var now=performance.now();if(now<retStart){rippleRaf.current=requestAnimationFrame(retTick);return;}var rp=Math.min(1,(now-retStart)/retDur);setReturnProgress(rp);if(rp<1){rippleRaf.current=requestAnimationFrame(retTick);}else{setRippleProgress(0);setReturnProgress(0);setHoldProgress(0);setPulseState("cooling");coolingTimer.current=setTimeout(()=>setPulseState("idle"),2500);}}rippleRaf.current=requestAnimationFrame(retTick);}}
    rippleRaf.current=requestAnimationFrame(outTick);
  },[]);

  const startPulseHold=useCallback((e)=>{if(pulseState!=="idle")return;var el=e.currentTarget.getBoundingClientRect();var cx=e.touches?e.touches[0].clientX:e.clientX,cy=e.touches?e.touches[0].clientY:e.clientY;setTouchPt({x:((cx-el.left)/el.width)*128,y:((cy-el.top)/el.width)*128});pulseHoldStart.current=performance.now();setPulseState("charging");function tick(){var p=Math.min(1,(performance.now()-pulseHoldStart.current)/HOLD_MS);setHoldProgress(p);if(p<1){pulseHoldRaf.current=requestAnimationFrame(tick);}}pulseHoldRaf.current=requestAnimationFrame(tick);},[pulseState]);
  const cancelPulseHold=useCallback(()=>{if(pulseState!=="charging")return;cancelAnimationFrame(pulseHoldRaf.current);var p=Math.min(1,(performance.now()-pulseHoldStart.current)/HOLD_MS);if(p>=.8){firePulse();}else{setPulseState("idle");setHoldProgress(0);}},[pulseState,firePulse]);

  function toSVG(cx,cy){var rect=svgRef.current.getBoundingClientRect();return{x:(cx-rect.left)*(350/rect.width),y:(cy-rect.top)*(420/rect.height)};}
  const onDrawStart=useCallback((e)=>{e.preventDefault();setDrawPhase("drawing");setDrawPath([]);setLiveRadius(0);},[]);
  const onDrawMove=useCallback((e)=>{e.preventDefault();var c=e.touches?e.touches[0]:e;var pos=toSVG(c.clientX,c.clientY);setDrawPath(p=>[...p,pos]);},[]);
  const onDrawEnd=useCallback(()=>{
    setDrawPhase("done");
    setDrawPath(path=>{
      if(path.length>0){
        var avg=path.reduce((sum,p)=>sum+Math.sqrt((p.x-CX)**2+(p.y-CY)**2),0)/path.length;
        var fitted=Math.max(MIN_R,Math.min(MAX_R,avg));
        setRadius(fitted);setCircleScale(0);
        requestAnimationFrame(()=>{var start=performance.now(),dur=400;function tick(){var t=Math.min(1,(performance.now()-start)/dur);setCircleScale(1-Math.pow(1-t,3));if(t<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);});
      }
      return path;
    });
  },[]);
  const startPlantHold=useCallback((pos)=>{setPlantParticles(genPlantParticles(22));plantHoldActive.current=true;plantHoldStart.current=performance.now();plantPosRef.current=pos;setPlantPos(pos);setPlantHold(0);setPlantStamp(0);plantHoldProgressRef.current=0;plantStampProgressRef.current=0;function tick(){if(!plantHoldActive.current)return;var p=Math.min(1,(performance.now()-plantHoldStart.current)/PLANT_MS);plantHoldProgressRef.current=p;setPlantHold(p);if(p<1){plantRaf.current=requestAnimationFrame(tick);}else{plantHoldActive.current=false;var ss=performance.now();function stampTick(){var sp=Math.min(1,(performance.now()-ss)/400);plantStampProgressRef.current=sp;setPlantStamp(sp);if(sp<1){stampRaf.current=requestAnimationFrame(stampTick);}else{var fp=plantPosRef.current;setPendingPos(fp);setCreating(true);setPlantHold(0);setPlantPos(null);setPlantStamp(0);plantHoldProgressRef.current=0;plantStampProgressRef.current=0;}}stampRaf.current=requestAnimationFrame(stampTick);}}plantRaf.current=requestAnimationFrame(tick);},[]);
  const cancelPlantHold=useCallback(()=>{plantHoldActive.current=false;cancelAnimationFrame(plantRaf.current);if(plantStampProgressRef.current===0){setPlantHold(0);setPlantPos(null);plantHoldProgressRef.current=0;}},[]);
  const onMapDown=useCallback((e)=>{if(drawPhase==="idle"){onDrawStart(e);return;}if(drawPhase==="drawing")return;if(drawPhase==="done"){var c=e.touches?e.touches[0]:e;startPlantHold(toSVG(c.clientX,c.clientY));}},[drawPhase,onDrawStart,startPlantHold]);
  const onMapMove=useCallback((e)=>{if(drawPhase==="drawing"){onDrawMove(e);return;}if(dragging.current&&svgRef.current){var c=e.touches?e.touches[0]:e;var rect=svgRef.current.getBoundingClientRect();var dx=(c.clientX-rect.left)*(350/rect.width)-CX,dy=(c.clientY-rect.top)*(420/rect.height)-CY;setRadius(Math.max(MIN_R,Math.min(MAX_R,Math.sqrt(dx*dx+dy*dy))));}},[drawPhase,onDrawMove]);
  const onMapUp=useCallback(()=>{if(drawPhase==="drawing"){onDrawEnd();return;}dragging.current=false;cancelPlantHold();},[drawPhase,onDrawEnd,cancelPlantHold]);
  function resetRadius(){setDrawPhase("idle");setRadius(null);setDrawPath([]);setLiveRadius(0);setCircleScale(1);}
  useEffect(()=>{window.addEventListener("mousemove",onMapMove);window.addEventListener("mouseup",onMapUp);window.addEventListener("touchmove",onMapMove,{passive:false});window.addEventListener("touchend",onMapUp);return()=>{window.removeEventListener("mousemove",onMapMove);window.removeEventListener("mouseup",onMapUp);window.removeEventListener("touchmove",onMapMove);window.removeEventListener("touchend",onMapUp);};},[onMapMove,onMapUp]);

  function handleChatClick(chat){if(chat.type==="hidden"&&!joinedIds.has(chat.id)){setJoinTarget(chat);return;}setSelectedChat(chat);}
  function handleJoined(chat){setJoinedIds(prev=>new Set([...prev,chat.id]));setJoinTarget(null);if(chat.msgs!==undefined)setSelectedChat(chat);}
  function handleRequestSent(chatId,req){setAllChats(prev=>prev.map(c=>c.id===chatId?{...c,pendingRequests:[...(c.pendingRequests||[]),req]}:c));}
  const handleCreateComplete=useCallback((data)=>{
    var pos=pendingPos;
    var nc=makeCircle({ownerId:currentUser?.id||"user_local",name:data.name,type:data.type,pulseable:data.type==="hidden"?data.pulseable:true,passphrase:data.passphrase||"",dist:0,members:1,angle:Math.atan2(pos?pos.y-CY:-1,pos?pos.x-CX:0)*180/Math.PI,r:pos?Math.sqrt((pos.x-CX)**2+(pos.y-CY)**2):80,tags:data.tags,governance:data.governance,isOwn:true});
    setAllChats(p=>[...p,nc]);if(data.type!=="hidden")setJoinedIds(p=>new Set([...p,nc.id]));
    setCreating(false);setPendingPos(null);setTab("map");
  },[pendingPos,currentUser]);
  function sendMsg(){if(!msgInput.trim()||!selectedChat||!currentUser)return;var id=selectedChat.id,nm=makeMessage(msgInput.trim(),currentUser.id,currentUser.handle);setAllChats(prev=>prev.map(c=>c.id===id?{...c,msgs:[...c.msgs,nm]}:c));setMsgInput("");}

  var outerShell={background:BG_OUTER,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",fontFamily:font,userSelect:"none"};
  var phoneCard={background:BG,border:"2.5px solid "+INK,borderRadius:2,width:"100%",maxWidth:390,flex:1,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"4px 4px 0px "+INK+", 7px 7px 0px "+INK_LIGHT,margin:"12px",position:"relative"};

  if(!currentUser)return(<div style={outerShell}><div style={phoneCard}><OnboardingFlow onComplete={u=>setCurrentUser(u)}/></div></div>);

  if(pulseChatUser){return(<div style={outerShell}><div style={{...phoneCard,position:"relative"}}>
    {spontaneousTarget&&<SpontaneousCircleSheet currentUser={currentUser} otherUser={spontaneousTarget.user} sharedTags={spontaneousTarget.sharedTags} onCreate={handleSpontaneousCreate} onDismiss={()=>setSpontaneousTarget(null)}/>}
    <PulseChat currentUser={currentUser} otherUser={pulseChatUser} onStartCircle={openSpontaneousSheet} onConnect={handleConnect} onDismiss={closePulseChat}/>
  </div></div>);}

  if(spontaneousTarget&&!pulseChatUser){return(<div style={outerShell}><div style={{...phoneCard,position:"relative",flex:1,display:"flex",flexDirection:"column"}}>
    <SpontaneousCircleSheet currentUser={currentUser} otherUser={spontaneousTarget.user} sharedTags={spontaneousTarget.sharedTags} onCreate={handleSpontaneousCreate} onDismiss={()=>setSpontaneousTarget(null)}/>
  </div></div>);}

  var visibleChats=radius?allChats.filter(c=>c.r<=radius&&c.type!=="hidden"):[];
  var radiusMiles=radius?((radius/MAX_R)*2).toFixed(1):"—";
  var hasRadius=drawPhase==="done"&&radius!==null;
  var isDrawing=drawPhase==="drawing";
  var isCharging=pulseState==="charging",isFired=pulseState==="fired",showReturn=returnProgress>0;
  var pulseLabel=isCharging?"charging...":(isFired&&!showReturn)?"pulsing...":showReturn?"incoming...":pulseState==="cooling"?"sent":"hold to pulse";
  var eased=1-Math.pow(1-returnProgress,2),retR=STAGE_R*(1-eased)+BTN_R*eased,retOp=returnProgress<.85?.7:((1-returnProgress)/.15)*.7;
  var userCustomTags=new Set(currentUser.customTags||[]);

  if(selectedChat){
    var liveChat=allChats.find(c=>c.id===selectedChat.id)||selectedChat;
    var msgs=liveChat.msgs||[];
    var chatColor=DRAFT_COLORS[selectedChat.id]||INK,isDemo=selectedChat.governance?.mode==="democracy";
    return(<div style={outerShell}><div style={phoneCard}>
      <div style={{padding:"16px 18px",borderBottom:"1.5px solid "+INK,display:"flex",alignItems:"center",gap:14,minHeight:56}}>
        <button onClick={()=>setSelectedChat(null)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:INK,padding:"0 8px 0 0",minWidth:44,minHeight:44,display:"flex",alignItems:"center"}}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:11,height:11,borderRadius:"50%",background:chatColor,flexShrink:0}}/><div><div style={{fontWeight:900,fontSize:15,letterSpacing:1,textTransform:"uppercase",color:INK}}>{selectedChat.name}</div><div style={{fontSize:10,color:INK_MID,letterSpacing:.8,marginTop:2,display:"flex",alignItems:"center",gap:4}}>{selectedChat.type.toUpperCase()} · {selectedChat.dist}mi{selectedChat.members?" · "+selectedChat.members:""}{selectedChat.governance&&<span style={{display:"inline-flex",alignItems:"center",gap:3}}> · {isDemo?<><FistIcon size={10}/> democracy</>:"◈ admin"}</span>}</div></div></div>
      </div>
      {selectedChat.tags&&selectedChat.tags.length>0&&(<div style={{padding:"8px 18px",borderBottom:"1px solid "+INK_LIGHT,display:"flex",gap:6,flexWrap:"wrap"}}>{selectedChat.tags.map(t=><span key={t} style={{fontSize:8,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",border:"1px solid "+INK_LIGHT,padding:"2px 7px",color:INK_MID}}>{t}</span>)}</div>)}
      <div style={{flex:1,padding:"16px 18px",overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(<div key={m.id||i} style={{paddingBottom:10,borderBottom:"1px solid "+INK_LIGHT}}><div style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:m.senderId===currentUser.id?INK:INK_MID,marginBottom:3}}>{m.senderId===currentUser.id?"You":m.senderHandle}</div><div style={{fontSize:14,lineHeight:1.65,color:INK}}>{m.text}</div></div>))}
        {msgs.length===0&&<div style={{color:INK_MID,fontSize:13,fontStyle:"italic"}}>No messages yet. Say something.</div>}
      </div>
      <div style={{padding:"12px 18px",borderTop:"1.5px solid "+INK,display:"flex",gap:10,alignItems:"center"}}>
        <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendMsg();}} placeholder="Write something..." style={{flex:1,background:"none",border:"none",borderBottom:"1.5px solid "+INK,outline:"none",fontFamily:font,fontSize:15,color:INK,padding:"6px 0"}}/>
        <button onClick={sendMsg} style={{background:INK,color:BG,border:"none",padding:"10px 16px",fontFamily:font,fontWeight:700,fontSize:10,cursor:"pointer",letterSpacing:1.5,minHeight:44}}>SEND</button>
      </div>
    </div></div>);
  }

  if(creating)return(<div style={outerShell}><div style={phoneCard}><CreateFlow onComplete={handleCreateComplete} onCancel={()=>{setCreating(false);setPendingPos(null);}}/></div></div>);

  // ── Reset (Redraw) icon button — SVG circular arrow ────────────────────────
  function ResetIcon() {
    return (
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
        <path d="M 14.5 9 A 5.5 5.5 0 1 1 11 3.9" stroke={INK} strokeWidth="1.8" strokeLinecap="round"/>
        <polyline points="10.5,2.5 11.5,4.2 9.5,4.8" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  }

  return(<div style={outerShell}><div style={phoneCard}>
    {joinTarget&&<JoinModal chat={joinTarget} onClose={()=>setJoinTarget(null)} onJoined={handleJoined} onRequestSent={handleRequestSent}/>}
    {showPersonCard&&nearbyUser&&<PulseCheckCard user={nearbyUser} currentUser={currentUser} onStartPulseChat={openPulseChat} onDismiss={dismissPerson}/>}
    {showCircleCard&&nearbyCircle&&<CirclePulseCard circle={nearbyCircle} currentUser={currentUser} onJoin={openCircleJoin} onDismiss={dismissCircle}/>}

    {/* Header — no tab row, just wordmark + location + bump indicator */}
    <div style={{padding:"14px 18px 11px",borderBottom:"2px solid "+INK,display:"flex",justifyContent:"space-between",alignItems:"center",minHeight:52}}>
      <span style={{fontWeight:900,fontSize:20,letterSpacing:4,textTransform:"uppercase",color:INK}}>Circle</span>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {bumpActive&&(<div onClick={()=>{setTab("pulse");setBumpActive(false);}} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",padding:"3px 8px",border:"1px solid "+INK}}>
          <span style={{fontSize:10,transform:`scale(${bumpPulse})`,display:"inline-block",transition:"transform 0.05s",color:INK}}>◉</span>
          <span style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:INK_MID,textTransform:"uppercase"}}>something nearby</span>
        </div>)}
        {currentUser.pulseCheck&&!bumpActive&&<span style={{fontSize:8,fontWeight:700,letterSpacing:1.5,color:INK_MID,border:"1px solid "+INK_LIGHT,padding:"2px 7px",textTransform:"uppercase"}}>Pulse Check ◉</span>}
        <span style={{fontSize:10,color:INK_MID,letterSpacing:1.5,fontWeight:600}}>HICKORY HILLS</span>
      </div>
    </div>

    {tab==="map"&&(<div style={{flex:1,display:"flex",flexDirection:"column",position:"relative"}}>
      {/* Status tab — taller row, larger text */}
      <StatusTab currentUser={currentUser} onUpdateStatus={updateStatus} onUpdatePresets={updatePresets}/>
      {hasRadius&&!allChats.some(c=>c.isOwn)&&<div style={{padding:"5px 18px",borderBottom:"1px solid "+INK_LIGHT,fontSize:9,color:INK_MID,fontStyle:"italic"}}>Press and hold to plant a new circle</div>}
      <div style={{position:"relative",flex:1,display:"flex",flexDirection:"column"}}>
        <svg ref={svgRef} viewBox="0 0 350 420" width="100%" style={{display:"block",flex:1,touchAction:"none"}}
          onMouseDown={onMapDown} onMouseMove={onMapMove} onMouseUp={onMapUp}
          onTouchStart={onMapDown} onTouchMove={onMapMove} onTouchEnd={onMapUp}>
          <rect x="0" y="0" width="350" height="420" fill={BG}/>
          {[70,130,190,250].map(r=><circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke={INK_LIGHT} strokeWidth="0.8"/>)}
          {drawPhase==="idle"&&(<g><circle cx={CX} cy={CY} r={160} fill="none" stroke={INK_LIGHT} strokeWidth="1.2" strokeDasharray="6 5" opacity="0.5"/><text x={CX} y={CY-172} textAnchor="middle" fontSize="9" fontWeight="700" fill={INK_MID} fontFamily={font} letterSpacing="2">DRAW YOUR CIRCLE</text></g>)}
          {isDrawing&&drawPath.length>1&&<polyline points={drawPath.map(p=>p.x+","+p.y).join(" ")} fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="4 3" opacity="0.7"/>}
          {hasRadius&&(<g transform={`translate(${CX},${CY}) scale(${circleScale}) translate(${-CX},${-CY})`}>
            <path d={wobblyPath(CX,CY,radius,3.7)} fill={INK} fillOpacity="0.04"/>
            <path d={wobblyPath(CX,CY,radius,3.7)} fill="none" stroke="transparent" strokeWidth="28" style={{cursor:"grab"}} onMouseDown={e=>{dragging.current=true;e.preventDefault();e.stopPropagation();}} onTouchStart={e=>{dragging.current=true;e.stopPropagation();}}/>
            <path d={wobblyPath(CX,CY,radius,3.7)} fill="none" stroke={INK} strokeWidth="2" style={{pointerEvents:"none"}}/>
            {[0,90,180,270].map(ang=>{var rad=(ang*Math.PI)/180;var wr=radius+2.2*Math.sin(rad*5+3.7)+.9*Math.sin(rad*11+3.32);var ox=CX+wr*Math.cos(rad-Math.PI/2),oy=CY+wr*Math.sin(rad-Math.PI/2);var nx=Math.cos(rad-Math.PI/2),ny=Math.sin(rad-Math.PI/2);return <line key={ang} x1={ox-nx*7} y1={oy-ny*7} x2={ox+nx*7} y2={oy+ny*7} stroke={INK} strokeWidth="1.5" style={{pointerEvents:"none"}}/>;  })}
            {isFired&&<PulseRipples cx={CX} cy={CY} maxR={radius} progress={rippleProgress}/>}
            {isFired&&pulseFired&&<OutwardBurst progress={rippleProgress} cx={CX} cy={CY} radius={radius} particles={outwardParticles}/>}
            {showReturn&&<InwardRush progress={returnProgress} cx={CX} cy={CY} radius={radius} particles={inwardParticles}/>}
            {/* Inline radius label — anchored to bottom of ring */}
            <RadiusEdgeLabel cx={CX} cy={CY} radius={radius} radiusMiles={radiusMiles} visibleCount={visibleChats.length}/>
          </g>)}
          {plantPos&&<PlantParticles progress={plantHold} px={plantPos.x} py={plantPos.y} stamp={false} particles={plantParticles}/>}
          {plantPos&&plantStamp>0&&<PlantParticles progress={plantStamp} px={plantPos.x} py={plantPos.y} stamp={true} particles={plantParticles}/>}
          {plantPos&&plantHold>0&&(<g style={{pointerEvents:"none"}}><line x1={plantPos.x-8} y1={plantPos.y} x2={plantPos.x+8} y2={plantPos.y} stroke={INK} strokeWidth="1.5" opacity={plantHold}/><line x1={plantPos.x} y1={plantPos.y-8} x2={plantPos.x} y2={plantPos.y+8} stroke={INK} strokeWidth="1.5" opacity={plantHold}/></g>)}
          {nearbyUserCoalesce&&<CoalesceParticles progress={nearbyUserProgress} particles={nearbyUserCoalesce}/>}
          {nearbyCircleCoalesce&&<CoalesceParticles progress={nearbyCircleProgress} particles={nearbyCircleCoalesce}/>}
          {nearbyUser&&<NearbyUserMarker user={nearbyUser} cx={CX} cy={CY} progress={nearbyUserProgress} onClick={()=>setShowPersonCard(true)}/>}
          {nearbyCircle&&<NearbyCircleMarker circle={nearbyCircle} cx={CX} cy={CY} progress={nearbyCircleProgress} onClick={()=>setShowCircleCard(true)}/>}
          {allChats.map(c=><ChatMarker key={c.id} chat={c} cx={CX} cy={CY} onClick={handleChatClick} radius={radius} revealProgress={revealProgress[c.id]||0} highlighted={highlightedCircleId===c.id} interestMatch={interestMatchCircle?.id===c.id} userTags={currentUser.tags||[]} onMatchGo={goToInterestMatch} onMatchDismiss={()=>setInterestMatchCircle(null)}/>)}
          <circle cx={CX} cy={CY} r={7*breathe} fill="none" stroke={INK} strokeWidth="0.8" opacity={0.2} style={{pointerEvents:"none"}}/>
          <circle cx={CX} cy={CY} r={4} fill={INK} style={{pointerEvents:"none"}}/>
          <circle cx={CX} cy={CY} r={1.5} fill={BG} style={{pointerEvents:"none"}}/>
          <text x={CX+8} y={CY+13} fontSize="8" fill={INK_MID} fontFamily={font} letterSpacing="1" fontWeight="600" style={{pointerEvents:"none"}}>{currentUser.handle.toUpperCase()}</text>
        </svg>

        {/* Floating reset button — bottom-right, only when radius is drawn */}
        {hasRadius&&(
          <button onClick={resetRadius} title="Reset radius" style={{
            position:"absolute", bottom:14, right:14,
            width:36, height:36,
            background:BG, border:"1.5px solid "+INK,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", zIndex:40,
            boxShadow:"1px 1px 0 "+INK_LIGHT,
          }}>
            <ResetIcon/>
          </button>
        )}

        {mapDimProgress>0&&<div style={{position:"absolute",inset:0,background:INK,opacity:mapDimProgress,pointerEvents:"none",transition:"opacity 0.08s"}}/>}
      </div>
    </div>)}

    {tab==="circles"&&(<div style={{flex:1,overflowY:"auto"}}>
      {!hasRadius&&<div style={{padding:"32px 18px",color:INK_MID,fontSize:13,fontStyle:"italic",textAlign:"center"}}>Draw your circle on the map first.</div>}
      {hasRadius&&allChats.map(c=>{
        var color=DRAFT_COLORS[c.id]||INK,isHidden=c.type==="hidden",isRevealed=revealedIds.has(c.id),isJoined=joinedIds.has(c.id);
        if(isHidden&&!isRevealed)return null;
        var sharedTags=(currentUser.tags||[]).filter(t=>c.tags.includes(t));
        return(<div key={c.id} onClick={()=>handleChatClick(c)} style={{padding:"15px 18px",borderBottom:"1px solid "+INK_LIGHT,cursor:"pointer",display:"flex",flexDirection:"column",gap:6,minHeight:64,opacity:c.r>radius?.3:1,transition:"opacity 0.2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:11,height:11,borderRadius:"50%",flexShrink:0,background:c.type==="open"?color:"none",border:"2px "+(c.type==="hidden"?"dashed":"solid")+" "+color}}/>
              <div><div style={{fontWeight:900,fontSize:14,color:INK}}>{isHidden&&!isJoined?"???":c.name}</div><div style={{fontSize:10,color:INK_MID,marginTop:2,display:"flex",alignItems:"center",gap:4}}>{c.dist}mi{c.members?" · "+c.members+" members":""}{c.governance&&<span style={{display:"inline-flex",alignItems:"center",gap:2}}> · {c.governance.mode==="democracy"?<FistIcon size={9}/>:"◈"}</span>}</div></div>
            </div>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",border:"1.5px "+(c.type==="hidden"?"dashed":"solid")+" "+color,padding:"4px 8px",color:c.type==="open"?BG:color,background:c.type==="open"?color:"none",flexShrink:0}}>{isHidden?(isJoined?"hidden":"?"):c.type}</div>
          </div>
          {sharedTags.length>0&&!isHidden&&(<div style={{display:"flex",alignItems:"center",gap:5,paddingLeft:21}}><span style={{fontSize:8,color:INK_MID}}>shared:</span>{sharedTags.map(t=><span key={t} style={{fontSize:7.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:INK,color:BG,padding:"1px 6px"}}>{t}</span>)}</div>)}
        </div>);
      })}
    </div>)}

    {tab==="pulse"&&(<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:"32px 24px"}}>
      {bumpActive&&(<div style={{width:"100%",background:INK,color:BG,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <span style={{fontSize:14,transform:`scale(${bumpPulse})`,display:"inline-block"}}>◉</span>
        <div><div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:2}}>Something nearby</div><div style={{fontSize:9,opacity:.7}}>Fire a pulse to find out what it is.</div></div>
      </div>)}
      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>{pulseLabel}</div>
      <div style={{position:"relative",width:BTN_R*2+120,height:BTN_R*2+120,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
        onMouseDown={startPulseHold} onMouseUp={cancelPulseHold} onMouseLeave={cancelPulseHold}
        onTouchStart={e=>{e.preventDefault();startPulseHold(e);}} onTouchEnd={cancelPulseHold}>
        <svg width={BTN_R*2+120} height={BTN_R*2+120} viewBox={(-60)+" "+(-60)+" "+(BTN_R*2+120)+" "+(BTN_R*2+120)} style={{overflow:"visible"}}>
          {isCharging&&<PulseParticles progress={holdProgress} tx={touchPt.x} ty={touchPt.y} fired={false} particles={pulseParticles}/>}
          {isFired&&pulseFired&&<PulseParticles progress={rippleProgress} tx={touchPt.x} ty={touchPt.y} fired={true} particles={pulseParticles}/>}
          {isFired&&!showReturn&&<BleedRings progress={rippleProgress} cx={BTN_R} cy={BTN_R} btnR={BTN_R}/>}
          {showReturn&&<circle cx={BTN_R} cy={BTN_R} r={STAGE_R} fill="none" stroke={INK} strokeWidth="0.5" opacity={0.15}/>}
          {showReturn&&<circle cx={BTN_R} cy={BTN_R} r={Math.max(BTN_R,retR)} fill="none" stroke={INK} strokeWidth="1.5" opacity={retOp} style={{pointerEvents:"none"}}/>}
          <circle cx={BTN_R} cy={BTN_R} r={BTN_R} fill={BG}/>
          <defs><clipPath id="btnClip"><circle cx={BTN_R} cy={BTN_R} r={BTN_R-1}/></clipPath></defs>
          <circle cx={BTN_R} cy={BTN_R} r={BTN_R-1} fill="none" stroke={INK} strokeWidth="2"/>
          <text x={BTN_R} y={BTN_R+5} textAnchor="middle" fontSize="11" fontWeight="900" fill={INK} fontFamily={font} letterSpacing="3" style={{pointerEvents:"none"}}>PULSE</text>
        </svg>
      </div>
      <div style={{width:"100%",borderTop:"1px solid "+INK_LIGHT,paddingTop:20,display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID}}>Pulse Check</div>
        <div style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"14px 16px",border:"2px solid "+(currentUser.pulseCheck?INK:INK_LIGHT),justifyContent:"space-between"}}>
          <div><div style={{fontWeight:700,fontSize:12,color:currentUser.pulseCheck?INK:INK_MID}}>{currentUser.pulseCheck?"Active — you're discoverable":"Off — you're invisible"}</div><div style={{fontSize:9,color:INK_MID,marginTop:3,lineHeight:1.6}}>{currentUser.pulseCheck?"Others with Pulse Check on can find you nearby.":"Enable to connect with people and circles around you."}</div></div>
          <div onClick={()=>setCurrentUser(u=>({...u,pulseCheck:!u.pulseCheck}))} style={{width:36,height:20,borderRadius:10,background:currentUser.pulseCheck?INK:INK_LIGHT,position:"relative",cursor:"pointer",transition:"background 0.15s",flexShrink:0}}><div style={{position:"absolute",top:3,left:currentUser.pulseCheck?18:3,width:14,height:14,borderRadius:"50%",background:BG,transition:"left 0.15s"}}/></div>
        </div>
        <div style={{width:"100%",padding:"14px 16px",border:"1.5px solid "+INK_LIGHT,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{minWidth:0}}><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:INK_MID,marginBottom:3}}>Your Status</div><div style={{fontSize:12,fontStyle:"italic",color:currentUser.status?INK:INK_LIGHT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.status?`"${currentUser.status}"`:"not set"}</div></div>
          <button onClick={()=>setTab("map")} style={{background:"none",border:"1px solid "+INK_LIGHT,color:INK_MID,fontFamily:font,fontWeight:700,fontSize:8,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",padding:"5px 10px",flexShrink:0,minHeight:32}}>Edit →</button>
        </div>
        {currentUser.pulseCheck&&(<div style={{display:"flex",flexDirection:"column",gap:8,width:"100%"}}>
          <button onClick={simulatePersonPulse} disabled={!!(nearbyUser||nearbyCircle)} style={{width:"100%",background:(nearbyUser||nearbyCircle)?"none":INK,color:(nearbyUser||nearbyCircle)?INK_LIGHT:BG,border:"2px solid "+((nearbyUser||nearbyCircle)?INK_LIGHT:INK),padding:"13px 0",fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:(nearbyUser||nearbyCircle)?"default":"pointer"}}>{nearbyUser?"Signal active...":"Simulate Nearby Person →"}</button>
          {(()=>{var allFound=PULSE_CIRCLES.every(c=>allChats.some(x=>x.id===c.id));var busy=!!(nearbyUser||nearbyCircle);return(<button onClick={simulateCirclePulse} disabled={busy||allFound} style={{width:"100%",background:(busy||allFound)?"none":BG,color:(busy||allFound)?INK_LIGHT:INK,border:"2px solid "+((busy||allFound)?INK_LIGHT:INK),padding:"13px 0",fontFamily:font,fontWeight:700,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:(busy||allFound)?"default":"pointer"}}>{nearbyCircle?"Signal active...":allFound?"All nearby circles found":"Simulate Nearby Circle →"}</button>);})()}
        </div>)}
        {pulseState==="idle"&&!bumpActive&&<div style={{fontSize:11,color:INK_MID,textAlign:"center",lineHeight:1.8,maxWidth:260}}>A pulse signals your presence — and may reveal hidden circles nearby.</div>}
      </div>
    </div>)}

    {tab==="profile"&&(<div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{padding:"28px 28px 20px",borderBottom:"1px solid "+INK_LIGHT}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <UserAvatar tags={currentUser.tags} size={56} color={INK} bg={BG}/>
          <div><div style={{fontWeight:900,fontSize:18,letterSpacing:2,textTransform:"uppercase",color:INK}}>{currentUser.displayName}</div><div style={{fontSize:10,color:INK_MID,letterSpacing:1,marginTop:3}}>{currentUser.handle}</div>{currentUser.status&&<div style={{fontSize:11,color:INK_MID,marginTop:4,fontStyle:"italic"}}>"{currentUser.status}"</div>}</div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:16}}>
          {currentUser.tags.map(t=>(<span key={t} style={{fontSize:8,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",border:"1.5px solid "+INK,padding:"3px 8px",color:INK,position:"relative",display:"inline-flex",alignItems:"center"}}>
            {t}{userCustomTags.has(t)&&<RoughUnderline width={t.length*5.5} color={INK}/>}
          </span>))}
        </div>
      </div>
      <div style={{padding:"20px 28px",borderBottom:"1px solid "+INK_LIGHT}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:12}}>Your Circles</div>
        {allChats.filter(c=>c.isOwn).length===0?<div style={{fontSize:11,color:INK_LIGHT,fontStyle:"italic"}}>You haven't planted any circles yet.</div>:allChats.filter(c=>c.isOwn).map(c=>{var color=DRAFT_COLORS[c.id]||INK;return(<div key={c.id} onClick={()=>setSelectedChat(c)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+INK_LIGHT,cursor:"pointer"}}><div style={{width:9,height:9,borderRadius:"50%",background:c.type==="open"?color:"none",border:"2px solid "+color,flexShrink:0}}/><div style={{fontWeight:700,fontSize:12,color:INK,letterSpacing:.5}}>{c.name}</div><div style={{fontSize:9,color:INK_MID,marginLeft:"auto",letterSpacing:1,textTransform:"uppercase"}}>{c.type}</div></div>);})}
      </div>
      <div style={{padding:"20px 28px"}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:INK_MID,marginBottom:12}}>Settings</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid "+INK_LIGHT}}>
          <div><div style={{fontSize:12,color:INK,fontWeight:700}}>Pulse Check</div><div style={{fontSize:9,color:INK_MID,marginTop:2}}>{currentUser.pulseCheck?"Active":"Off"}</div></div>
          <div onClick={()=>setCurrentUser(u=>({...u,pulseCheck:!u.pulseCheck}))} style={{width:36,height:20,borderRadius:10,background:currentUser.pulseCheck?INK:INK_LIGHT,position:"relative",cursor:"pointer",transition:"background 0.15s",flexShrink:0}}><div style={{position:"absolute",top:3,left:currentUser.pulseCheck?18:3,width:14,height:14,borderRadius:"50%",background:BG,transition:"left 0.15s"}}/></div>
        </div>
        {[["Notifications","On"],["Radius memory","Off"]].map(([label,val])=>(<div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid "+INK_LIGHT}}><span style={{fontSize:12,color:INK,fontWeight:600}}>{label}</span><span style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:INK_MID,textTransform:"uppercase"}}>{val}</span></div>))}
      </div>
    </div>)}

    {/* Bottom nav — replaces both old nav bars */}
    <BottomNav tab={tab} setTab={setTab} currentUser={currentUser}/>
  </div></div>);
}
