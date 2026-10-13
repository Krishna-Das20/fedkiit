/**
 * Types for the two dependencies that ship none, covering only what the site
 * uses. Declared here rather than pulling in @types packages for one call each.
 */

declare module "aos" {
  const AOS: {
    init(options?: { duration?: number; once?: boolean; offset?: number }): void;
  };
  export default AOS;
}

declare module "react-scroll" {
  import type { ComponentType, ReactNode } from "react";

  /** A named scroll target. */
  export const Element: ComponentType<{
    name: string;
    id?: string;
    className?: string;
    children?: ReactNode;
  }>;
}
