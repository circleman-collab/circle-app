// Static seed data — simulated users, circles, and tag suggestions.
// In a real app these would come from an API; keeping them here makes the
// mock data easy to find and update without touching any component logic.

import { makeCircle, normalizeMsgs } from "../utils/circles.js";

export const TAG_SUGGESTIONS = [
  "jazz", "night runs", "street food", "vinyl", "cycling", "coffee", "art",
  "dogs", "books", "film", "hiking", "music", "food", "gaming", "photography",
  "design", "travel", "cooking", "fitness", "tech", "poetry", "theatre",
  "yoga", "climbing", "skateboarding",
];

export const ALL_INTEREST_TAGS = [
  "coffee", "music", "art", "books", "film", "cycling", "dogs", "food",
  "hiking", "jazz", "vinyl", "gaming", "photography", "design", "travel",
  "cooking", "fitness", "tech", "poetry", "theatre", "yoga", "climbing",
  "skateboarding", "night runs", "street food",
];

export const DEFAULT_PRESETS = [
  "got a window seat",
  "killing time",
  "open to weird conversations",
  "have 20 minutes",
  "just passing through",
  "here for a while",
];

// Simulated people detected by Pulse Check
export const NEARBY_USERS = [
  {
    id: "user_nearby_1",
    handle: "@maren",
    displayName: "Maren",
    tags: ["vinyl", "coffee", "film", "art", "cycling"],
    status: "got a window seat and nowhere to be",
    angle: -80,
    r: 95,
    responses: [
      "didn't expect a ping right now",
      "what are you doing around here?",
      "good timing actually",
      "i've been sitting here for an hour, say something interesting",
      "this seat's been mine for the last two coffees",
    ],
  },
  {
    id: "user_nearby_2",
    handle: "@sol",
    displayName: "Sol",
    tags: ["music", "food", "night runs", "design", "gaming"],
    status: "open to conversation",
    angle: 40,
    r: 120,
    responses: [
      "hey, what's up",
      "yeah i'm around",
      "what made you reach out?",
      "been a slow night honestly",
      "open to it, what do you have in mind",
    ],
  },
  {
    id: "user_nearby_3",
    handle: "@fitz",
    displayName: "Fitz",
    tags: ["books", "jazz", "coffee", "hiking", "photography"],
    status: "reading, but happy to look up",
    angle: 130,
    r: 85,
    responses: [
      "i'll fold the page",
      "what's going on over there",
      "interesting timing",
      "you pulled me out of a good chapter, worth it?",
      "alright, you've got my attention",
    ],
  },
  {
    id: "user_nearby_4",
    handle: "@yuna",
    displayName: "Yuna",
    tags: ["yoga", "art", "cooking", "travel", "tea"],
    status: "thirty minutes before my next thing",
    angle: -30,
    r: 110,
    responses: [
      "clock's ticking, make it count",
      "i was just thinking about leaving",
      "okay i'm listening",
      "what's the move",
      "thirty minutes, go",
    ],
  },
];

// Simulated hidden circles that can be discovered via Pulse
export const PULSE_CIRCLES = [
  {
    id: "pc_1",
    name: "The Still Room",
    tags: ["jazz", "vinyl", "coffee"],
    passphrase: "after midnight",
    angle: 55,
    r: 100,
    members: 7,
    governance: { mode: "admin", admins: ["user_still"] },
    type: "hidden",
    pulseable: true,
  },
  {
    id: "pc_2",
    name: "Fold & Gather",
    tags: ["art", "design", "books"],
    passphrase: "",
    angle: -100,
    r: 130,
    members: 12,
    governance: { mode: "democracy", admins: [] },
    type: "hidden",
    pulseable: true,
  },
  {
    id: "pc_3",
    name: "The Back Channel",
    tags: ["music", "film", "gaming"],
    passphrase: "signal lost",
    angle: 160,
    r: 90,
    members: 4,
    governance: { mode: "admin", admins: ["user_bc"] },
    type: "hidden",
    pulseable: true,
  },
];

// Circles shown on the map when the app first loads
export const INIT_CHATS = [
  makeCircle({ id: 1, ownerId: "user_meridian", name: "Meridian Coffee", type: "open", dist: 0.2, members: 12, angle: -55, r: 80, msgs: normalizeMsgs(["good espresso today", "anyone tried the new pour over?", "yes, highly recommend"]), tags: ["coffee", "morning", "local"], governance: { mode: "admin", admins: ["user_meridian"] } }),
  makeCircle({ id: 2, ownerId: "user_park", name: "Park Regulars", type: "open", dist: 0.5, members: 34, angle: 30, r: 140, msgs: normalizeMsgs(["dogs welcome south side", "bring frisbees tmr?"]), tags: ["outdoors", "dogs", "weekend"], governance: { mode: "democracy", admins: [] } }),
  makeCircle({ id: 3, ownerId: "user_block", name: "Block Watch", type: "closed", dist: 0.8, members: 8, angle: 155, r: 170, msgs: normalizeMsgs(["meeting thursday 7pm", "confirmed"]), tags: ["local", "safety", "neighbors"], governance: { mode: "admin", admins: ["user_block"] } }),
  makeCircle({ id: 4, ownerId: "user_unknown", name: "???", type: "hidden", dist: 1.1, members: null, angle: -130, r: 210, msgs: [], tags: [], pulseable: true, passphrase: "velvet fog", governance: { mode: "admin", admins: ["user_unknown"] } }),
  makeCircle({ id: 5, ownerId: "user_market", name: "Night Market", type: "open", dist: 0.3, members: 67, angle: 85, r: 105, msgs: normalizeMsgs(["opens at 6", "cash only tonight"]), tags: ["food", "night", "market"], governance: { mode: "democracy", admins: [] } }),
  makeCircle({ id: 6, ownerId: "user_studio", name: "Studio Session", type: "closed", dist: 0.9, members: 4, angle: -18, r: 188, msgs: normalizeMsgs(["tracking starts 8pm"]), tags: ["music", "recording", "creative"], governance: { mode: "admin", admins: ["user_studio"] } }),
];
