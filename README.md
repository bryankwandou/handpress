<div align="center">

<img src="public/icon.svg" width="72" alt="Handpress" />

# Handpress

**Animated posters and social graphics, made in a browser tab.**

Per-layer timelines, printed-type effects, in-tab background cutouts, and video export that
renders frame by frame instead of capturing the screen. Nothing is capped, and no file leaves
the machine it was made on.

[Open the editor](https://handpress.vercel.app/editor) · [Landing page](https://handpress.vercel.app)

</div>

---

## Why it exists

A still post gets a glance; a moving one gets a stop. Yet in most browser design tools
animation is an afterthought — one preset applied to the whole page, exported behind a
payment step, because encoding video costs the vendor money on every click.

Handpress puts motion first. Every layer carries its own entrance, idle, and exit, and the
encoding happens on your machine, so there is nothing to meter. The highest export setting
is simply the setting.

This is not a modified or cracked build of anyone's product. Every feature here is
written from scratch against an open canvas engine. The workflow borrows a familiar
*shape* — rail on the left, board in the middle, properties on the right — because that
layout is what people already know how to use.

## What works

| Area | Detail |
| --- | --- |
| **Text effects** | Shadow, lift, hollow, splice, echo, glitch, neon, outline, and a stepped 3D extrude. Each one is drawn as real stacked copies of the glyphs, so it survives export at any resolution. Text also bends along an arc. |
| **Motion** | 18 entrance presets, 6 idle behaviours, and an exit per layer, with duration, delay, and eight easing curves. A scrubbable timeline sits under the board. |
| **Cutouts** | ISNet segmentation running in-tab through WebAssembly — the same model behind [Removix](https://removix.vercel.app). Nothing is uploaded. A fast flat-colour knockout is there too for studio shots. |
| **Images** | Brightness, contrast, saturation, hue, blur, grain, pixelate, greyscale, sepia, invert, corner radius, borders, flips. |
| **Shapes** | 16 primitives with flat or gradient fills, strokes, dashes, adjustable point counts, and star waist. |
| **Layout** | Multi-select, marquee, magnetic snapping to layer and artboard edges, align, distribute, reorder by drag, lock, hide, 16 blend modes. |
| **Canvas** | 25 presets across social, print at 300 dpi, and screen — plus any custom size. Resizing rescales the artwork rather than cropping it. |
| **Export** | PNG / JPG / WebP up to 6×, SVG with live text, PDF at 150–400 dpi, MP4 and WebM written frame-accurately, and the project itself as JSON. |
| **Templates** | Forty starting designs across events, retail, social, stories, thumbnails, print, cards, editorial, and shop utilities — each one animated, at the right canvas size, and editable down to the last layer. |
| **Offline** | Projects live in IndexedDB. Type, templates, and effects are bundled. Autosave every twelve seconds. |

## Stack

- **Next.js 16** (App Router) and **React 19**
- **Konva** and **react-konva** for the canvas scene graph
- **Zustand** for editor state with an 80-step undo stack
- **Tailwind CSS v4** with a token layer defined in `globals.css`
- **@imgly/background-removal** on `onnxruntime-web`
- **motion** for landing-page entrances, **jsPDF** for print output
- **idb-keyval** for local project storage

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## How it is put together

```
src/
  lib/
    types.ts               Document and layer model
    factories.ts           Layer constructors
    store.ts               Zustand store, history, selection, alignment
    animation.ts           Pure time → transform sampler
    konva-helpers.ts       Fills, shape paths, the text-effect pass builder
    export.ts              Raster, SVG serialiser, PDF, frame-accurate video
    background-removal.ts  Model cutout and flat-colour knockout
    storage.ts             IndexedDB projects, file import and export
    presets.ts             Sizes, fonts, palettes, gradients, shortcuts
    templates.ts           Starter designs
  components/
    editor/                Stage, layer renderer, panels, inspector, timeline
    landing/               Live specimen demo, scroll reveals
    brand/                 Logo and wordmark
```

The piece worth reading first is `animation.ts`. It is a pure function from
`(spec, layer, t, total)` to a transform. The live preview and the exported video call the
same function, which is why a recording matches what you saw on screen instead of being a
screen capture of it.

The second is `textEffectPasses` in `konva-helpers.ts`. Every effect is expressed the way
the print trade does it — the same glyphs printed several times, shifted and re-inked —
rather than as a CSS filter that would not survive a 6× export.

## The mark

The logo is an **H** cut from two press plates joined by an impression bar, with a
vermilion copy offset up and to the left. That offset is *misregistration*: the flaw you
get when a plate shifts between passes. Printers spend careers avoiding it. Here it is
the signature.

## Not yet done

Being straight about the gaps:

- Grouping layers, and a proper crop handle on images
- Animated GIF export (MP4 and WebM are in)
- A *shared* template library — the forty built in cover the common jobs, but there is
  nowhere yet to publish your own
- A packaged Android build; the editor reflows to a phone browser, but the touch
  gestures need work before it is worth wrapping

## Licence

MIT.
