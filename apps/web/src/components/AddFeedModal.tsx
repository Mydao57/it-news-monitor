import { useEffect, useState, type FormEvent } from "react";
import { ApiError, createFeed, type Feed } from "../api/client";
import { Button } from "./Button";
import "./AddFeedModal.css";

export function AddFeedModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (feed: Feed) => void;
}) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const feed = await createFeed({
        url: url.trim(),
        name: name.trim() || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      onCreated(feed);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't reach the feed. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-ticket"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-feed-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="modal-ticket__eyebrow">New source</p>
        <h2 id="add-feed-title" className="modal-ticket__title">
          Add a feed
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="modal-ticket__field">
            <span>Feed URL</span>
            <input
              type="text"
              inputMode="url"
              autoFocus
              required
              placeholder="https://example.com/feed.xml"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>

          <label className="modal-ticket__field">
            <span>Name (optional)</span>
            <input
              type="text"
              placeholder="Leave blank to use the feed's own title"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="modal-ticket__field">
            <span>Tags (optional)</span>
            <input
              type="text"
              placeholder="e.g. ai, dev"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </label>

          {error && <p className="modal-ticket__error">{error}</p>}

          <div className="modal-ticket__actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Checking feed…" : "Start monitoring"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
