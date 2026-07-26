import { useCallback, useEffect, useMemo, useState } from "react";
import { AddFeedModal } from "../components/AddFeedModal";
import { Button } from "../components/Button";
import { FeedCard } from "../components/FeedCard";
import { Header } from "../components/Header";
import { TagPills } from "../components/TagPills";
import { deleteFeed, listFeeds, type Feed } from "../api/client";
import "./BoardPage.css";

const BACKGROUND_REFRESH_MS = 60_000;

export function BoardPage() {
  const [feeds, setFeeds] = useState<Feed[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await listFeeds();
      setFeeds(data);
      setLoadError(null);
    } catch {
      setLoadError("Couldn't reach the API. Check that it's running.");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, BACKGROUND_REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  function handleCreated(feed: Feed) {
    setFeeds((prev) => (prev ? [feed, ...prev] : [feed]));
    setShowAddModal(false);
  }

  async function handleDelete(feed: Feed) {
    setFeeds((prev) => prev?.filter((item) => item.id !== feed.id) ?? prev);
    await deleteFeed(feed.id).catch(() => load());
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const allTags = useMemo(() => {
    const set = new Set<string>();
    feeds?.forEach((feed) => feed.tags.forEach((tag) => set.add(tag)));
    return [...set].sort();
  }, [feeds]);

  const visibleFeeds = useMemo(() => {
    if (!feeds || activeTags.length === 0) return feeds;
    return feeds.filter((feed) => activeTags.some((tag) => feed.tags.includes(tag)));
  }, [feeds, activeTags]);

  return (
    <div className="board-page">
      <Header>
        <Button onClick={() => setShowAddModal(true)}>+ Add feed</Button>
      </Header>

      <main className="board-page__main">
        {loadError && <p className="board-page__error">{loadError}</p>}

        {!loadError && feeds === null && (
          <p className="board-page__status">Reading the wire…</p>
        )}

        {feeds !== null && feeds.length === 0 && (
          <div className="empty-state">
            <p className="empty-state__eyebrow">Nothing on the wire yet</p>
            <h2 className="empty-state__title">Add your first feed to start monitoring it.</h2>
            <Button onClick={() => setShowAddModal(true)}>+ Add feed</Button>
          </div>
        )}

        {feeds !== null && feeds.length > 0 && allTags.length > 0 && (
          <div className="board-page__filters">
            <TagPills tags={allTags} active={activeTags} onToggle={toggleTag} />
          </div>
        )}

        {visibleFeeds !== null && visibleFeeds.length > 0 && (
          <div className="board-grid">
            {visibleFeeds.map((feed) => (
              <FeedCard key={feed.id} feed={feed} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {feeds !== null && feeds.length > 0 && visibleFeeds?.length === 0 && (
          <p className="board-page__status">No feeds tagged with {activeTags.join(" or ")}.</p>
        )}
      </main>

      {showAddModal && (
        <AddFeedModal onClose={() => setShowAddModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
