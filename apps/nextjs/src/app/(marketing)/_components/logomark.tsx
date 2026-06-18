// A closed-loop mark: an orbit with a node on its path, suggesting search that
// circles back on its own results. Monochrome, inherits text color.
export function Logomark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="size-5 transition-transform duration-300 ease-out group-hover:rotate-45"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.5 3"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <circle cx="20" cy="12" r="2" fill="var(--color-bioluminescent-lime)" />
    </svg>
  );
}
