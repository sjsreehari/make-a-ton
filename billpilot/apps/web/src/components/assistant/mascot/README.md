# Mascot Component Architecture

## Current Implementation (Phase 1)
- Implemented as a lightweight CSS-only interactive orb (`Mascot.tsx`).
- Responds to the state enum:
  `'idle' | 'listening' | 'thinking' | 'talking' | 'moving' | 'pointing' | 'happy' | 'oops'`
- Uses standard Tailwind CSS classes for color transitions, pulse, and scale.
- **Do not install framer-motion in this phase.**

## Future Animation Replacement (Phase 2)
In the next phase, replace `Mascot.tsx` with:
- Framer Motion spring physics animations.
- Vector mascot artwork (SVG character with expressive eyes/mouth).
- Coordinate-based travel animations to target elements (`target?: { x: number; y: number }`).

The external component interface will remain identical:
```tsx
<Mascot state={mascotState} target={currentTargetCoordinates} />
```
All chat, SSE, tool, and tour logic is completely decoupled from the mascot rendering.
