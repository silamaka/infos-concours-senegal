import { Component, type ErrorInfo, type ReactNode } from 'react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  title?: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Route error boundary', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-6 shadow-card text-center">
            <h2 className="text-lg font-heading font-bold">{this.props.title ?? 'Erreur de section'}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Un composant de cette page a plante. Vous pouvez reessayer sans recharger toute l'application.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
            >
              Reessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
