import React, { useState, useEffect } from 'react';
import { DARK } from '../../constants/theme';

const C = DARK;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px 20px",
          minHeight: "100vh",
          background: C.bg,
          color: C.text,
          fontFamily: "Outfit,sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            maxWidth: 500,
            background: C.s1,
            border: `1px solid ${C.red}`,
            borderRadius: 14,
            padding: 24,
          }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: C.red, margin: "0 0 12px 0" }}>⚠ Coś poszło nie tak</h1>
            <p style={{ color: C.textSub, marginBottom: 16 }}>Aplikacja napotkaała nieoczekiwany błąd.</p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <>
                <div style={{
                  background: C.s2,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontFamily: "DM Mono,monospace",
                  fontSize: 11,
                  color: C.muted,
                  overflow: "auto",
                  maxHeight: 200,
                }}>
                  <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Szczegóły błędu:</p>
                  <code style={{ color: C.red }}>{this.state.error.toString()}</code>
                  {this.state.errorInfo && (
                    <>
                      <p style={{ margin: "8px 0", fontWeight: 600 }}>Stack:</p>
                      <code style={{ color: C.textSub, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                        {this.state.errorInfo.componentStack}
                      </code>
                    </>
                  )}
                </div>
              </>
            )}

            <button onClick={() => window.location.reload()} style={{
              width: "100%",
              padding: "12px",
              background: C.accent,
              border: "none",
              borderRadius: 10,
              color: "#06060f",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "Outfit,sans-serif",
              cursor: "pointer",
            }}>
              Odśwież aplikację
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
