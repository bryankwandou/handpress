/**
 * Handpress identity.
 *
 * The mark is an "H" cut from two press plates joined by an impression bar.
 * A vermilion copy sits a couple of units up and to the left — the
 * misregistration you get when a plate shifts between passes. Printers spend
 * careers avoiding it; here it is the signature.
 */

type MarkProps = {
  size?: number;
  className?: string;
  /** Turn off the offset plate for favicons and other very small placements. */
  flat?: boolean;
  title?: string;
};

/** The H glyph, reused by both plates so the offset stays perfectly true. */
function Plates({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <rect x="8" y="7" width="9" height="34" rx="4.5" />
      <rect x="31" y="7" width="9" height="34" rx="4.5" />
      <rect x="8" y="19.5" width="32" height="9" rx="4.5" />
    </g>
  );
}

export function HandpressMark({ size = 32, className, flat, title }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {!flat && (
        <g transform="translate(-2.6 -2.6)" opacity="0.92">
          <Plates fill="var(--color-press-500, #f04e23)" />
        </g>
      )}
      <Plates fill="currentColor" />
    </svg>
  );
}

/** Mark on a filled tile — used in the editor rail and on dark headers. */
export function HandpressTile({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-[10px] ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: "var(--color-ink-900)",
        color: "var(--color-paper-100)",
      }}
    >
      <HandpressMark size={Math.round(size * 0.66)} />
    </span>
  );
}

export function HandpressWordmark({
  className,
  markSize = 30,
  showTagline = false,
}: {
  className?: string;
  markSize?: number;
  showTagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <HandpressMark size={markSize} title="Handpress" />
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.06rem] font-semibold tracking-[-0.045em]"
          style={{ color: "var(--text-1)" }}
        >
          Handpress
        </span>
        {showTagline && (
          <span
            className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.22em]"
            style={{ color: "var(--text-3)" }}
          >
            Own the press
          </span>
        )}
      </span>
    </span>
  );
}
