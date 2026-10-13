"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import style from "../styles/Event.module.scss";

/**
 * Collapsible section for the events listing.
 *
 * The archive runs to dozens of cards, so each group folds down to a single
 * row. The panel is unmounted rather than hidden with CSS: keeping thirty-odd
 * event cards mounted means thirty-odd countdown intervals ticking behind a
 * closed section.
 */
type DisclosureProps = {
  title: string;
  count?: number;
  action?: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
};

const Disclosure = ({
  title,
  count,
  action,
  defaultOpen = false,
  children,
}: DisclosureProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={style.group}>
      <div className={style.groupHead}>
        <button
          type="button"
          className={style.groupToggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <ChevronDown
            size={15}
            className={style.chevron}
            data-open={open || undefined}
            aria-hidden="true"
          />
          <span className={style.groupTitle}>{title}</span>
          {typeof count === "number" && (
            <span className={style.count}>{count}</span>
          )}
        </button>
        {action}
      </div>

      {open && <div id={panelId}>{children}</div>}
    </section>
  );
};

export default Disclosure;
