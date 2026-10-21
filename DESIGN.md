# BetterPitch design layer

A visual and motion pass over the existing site, following the `/awwwards` skill
(github.com/juliobsz/skills). Structure, sections, order, copy and behaviour are
unchanged: the site is a recorded Next.js build, so the pass lives in an injected
layer (`betterpitch/polish.css`, `betterpitch/polish.js`) that only adds classes,
CSS variables and styles to existing elements after React hydrates.

## Concept card

```
Idea:        Every call, your best pitch: a voice product whose page speaks with one calm voice
Metaphor:    a voice rising out of silence, the waveform in the hero
Signature:   the hero voice demo (tile bloom, glass play orb, live waveform), see hero.js
Emotion:     composed, confident, premium; nothing shouts except the hero
Motion verb: rise like a voice: things rise from a baseline and settle
Screenshot:  the hero, black into magenta, with the waveform under the play orb
```

## System

- **Palette: emerald & sand** (`betterpitch/theme.css`, chosen to replace the original
  purple): ground sand `#f4f1ea`, ink `#13201b`, muted `#5c6661`, line `rgba(19,32,27,.09)`,
  accent emerald `#0f6b4f` (buttons, links, focus), tint `#ddebe4`, deep `#0b3b2e` (dark
  sections, footer, CTA fill), gold `#c9a227` / `#ecd488` for small details only (the hero's
  italic line and spark, check-badge rings, the gradient word sweep, text selection).
  The hero runs black into deep emerald into sand. theme.css overrides the site's Tailwind
  variables and recolours the utilities that had purple typed in; purple that is baked
  into image files (product screenshots, illustrations, icons) is unchanged.
- **Type** (the site's own files): Intrinseca for display, Helvetica Now for text and
  UI (the hero now uses it too). Display tracking -0.034em, leading 1.03, balanced lines;
  card titles -0.024em; paragraphs `text-wrap: pretty`; tabular figures in stats.
- **Shape**: the site's radii are kept; white cards get a hairline edge and a two-layer shadow.
- **Motion**: one ease family, `cubic-bezier(.16,1,.3,1)` (out) and `(.165,.84,.44,1)` (soft).
  Big things move slower (headings 1.1 s) than small ones (buttons 0.35 to 0.6 s);
  card stagger 70 ms.

## Treatments (one per role)

| Role | Treatment |
|---|---|
| Section headings | rise out of their baseline (clip + 0.35em lift) when scrolled into view; the line under them follows 140 ms later |
| Card groups | rise 26 px and fade in, staggered |
| Primary/secondary buttons | a fill spreads from where the pointer entered (deeper violet on solid, ink on outlined, lavender on white); arrow travels 4 px; press scales to 0.97 |
| "Case study" pills | violet glow, arrow nudge |
| Nav and footer links | underline draws in from the left |
| Cards with links | edge and shadow warm to violet |
| Focus | 2 px violet ring, offset 3 px; buttons fill on keyboard focus too |
| Page change | new page settles in (fade + 14 px rise) |
| Scrolling | Lenis smooth scroll inside `#page-scroller` (fine pointers only) |

Idle motion: the hero's tile bloom and waveform carry the concept at rest; the rest of
the page is still on purpose so the hero stays the one signature moment.

## Rules kept

- Reduced motion: no smooth scroll, no reveals (all content visible), no movement on hover.
- Touch: hover styles sit in `@media (hover: hover)`; nothing depends on hover.
- Content already on screen is never hidden for a reveal; revealed elements are handed
  back to the site's own transitions afterwards.
- If React re-renders the document (a recoverable hydration error in the recorded build),
  the layer re-attaches to the new elements.
- Accessibility additions: skip link as the first tab stop, 24 px tap targets on nav links.
