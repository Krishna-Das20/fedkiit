"use client";

import React, { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Eye,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import MarkdownContent from "./MarkdownContent";
import styles from "./styles/MarkdownEditor.module.scss";

type Edit = {
  next: string;
  cursor: number;
  selectionStart: number;
  selectionEnd: number;
};

type ToolAction = (textarea: HTMLTextAreaElement) => Edit;

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after = before,
): Edit {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end);
  const next =
    value.slice(0, start) + before + selected + after + value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  return { next, cursor, selectionStart: start + before.length, selectionEnd: start + before.length + selected.length };
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string): Edit {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const block = value.slice(start, end) || "";
  const lines = block.split("\n");
  const formatted = lines.map((line) => (line ? `${prefix}${line}` : line)).join("\n");
  const next = value.slice(0, start) + formatted + value.slice(end);
  return {
    next,
    cursor: start + formatted.length,
    selectionStart: start,
    selectionEnd: start + formatted.length,
  };
}

function insertLink(textarea: HTMLTextAreaElement): Edit {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || "link text";
  const snippet = `[${selected}](https://)`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  const urlStart = start + selected.length + 3;
  return {
    next,
    cursor: urlStart + 8,
    selectionStart: urlStart,
    selectionEnd: urlStart + 8,
  };
}

const TOOLBAR: {
  id: string;
  label: string;
  icon: LucideIcon;
  action: ToolAction;
}[] = [
  { id: "bold", label: "Bold", icon: Bold, action: (ta) => wrapSelection(ta, "**") },
  { id: "italic", label: "Italic", icon: Italic, action: (ta) => wrapSelection(ta, "*") },
  { id: "heading", label: "Heading", icon: Heading2, action: (ta) => prefixLines(ta, "## ") },
  { id: "bullet", label: "Bullet list", icon: List, action: (ta) => prefixLines(ta, "- ") },
  { id: "numbered", label: "Numbered list", icon: ListOrdered, action: (ta) => prefixLines(ta, "1. ") },
  { id: "link", label: "Link", icon: Link2, action: insertLink },
];

type MarkdownEditorProps = {
  label?: string;
  value?: string;
  // Receives the textarea's change event, or `{ target: { value } }` after a
  // toolbar edit, so callers read `e.target.value` either way.
  onChange: (event: { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  containerStyle?: React.CSSProperties;
};

export default function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  containerStyle,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState("write");

  const apply = (action: ToolAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { next, cursor, selectionStart, selectionEnd } = action(textarea);
    onChange({ target: { value: next } });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        selectionStart ?? cursor,
        selectionEnd ?? cursor,
      );
    });
  };

  return (
    <div className={styles.wrapper} style={containerStyle}>
      {label ? <label className={styles.label}>{label}</label> : null}

      <div className={styles.toolbar}>
        <div className={styles.tools}>
          {TOOLBAR.map(({ id, label: toolLabel, icon: Icon, action }) => (
            <button
              key={id}
              type="button"
              className={styles.toolBtn}
              aria-label={toolLabel}
              title={toolLabel}
              onClick={() => apply(action)}
            >
              <Icon size={15} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "write" ? styles.modeActive : ""}`}
            onClick={() => setMode("write")}
          >
            <Pencil size={14} aria-hidden="true" />
            Write
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "preview" ? styles.modeActive : ""}`}
            onClick={() => setMode("preview")}
          >
            <Eye size={14} aria-hidden="true" />
            Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          className={`${styles.textarea} ${className}`.trim()}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          rows={8}
        />
      ) : (
        <div className={`${styles.preview} ${className}`.trim()}>
          {value?.trim() ? (
            <MarkdownContent>{value}</MarkdownContent>
          ) : (
            <p className={styles.previewEmpty}>Nothing to preview yet.</p>
          )}
        </div>
      )}

      <p className={styles.hint}>
        Supports **bold**, *italic*, headings, lists, and [links](url).
      </p>
    </div>
  );
}
