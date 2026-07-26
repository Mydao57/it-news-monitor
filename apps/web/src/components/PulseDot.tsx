import type { FeedStatus } from "../api/client";
import "./PulseDot.css";

const LABEL: Record<FeedStatus, string> = {
  live: "Live — posted in the last 3 days",
  stale: "Stale — quiet for a while",
  dead: "Dead — unreachable or quiet for 2+ weeks",
  pending: "Pending first fetch",
};

export function PulseDot({ status }: { status: FeedStatus }) {
  return (
    <span className={`pulse-dot pulse-dot--${status}`} title={LABEL[status]}>
      <span className="pulse-dot__core" />
      <span className="visually-hidden">{LABEL[status]}</span>
    </span>
  );
}
