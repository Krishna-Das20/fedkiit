"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import styles from "./styles/MarkdownContent.module.scss";

function LinkRenderer({
  href,
  children,
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

/**
 * Renders event descriptions stored as Markdown.
 */
export default function MarkdownContent({
  children,
  className = "",
}: {
  // Only a string is rendered; anything else renders nothing.
  children?: React.ReactNode;
  className?: string;
}) {
  const source = typeof children === "string" ? children : "";
  if (!source.trim()) return null;

  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <ReactMarkdown
        components={{
          a: LinkRenderer,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
