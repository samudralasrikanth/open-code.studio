import React from "react";

import styles from "./SplashScreen.module.css";

export function SplashScreen(): React.ReactElement {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <span className={styles.logoIcon}>⬡</span>
        <h1 className={styles.title}>Open-Code.Studio</h1>
        <div className={styles.loader} aria-label="Loading">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
