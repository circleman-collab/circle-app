// Circle and message factory functions.
// These ensure every circle and message object has a consistent shape,
// making the rest of the app safe to assume certain fields always exist.

// Create a message object with a stable shape
export function makeMessage(text, senderId, senderHandle) {
  return {
    id: Math.random().toString(36).slice(2),
    senderId,
    senderHandle,
    text,
    timestamp: Date.now(),
  };
}

// Upgrade legacy string messages to full message objects
export function normalizeMsgs(msgs) {
  return (msgs || []).map(m =>
    typeof m === "string" ? makeMessage(m, "user_unknown", "@member") : m
  );
}

// Create a circle object with all required fields set to safe defaults.
// Pass overrides to customise — anything not provided gets a sensible value.
export function makeCircle(overrides) {
  return {
    id: Date.now(),
    ownerId: "",
    name: "",
    type: "open",
    pulseable: true,
    passphrase: "",
    dist: 0,
    members: 1,
    angle: 0,
    r: 80,
    msgs: [],
    tags: [],
    governance: { mode: "admin", admins: [] },
    pendingRequests: [],
    inviteCodes: [],
    isOwn: false,
    color: null,
    ...overrides,
  };
}

// Generate a wobbly (organic) SVG circle path — used for the radius lens
export function wobblyPath(cx, cy, r, seed, steps, amp) {
  steps = steps || 120;
  amp = amp || 2.2;
  var d = "";
  for (var i = 0; i <= steps; i++) {
    var t = (i / steps) * Math.PI * 2;
    var wr = r + amp * Math.sin(t * 5 + seed) + amp * 0.4 * Math.sin(t * 11 + seed * 0.9);
    d += (i === 0 ? "M " : "L ") + (cx + wr * Math.cos(t - Math.PI / 2)) + " " + (cy + wr * Math.sin(t - Math.PI / 2)) + " ";
  }
  return d + "Z";
}
