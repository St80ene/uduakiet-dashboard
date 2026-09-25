import { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorPage } from './ErrorPage'; // Adjust import path as needed

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log errors to your telemetry/analytics service (e.g., Sentry, LogRocket)
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  private handleReportIssue = () => {
    const errorMsg = encodeURIComponent(
      this.state.error?.message || 'Unknown error',
    );
    // Example action: redirect to support or open feedback modal
    window.location.href = `mailto:support@yourdomain.com?subject=App%20Error%20Report&body=${errorMsg}`;
  };

  public render() {
    if (this.state.hasError) {
      // Return custom fallback if passed, otherwise use our UI ErrorPage
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorPage
          title="Something went wrong"
          message={
            this.state.error?.message ||
            'An unexpected error occurred while rendering this view.'
          }
          onRetry={this.handleReset}
          onNavigateHome={() => (window.location.href = '/')}
          onReportIssue={this.handleReportIssue}
        />
      );
    }

    return this.props.children;
  }
}
