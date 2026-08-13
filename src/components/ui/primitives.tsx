"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

/* --------------------------------------------------------------- buttons */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "subtle";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "subtle", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150",
        "disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
        size === "sm" && "h-8 px-3 text-[0.8rem]",
        size === "md" && "h-9.5 px-4 text-[0.85rem]",
        size === "lg" && "h-12 px-6 text-[0.95rem]",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-contrast)] hover:brightness-110 shadow-sm",
        variant === "outline" && "border border-[var(--hairline)] text-1 hover:bg-[var(--surface-2)]",
        variant === "ghost" && "text-2 hover:bg-[var(--surface-2)] hover:text-1",
        variant === "subtle" && "bg-[var(--surface-2)] text-1 hover:brightness-95 dark:hover:brightness-125",
        className,
      )}
    />
  );
}

export function IconButton({
  label, active, className, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      {...rest}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={clsx(
        "grid h-9 w-9 place-items-center rounded-lg transition-colors duration-150",
        active
          ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
          : "text-2 hover:bg-[var(--surface-2)] hover:text-1",
        className,
      )}
    />
  );
}

/* ---------------------------------------------------------------- fields */

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="border-b border-[var(--hairline)] px-4 py-4 last:border-b-0">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[0.62rem] font-medium uppercase tracking-[0.16em] text-3">{title}</h3>
        {action}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-[0.78rem] text-2" title={hint}>{label}</span>
      <span className="flex min-w-0 flex-1 items-center justify-end gap-2">{children}</span>
    </label>
  );
}

export function Slider({
  value, min, max, step = 1, onChange, onCommit, suffix,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  suffix?: string;
}) {
  return (
    <span className="flex flex-1 items-center gap-2.5">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onCommit}
        onKeyUp={onCommit}
        className="min-w-0 flex-1"
      />
      <span className="tabular w-11 shrink-0 text-right font-mono text-[0.7rem] text-3">
        {Math.round(value * 10) / 10}{suffix}
      </span>
    </span>
  );
}

export function NumberInput({
  value, onChange, min, max, step = 1, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <span className="relative inline-flex">
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="tabular h-8 w-[5.2rem] rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] px-2 pr-6 font-mono text-[0.76rem] text-1 outline-none focus:border-[var(--accent)]"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[0.62rem] text-3">
          {suffix}
        </span>
      )}
    </span>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "h-9 w-full rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] px-2.5 text-[0.82rem] text-1",
        "outline-none transition-colors placeholder:text-3 focus:border-[var(--accent)]",
        props.className,
      )}
    />
  );
}

export function Select<T extends string | number>({
  value, options, onChange, className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const match = options.find((o) => String(o.value) === raw);
        if (match) onChange(match.value);
      }}
      className={clsx(
        "h-8 rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] px-2 text-[0.78rem] text-1 outline-none focus:border-[var(--accent)]",
        className,
      )}
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
      ))}
    </select>
  );
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className="flex items-center gap-2">
      <input
        type="color"
        value={value.length === 7 ? value : value.slice(0, 7) || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-9 rounded-md"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="tabular h-8 w-[6.2rem] rounded-md border border-[var(--hairline)] bg-[var(--surface-1)] px-2 font-mono text-[0.72rem] uppercase text-1 outline-none focus:border-[var(--accent)]"
      />
    </span>
  );
}

export function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]",
      )}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: `translateX(${checked ? 18 : 2}px)` }}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value, options, onChange,
}: { value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-[var(--surface-2)] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={clsx(
            "flex-1 rounded-[6px] px-2 py-1.5 text-[0.75rem] font-medium transition-colors duration-150",
            value === o.value ? "bg-[var(--surface-1)] text-1 shadow-sm" : "text-3 hover:text-1",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <p className="font-display text-[0.92rem] font-semibold text-1">{title}</p>
      <p className="mt-1.5 max-w-[24ch] text-[0.78rem] leading-relaxed text-3">{body}</p>
    </div>
  );
}
