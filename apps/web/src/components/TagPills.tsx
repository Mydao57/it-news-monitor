import "./TagPills.css";

export function TagPills({
  tags,
  onToggle,
  active,
}: {
  tags: string[];
  onToggle?: (tag: string) => void;
  active?: string[];
}) {
  if (tags.length === 0) return null;

  return (
    <ul className="tag-pills">
      {tags.map((tag) => {
        const isActive = active?.includes(tag);
        const isInteractive = Boolean(onToggle);

        return (
          <li key={tag}>
            {isInteractive ? (
              <button
                type="button"
                className={`tag-pill tag-pill--button ${isActive ? "tag-pill--active" : ""}`}
                onClick={() => onToggle?.(tag)}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            ) : (
              <span className="tag-pill">{tag}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
