import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { PulseDot } from "../components/PulseDot";
import { TagPills } from "../components/TagPills";
import {
  deleteFeed,
  getFeedItems,
  refreshFeed,
  updateFeed,
  type Feed,
  type FeedItem,
} from "../api/client";
import { relativeTime, wireCode } from "../utils/time";
import "./WirePage.css";

export function WirePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [feed, setFeed] = useState<Feed | null>(null);
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [savingTags, setSavingTags] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getFeedItems(id);
      setFeed(data.feed);
      setItems(data.items);
      setError(null);
      setTagsInput(data.feed.tags.join(", "));
    } catch {
      setError("Couldn't reach the API. Check that it's running.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const tagsDirty = feed !== null && tagsInput !== feed.tags.join(", ");

  async function handleSaveTags() {
    if (!id) return;
    setSavingTags(true);
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const updated = await updateFeed(id, { tags }).catch(() => null);
    if (updated) {
      setFeed(updated);
      setTagsInput(updated.tags.join(", "));
    }
    setSavingTags(false);
  }

  async function handleRefresh() {
    if (!id) return;
    setRefreshing(true);
    await refreshFeed(id).catch(() => null);
    await load();
    setRefreshing(false);
  }

  async function handleDelete() {
    if (!id) return;
    await deleteFeed(id);
    navigate("/");
  }

  return (
    <div className="wire-page">
      <Header />

      <main className="wire-page__main">
        <Link to="/" className="wire-page__back">
          ← Board
        </Link>

        {error && <p className="wire-page__error">{error}</p>}

        {feed && (
          <>
            <div className="wire-page__title-row">
              <PulseDot status={feed.status} />
              <h1 className="wire-page__title">{feed.name}</h1>
            </div>

            <div className="wire-page__meta">
              {feed.siteUrl && (
                <a href={feed.siteUrl} target="_blank" rel="noreferrer">
                  {feed.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              <span>last signal {relativeTime(feed.lastPublishedAt)}</span>
              <span>last checked {relativeTime(feed.lastFetchedAt)}</span>
            </div>

            {feed.lastFetchError && (
              <p className="wire-page__fetch-error">Last check failed: {feed.lastFetchError}</p>
            )}

            <div className="wire-page__actions">
              <Button variant="ghost" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? "Checking…" : "Check now"}
              </Button>
              <Button variant="ghost" onClick={handleDelete}>
                Stop monitoring
              </Button>
            </div>

            <label className="wire-page__tags-field">
              <span>Tags</span>
              <div className="wire-page__tags-row">
                <input
                  type="text"
                  placeholder="e.g. ai, dev"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                />
                {tagsDirty && (
                  <Button variant="ghost" onClick={handleSaveTags} disabled={savingTags}>
                    {savingTags ? "Saving…" : "Save"}
                  </Button>
                )}
              </div>
            </label>
          </>
        )}

        {items && items.length === 0 && (
          <div className="empty-state">
            <p className="empty-state__eyebrow">Quiet on this line</p>
            <h2 className="empty-state__title">No items have come through yet.</h2>
          </div>
        )}

        {items && items.length > 0 && (
          <ol className="wire-list">
            {items.map((item) => (
              <li key={item.id} className="wire-slip">
                <span className="wire-slip__code">{wireCode(item.isoDate)}</span>
                <div className="wire-slip__body">
                  <h3 className="wire-slip__title">{item.title}</h3>

                  {(item.author || item.categories.length > 0) && (
                    <div className="wire-slip__meta">
                      {item.author && <span className="wire-slip__author">{item.author}</span>}
                      <TagPills tags={item.categories} />
                    </div>
                  )}

                  {item.contentSnippet && (
                    <p className="wire-slip__snippet">{item.contentSnippet}</p>
                  )}
                  {item.link && (
                    <a
                      className="wire-slip__link"
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read the source →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
