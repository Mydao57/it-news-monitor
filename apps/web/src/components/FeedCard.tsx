import { Link } from "react-router-dom";
import type { Feed } from "../api/client";
import { relativeTime } from "../utils/time";
import { PulseDot } from "./PulseDot";
import { TagPills } from "./TagPills";
import "./FeedCard.css";

export function FeedCard({
  feed,
  onDelete,
}: {
  feed: Feed;
  onDelete: (feed: Feed) => void;
}) {
  return (
    <article className="ticket">
      <Link to={`/feeds/${feed.id}`} className="ticket__link" aria-label={`Open ${feed.name}`} />

      <button
        type="button"
        className="ticket__delete"
        aria-label={`Stop monitoring ${feed.name}`}
        onClick={(event) => {
          event.preventDefault();
          onDelete(feed);
        }}
      >
        ×
      </button>

      <div className="ticket__body">
        <div className="ticket__status">
          <PulseDot status={feed.status} />
          <span className="ticket__status-label">{feed.status}</span>
        </div>

        <h2 className="ticket__name">{feed.name}</h2>

        {feed.siteUrl && <p className="ticket__source">{hostnameOf(feed.siteUrl)}</p>}

        {feed.description && <p className="ticket__description">{feed.description}</p>}

        {feed.tags.length > 0 && (
          <div className="ticket__tags">
            <TagPills tags={feed.tags} />
          </div>
        )}
      </div>

      <div className="ticket__footer">
        <span className="ticket__signal">last signal {relativeTime(feed.lastPublishedAt)}</span>
        {feed.unreadCount > 0 && (
          <span className="ticket__unread">{feed.unreadCount} new</span>
        )}
      </div>
    </article>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
