import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type Variant = "primary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`button button--${variant} ${className}`.trim()} {...props} />;
}
