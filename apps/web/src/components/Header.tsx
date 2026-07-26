import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="site-header">
      <Link to="/" className="site-header__mark">
        <span className="site-header__glyph" aria-hidden="true">
          ⟢
        </span>
        WIRE
      </Link>
      <p className="site-header__tagline">IT news, monitored</p>
      <div className="site-header__actions">{children}</div>
    </header>
  );
}
