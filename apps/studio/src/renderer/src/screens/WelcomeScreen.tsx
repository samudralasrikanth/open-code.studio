import React, { useEffect, useState } from 'react'
import { useTheme } from '../theme/ThemeProvider.js'
import styles from './WelcomeScreen.module.css'

interface PlatformInfo {
  appVersion: string
  platform: string
}

export function WelcomeScreen(): React.ReactElement {
  const { theme, setTheme } = useTheme()
  const [platform, setPlatform] = useState<PlatformInfo | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    window.ocs?.health.platformInfo().then((info) => {
      setPlatform({ appVersion: info.appVersion, platform: info.platform })
    }).catch(() => {
      setPlatform({ appVersion: '0.1.0', platform: process.platform })
    })

    // Small delay so the startup animation is visible
    const timer = setTimeout(() => setIsReady(true), 150)
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = (): void => {
    void setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className={`${styles.root} ${isReady ? styles.visible : ''}`}>
      {/* Background gradient orbs */}
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span className={styles.logoText}>Open-Code.Studio</span>
        </div>
        <div className={styles.topBarActions}>
          <button
            className={styles.iconButton}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className={styles.hero}>
        <div className={styles.badge}>v{platform?.appVersion ?? '0.1.0'} · Alpha</div>
        <h1 className={styles.headline}>
          One IDE.<br />Every Model.<br />Zero Vendor Lock-in.
        </h1>
        <p className={styles.tagline}>
          An AI-native software engineering platform that gives you complete
          ownership of your workflow, your models, and your code.
        </p>

        {/* CTA Cards */}
        <div className={styles.actions}>
          <button
            className={`${styles.card} ${styles.cardPrimary}`}
            disabled
            aria-disabled="true"
            title="Available in EPIC-0004 — Workspace Management"
          >
            <span className={styles.cardIcon}>📁</span>
            <span className={styles.cardLabel}>Open Folder</span>
            <span className={styles.cardHint}>Coming in Phase 1</span>
          </button>

          <button
            className={styles.card}
            disabled
            aria-disabled="true"
            title="No recent projects yet"
          >
            <span className={styles.cardIcon}>🕐</span>
            <span className={styles.cardLabel}>Recent Projects</span>
            <span className={styles.cardHint}>No projects yet</span>
          </button>

          <button
            className={styles.card}
            onClick={() => window.ocs?.window.minimize()}
          >
            <span className={styles.cardIcon}>📖</span>
            <span className={styles.cardLabel}>Documentation</span>
            <span className={styles.cardHint}>Explore the docs</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>
          {platform?.platform
            ? `Running on ${platform.platform}`
            : 'Open-Code.Studio'}
        </span>
        <span>Phase 0 — Foundation</span>
      </footer>
    </div>
  )
}
