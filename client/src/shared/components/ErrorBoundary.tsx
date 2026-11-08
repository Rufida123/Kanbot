import { Component } from 'react';
import type { ReactNode } from 'react';
import { CrashScreen } from '@/shared/components/CrashScreen';

type ErrorBoundaryProps = {
  children: ReactNode;
  /** `route` keeps the shell (sidebar) alive; `global` is the last line of defence. */
  scope: 'route' | 'global';
  /** Changing this value resets the boundary (the route path), so navigating away recovers. */
  resetKey?: string;
};
type ErrorBoundaryState = { error: Error | null; resetKey: string | undefined };

/** Friendly crash screen per route and a global one (section 3.9). Logs nothing sensitive. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  // No componentDidCatch on purpose: nothing from the page (tokens, data, AI answers) is logged.

  render() {
    const { error } = this.state;
    if (error === null) return this.props.children;
    return <CrashScreen scope={this.props.scope} error={error} />;
  }
}
