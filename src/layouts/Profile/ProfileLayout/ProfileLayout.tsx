"use client";

import React, { useEffect } from "react";
import styles from "./styles/ProfileLayout.module.scss";

type LayoutProps = {
  children: React.ReactNode;
  title?: string;
};

const Layout = ({ children, title }: LayoutProps) => {
  useEffect(() => {
    document.title = title ? title + " | FED" : "FED KIIT";
  }, [title]);

  return (
    <div className={styles.main}>
      <div className={styles.glowTopLeft} />
      <div className={styles.glowBottomRight} />
      <div className={styles.contentWrapper}>{children}</div>
    </div>
  );
};

export default Layout;
