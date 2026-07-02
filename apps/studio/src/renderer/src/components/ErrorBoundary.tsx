import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Application-level error boundary.
 *
 * Catches React render errors and presents a recoverable error UI instead of
 * crashing the entire window. The error is logged to the console (structured
 * logging will be wired through IPC in a future story).
 */
export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[OCS] Unhandled render error', { error, componentStack: info.componentStack })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
            gap: '16px',
            padding: '32px'
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ opacity: 0.6, textAlign: 'center', maxWidth: '480px' }}>
            Open-Code.Studio encountered an unexpected error. You can try reloading the window.
          </p>
          <code
            style={{
              background: 'var(--color-bg-secondary)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              maxWidth: '640px',
              overflow: 'auto'
            }}
          >
            {this.state.error?.message}
          </code>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
