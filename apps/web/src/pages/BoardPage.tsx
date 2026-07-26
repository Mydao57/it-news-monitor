import { useCallback, useEffect, useState } from "react";
import { AddFeedModal } from "../components/AddFeedModal";
import { Button } from "../components/Button";
import { FeedCard } from "../components/FeedCard";
import { Header } from "../components/Header";
import { deleteFeed, listFeeds, type Feed } from "../api/client";
import "./BoardPage.css";

const BACKGROUND_REFRESH_MS = 60_000;

export function BoardPage() {
  const [feeds, setFeeds] = useState<Feed[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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

        {feeds !== null && feeds.length > 0 && (
          <div className="board-grid">
            {feeds.map((feed) => (
              <FeedCard key={feed.id} feed={feed} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddFeedModal onClose={() => setShowAddModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
