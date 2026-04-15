interface AsyncStateProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  onRetry?: () => void;
}

export default function AsyncState({
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'Aucune donnee disponible.',
  loadingMessage = 'Chargement...',
  onRetry,
}: AsyncStateProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">{loadingMessage}</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert">
        <p className="text-destructive font-medium">Erreur de chargement</p>
        <p className="text-muted-foreground mt-1">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
          >
            Reessayer
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return null;
}
