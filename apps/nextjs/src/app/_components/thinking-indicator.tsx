const THINKING_TEXT = "...";

export function ThinkingIndicator() {
  return (
    <p className="text-muted-foreground text-base">
      {THINKING_TEXT.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block animate-pulse"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {char}
        </span>
      ))}
    </p>
  );
}
