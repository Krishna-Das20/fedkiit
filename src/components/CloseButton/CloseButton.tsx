"use client";

import Link from "next/link";
import { X } from "lucide-react";
import styles from "./styles/CloseButton.module.scss";

/**
 * The one dismiss control for the whole site.
 *
 * Every modal used to draw its own X - different sizes, different hit areas,
 * some as bare <div>s with no keyboard access at all. Rendering a Link when
 * `href` is set keeps that single appearance even where closing means
 * navigating away rather than unmounting a panel.
 */
type CloseButtonProps = {
  onClick?: () => void;
  href?: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const CloseButton = ({
  onClick,
  href,
  label = "Close",
  size = "md",
  className = "",
}: CloseButtonProps) => {
  const classes = `${styles.close} ${styles[size]} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} aria-label={label}>
        <X size={size === "sm" ? 16 : 18} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      aria-label={label}
    >
      <X size={size === "sm" ? 16 : 18} aria-hidden="true" />
    </button>
  );
};

export default CloseButton;
