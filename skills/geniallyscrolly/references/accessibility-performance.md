# Accessibility & performance

- Calm mode is automatic (prefers-reduced-motion or `?calm`). Verify it.
- `lang` on `<html>`, one `<h1>`, real headings, alt text on images, captions or text for video content.
- Every interactive block is keyboard-reachable (the runtime uses buttons and inputs); keep focus outlines.
- Touch targets ≥ 44px; nothing important behind hover only (hover effects also work on tap or are decorative).
- Text contrast ≥ 4.5:1; never put text over busy images without a scrim.
- Libraries load from pinned CDN versions; heavy ones (Three.js, D3) load only when their block is near.
- Pinned blocks cost scroll length; videos cost bytes. Budget: ≤ 8 pins, ≤ 25 MB per page.
- Fonts: one `<link>` with only the weights you use.
