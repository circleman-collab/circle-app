# Circle

A location-aware social app for discovering people and hidden circles nearby. Draw a radius on a map, plant circles, fire pulses, and leave notes — all without photos or profiles, just names, handles, and interests.

Built with React 19 + Vite 7. No router, no TypeScript, no external UI libraries. All styling is inline.

---

## What it does

- **Map** — Draw a radius to reveal circles within range. Hold to plant a new circle. Pan the map. Place notes on locations.
- **Circles** — Browse all circles within your drawn radius. Open circles join freely; closed ones require a request or invite; hidden ones must be discovered via Pulse.
- **Pulse** — Hold the button to fire a signal. Reveals hidden circles and notes nearby. With Pulse Check enabled, you can discover nearby users and hidden circles passively.
- **Profile** — Edit your name, handle, status, and interests. Your avatar is generated deterministically from your interest tags — no photos needed.

---

## Getting started

```bash
npm install
npm run dev
```

The app opens in the browser. On first load, a 3-step onboarding flow collects your identity, interests, and Pulse Check preference.

---

## Project structure

```
src/
  main.jsx                   Entry point — mounts App into #root
  App.jsx                    Root orchestrator — all state and handlers live here
  index.css                  Minimal global reset (box-sizing, font smoothing)

  constants/
    theme.js                 All colors (BG, INK, INK_MID, NOTE_BG, etc.) and font
    settings.js              Behavioral constants (hold timers, map bounds, note limits)
    data.js                  Static mock data (seed circles, nearby users, pulse circles)

  utils/
    avatar.js                Deterministic blob avatar generator from interest tags
    particles.js             Static particle descriptor generators (pulse, plant, coalesce)
    circles.js               makeCircle, makeMessage, normalizeMsgs, wobblyPath
    notes.js                 makeNote, noteDaysLeft, noteOpacity
    map.js                   City block geometry for Andersonville, Chicago

  hooks/
    useTremor.js             RAF-based sinusoidal tremor offset (used on nearby markers)

  components/
    common/
      Portal.jsx             Renders children into document.body (iOS Safari safe)
      FloatingTagDisplay.jsx Read-only animated tag chip
      FloatingTag.jsx        Interactive tag chip with remove animation

    avatar/
      StaticAvatar.jsx       Non-animated SVG avatar
      UserAvatar.jsx         Animated avatar with breathe loop and burst effects

    icons/
      FistIcon.jsx           Solidarity fist (democracy governance)
      SpectaclesIcon.jsx     Wire spectacles (admin rule governance)

    map/
      CityMapLayer.jsx       Renders Andersonville street grid and buildings
      ChatMarker.jsx         Circle marker (open / closed / hidden variants)
      NearbyUserMarker.jsx   Trembling → resolved user discovery marker
      NearbyCircleMarker.jsx Same for hidden circle discovery
      EnvelopeMarker.jsx     Note envelope (open / closed / hidden / ghost-own)
      RadiusEdgeLabel.jsx    Miles label + reset button on the radius ring
      CoalesceParticles.jsx  Particles converging toward a target point
      MapParticles.jsx       PulseParticles, OutwardBurst, InwardRush, PlantParticles,
                             BleedRings, PulseRipples

    notes/
      NotePaper.jsx          Ruled-paper note display with red margin line
      NoteCompose.jsx        Compose view (textarea, visibility selector, tags)
      NotesPanel.jsx         Side panel listing unplaced notes
      ReadNoteModal.jsx      Centered overlay to read a placed note
      CrumpledNoteReveal.jsx Scribble-to-smooth gesture for hidden notes
      UnfoldModal.jsx        Brief unfold animation before read modal appears

    circles/
      JoinModal.jsx          Three-track join flow: passphrase / request / invite code
      EditCircleModal.jsx    Bottom sheet to edit an owned circle
      CreateFlow.jsx         5–6 step wizard to plant a new circle

    pulse/
      PulseChat.jsx          Ephemeral 7-message chat after Pulse Check connection
      PulseCheckCard.jsx     Bottom sheet for discovered nearby user
      CirclePulseCard.jsx    Bottom sheet for discovered nearby hidden circle
      SpontaneousCircleSheet Bottom sheet to create a circle after pulse chat ends
      InterestMatchNotif.jsx Top banner for nearby circles matching your interests

    nav/
      StatusTab.jsx          Collapsible status bar with preset picker
      BottomNav.jsx          Four-tab navigation (map / circles / pulse / profile)

    profile/
      ProfileTagInput.jsx    Inline tag input on the profile page

    onboarding/
      OnboardingFlow.jsx     3-step identity → interests → status + Pulse Check

  views/
    MapView.jsx              Full map canvas — purely presentational, all props from App
    CirclesView.jsx          Scrollable circle list filtered by radius
    PulseView.jsx            Hold-to-fire pulse button + Pulse Check controls
    ProfileView.jsx          Identity editing, owned circles, settings
    ChatView.jsx             Circle message thread with send input
```

---

## Architecture notes

**Single source of truth.** All app state lives in `App.jsx`. Views receive only what they need as props and emit only named callbacks — no state of their own beyond local UI concerns.

**Design tokens.** Every color and the font string come from `src/constants/theme.js`. Nothing is hardcoded in components.

**Deterministic avatar.** `genAvatarPath` in `utils/avatar.js` derives a blob shape entirely from a tag seed — the same tags always produce the same shape, with no randomness at render time.

**No external dependencies beyond React.** All animations use `requestAnimationFrame` directly. All styling is inline style objects.

**Portal pattern.** Modals and bottom sheets render into `document.body` via `Portal.jsx` to prevent iOS Safari from collapsing the flex layout during keyboard transitions.
