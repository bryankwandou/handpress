import Link from "next/link";
import { HandpressMark, HandpressWordmark } from "@/components/brand/logo";
import { LiveSpecimen } from "@/components/landing/LiveSpecimen";
import { Reveal } from "@/components/landing/Reveal";

const CAPABILITIES = [
  {
    title: "Type that carries weight",
    body: "Ten effects built from stacked copies of the glyphs — shadow, lift, hollow, splice, echo, glitch, neon, outline, and a stepped extrude for real depth. Bend a line along an arc while you are at it.",
  },
  {
    title: "Motion without a timeline degree",
    body: "Eighteen entrances, six idle behaviours, and an exit for every layer. Scrub the bar at the bottom, or hit play and watch the whole board perform.",
  },
  {
    title: "Cutouts that stay on your machine",
    body: "A segmentation model runs inside the tab through WebAssembly. Drop in a portrait, take the backdrop off, and nothing was uploaded to get there.",
  },
  {
    title: "Print sizes that actually print",
    body: "A4, A5, A3, DL, US Letter, business cards, roll-up banners — all set at 300 dpi. The PDF comes out at the page size you chose.",
  },
  {
    title: "Vector out, not just pixels",
    body: "Export SVG and the text is still text, the shapes are still paths. Open it in Illustrator or Inkscape later and keep working.",
  },
  {
    title: "Works with the network off",
    body: "Projects sit in this browser's own storage. Type, templates, and effects are bundled. Close the laptop mid-sentence and the work is still there.",
  },
];

const FORMATS = [
  { label: "PNG", note: "Up to 6× with transparency" },
  { label: "JPG", note: "Quality you choose" },
  { label: "WebP", note: "Smaller for the web" },
  { label: "SVG", note: "Editable vector" },
  { label: "PDF", note: "150 / 300 / 400 dpi" },
  { label: "MP4", note: "Frame-accurate" },
  { label: "WebM", note: "VP9 or VP8" },
  { label: "JSON", note: "The project itself" },
];

