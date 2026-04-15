import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled frontend error', error, info);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-card text-center">
            <h1 className="text-xl font-heading font-bold">Une erreur est survenue</h1>
            <p className="text-sm text-muted-foreground mt-2">
              L'application a rencontre un probleme inattendu. Rechargez la page pour continuer.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 gradient-hero text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
