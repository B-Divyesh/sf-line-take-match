# Line Take Match — visual thesis

## Direction

**Night-market neon signage, translated into an after-hours dubbing booth.** The interface feels like takes pinned beneath glowing shop signs after the crowd has left: near-black lacquer, warm paper labels, cyan level marks, magenta selection, and amber review tape. The metaphor fits a voice-production tool because it makes many short, named items easy to scan without pretending that a measurement is a verdict. Chrome stays dark and quiet; the recordings and their differences carry the light.

This is intentionally a single dark treatment. The direction depends on controlled luminance in a night environment, while all body copy and controls exceed WCAG AA contrast.

## Tokens

- `ink #090A12`: page background; blue-black booth interior.
- `stall #111522`: primary surface; lacquered equipment.
- `awning #191E30`: raised or interactive surface.
- `paper #FFF7E6`: primary text and sign-card highlights.
- `mist #B8BECE`: secondary text (7.9:1 on ink).
- `cyan #45E6E6`: measurement, focus, approved state (13.3:1 on ink).
- `pink #FF5CA8`: active selection (7.2:1 on ink).
- `amber #FFC857`: review flag and caution (12.0:1 on ink).
- `danger #FF7878`: actionable errors (7.3:1 on ink).
- `green #69E69A`: saved/success confirmation.

Colors always travel with a label, icon, shape, or border; no status is color-only.

## Typography

Two system stacks avoid a font payload and work offline on every platform. Display and labels use `Arial Narrow`, `Aptos Narrow`, and condensed sans fallbacks—letter-spaced like hand-set market signs. Body copy uses `Inter`, `ui-sans-serif`, and system sans. Numeric measures use tabular figures. Scale: 12 / 14 / 16 / 20 / 28 / clamp(40–72) px, with body at 16px minimum.

## Space and form

An 8px base grid with 4px micro-adjustments. Main gutters are 16px mobile, 32px tablet, and 48px desktop. Corners are clipped rather than softly rounded: 2–14px radii plus angular pseudo-element accents. Groups are separated by proximity first; bordered panels appear only for independent imported takes or explicit modes. All targets are at least 44px.

## Interaction grammar

- Import is the lit storefront: a wide drop zone that opens the file picker from click, Enter, or Space.
- A take becomes the reference through an explicit “Set reference” action. Magenta indicates the selected take; cyan indicates the approved reference.
- Measurements are review cues, never scores. Deltas are written in units and plain language.
- Flagging applies amber tape; removing a take requires confirmation and offers an undo toast.
- Filtering and line selection behave like a compact cue sheet on mobile, never a squeezed desktop table.

## Motion

New take rows settle upward 8px while fading in over 180ms. Toasts enter from their originating bottom edge over 220ms. Bars change width over 180ms. No animation loops. Under `prefers-reduced-motion: reduce`, transforms and transitions are removed and state changes are instant.

## Generated asset plan

The hero illustration is a cinematic, abstract voice booth viewed through a rain-softened night-market window: microphone silhouette, suspended strips shaped like waveforms, empty stool, and glowing cyan/magenta/amber practical light. It establishes the creative-production world without implying speech generation, showing a real recording space rather than a synthetic person.

Prompt: “Use case: stylized-concept. Asset type: wide landing-workspace hero illustration. Scene: an empty indie voice-recording booth tucked behind a night-market stall at midnight, rain-softened glass, one studio microphone, headphones resting on a small stool, paper line slips and abstract waveform ribbons suspended like market signage. Style: cinematic editorial illustration, tactile painted grain, crisp silhouette, no people. Composition: 3:2 wide, main microphone on right third, generous quiet darkness on left for interface copy, layered depth. Lighting: practical neon reflected through wet glass, intimate and focused rather than cyberpunk. Palette: near-black blue lacquer, warm paper cream, electric cyan, raspberry magenta, restrained amber. Avoid: text, letters, logos, watermark, brands, copyrighted characters, faces, glossy 3D UI, generic purple gradient, audio software screenshots.”

Generated with Azure OpenAI factory image deployment on 2026-08-28. Original to this product; no people, brands, or copyrighted characters. Source PNG and prompt sidecar live in `assets/src/`; optimized WebP ships in `public/assets/`.