const HONEST = [
  {
    q: "Is this a Canva clone?",
    a: "No. It borrows the shape of the workflow, because that layout is what people already know, but every line of it is written here. There is no scraped asset library, no cracked build, and nothing taken from anyone else's product.",
  },
  {
    q: "Where do my files go?",
    a: "Nowhere. There is no account system and no server holding your work. Projects live in this browser's IndexedDB, and exports land in your downloads folder.",
  },
  {
    q: "What is the catch on the free part?",
    a: "There is no paid tier to upsell you to, so nothing has been held back to create one. The trade is that you supply your own pictures and there is no shared template marketplace behind it.",
  },
  {
    q: "Will there be an Android build?",
    a: "That is the next thing on the list. The editor already resizes down to a phone screen in a mobile browser, and a packaged build follows once the touch gestures feel right.",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--hairline)] surface-0/85 backdrop-blur-md">
        <div className="mx-auto flex h-15 max-w-6xl items-center justify-between px-5 py-3">
          <HandpressWordmark />
          <nav className="flex items-center gap-1">
            <Link href="#capabilities" className="hidden rounded-lg px-3 py-2 text-[0.82rem] text-2 transition-colors hover:text-1 sm:block">
              What it does
            </Link>
            <Link href="#formats" className="hidden rounded-lg px-3 py-2 text-[0.82rem] text-2 transition-colors hover:text-1 sm:block">
              Exports
            </Link>
            <Link
              href="/editor"
              className="ml-1 rounded-lg bg-[var(--accent)] px-4 py-2 text-[0.82rem] font-medium text-[var(--accent-contrast)] transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            >
              Open the editor
            </Link>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------ hero */}
      <section className="grain relative overflow-hidden border-b border-[var(--hairline)]">
        <div className="press-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Runs in the browser · nothing uploaded
            </p>

            <h1 className="font-display text-[clamp(2.6rem,6.4vw,4.4rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-1">
              Every design tool
              <br />
              rents you the press.
              <br />
              <span className="text-[var(--accent)]">This one hands it over.</span>
            </h1>

            <p className="mt-6 max-w-[52ch] text-[1.02rem] leading-relaxed text-2">
              Handpress is a layout studio for flyers, posters, and social graphics. Full text effects, per-layer
              motion, background cutouts, print-ready PDF, and vector export. No watermark stamped on the corner,
              no ceiling on resolution, no sign-up wall between you and your own work.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/editor"
                className="inline-flex h-12 items-center rounded-xl bg-[var(--accent)] px-7 text-[0.95rem] font-semibold text-[var(--accent-contrast)] shadow-lg shadow-[var(--accent)]/20 transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
              >
                Start a design
              </Link>
              <Link
                href="#capabilities"
                className="inline-flex h-12 items-center rounded-xl border border-[var(--hairline)] px-6 text-[0.95rem] font-medium text-1 transition-colors hover:bg-[var(--surface-2)]"
              >
                See what is inside
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--hairline)] pt-6">
              {[
                { n: "10", l: "Text effects" },
                { n: "24", l: "Motion presets" },
                { n: "8", l: "Export formats" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="tabular font-display text-[1.7rem] font-bold leading-none text-1">{s.n}</dt>
                  <dd className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-3">{s.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.12}>
            <LiveSpecimen />
            <p className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-3">
              Live — same code the editor runs
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- capabilities */}
      <section id="capabilities" className="border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-[clamp(1.9rem,4vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.04em] text-1">
              Built the long way, so none of it is a demo
            </h2>
            <p className="mt-4 max-w-[58ch] text-[0.98rem] leading-relaxed text-2">
              Each of these is wired to the canvas, not to a screenshot. Open the editor and the buttons do the
              thing the sentence says they do.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <article className="group h-full surface-1 p-6 transition-colors duration-200 hover:bg-[var(--surface-2)]">
                  <span className="mb-4 block font-mono text-[0.62rem] tabular text-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-[1.06rem] font-semibold tracking-[-0.02em] text-1">{c.title}</h3>
                  <p className="mt-2.5 text-[0.86rem] leading-relaxed text-2">{c.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- formats */}
      <section id="formats" className="border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
            <Reveal>
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.04em] text-1">
                Eight ways out, none of them crippled
              </h2>
              <p className="mt-4 max-w-[46ch] text-[0.98rem] leading-relaxed text-2">
                The usual pattern is a free tier that exports at 800 pixels with a logo in the corner. Handpress has
                no tier to protect, so the highest setting is simply the setting.
              </p>
              <p className="mt-4 max-w-[46ch] text-[0.98rem] leading-relaxed text-2">
                Motion exports are written one frame at a time rather than screen-recorded, so a busy laptop still
                produces a clean file instead of a stutter.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--hairline)] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {FORMATS.map((f) => (
                  <li key={f.label} className="surface-1 p-5 transition-colors hover:bg-[var(--surface-2)]">
                    <p className="font-display text-[1.15rem] font-bold tracking-tight text-1">{f.label}</p>
                    <p className="mt-1 text-[0.74rem] leading-snug text-3">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section className="border-b border-[var(--hairline)]">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:py-24">
          <Reveal>
            <h2 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.05] tracking-[-0.04em] text-1">
              Straight answers
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
            {HONEST.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="font-display text-[1.02rem] font-semibold tracking-[-0.02em] text-1">{f.q}</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--hairline)] text-3 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[62ch] text-[0.9rem] leading-relaxed text-2">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="grain relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
          <Reveal>
            <HandpressMark size={52} className="mx-auto text-1" title="Handpress" />
            <h2 className="mt-7 font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1] tracking-[-0.045em] text-1">
              Open it and make something
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[1rem] leading-relaxed text-2">
              Nothing to install, nothing to sign, nothing held back. The first flyer takes about four minutes.
            </p>
            <Link
              href="/editor"
              className="mt-9 inline-flex h-13 items-center rounded-xl bg-[var(--accent)] px-8 text-[1rem] font-semibold text-[var(--accent-contrast)] shadow-xl shadow-[var(--accent)]/25 transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
            >
              Open the editor
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-[var(--hairline)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <HandpressWordmark markSize={24} showTagline />
          <div className="flex items-center gap-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-3">
            <a href="https://github.com/bryankwandou/handpress" className="transition-colors hover:text-1">
              Source
            </a>
            <span>Android build in progress</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
