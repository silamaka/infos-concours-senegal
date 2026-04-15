import { X, Download, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ModalPDFPreviewProps {
  open: boolean;
  onClose: () => void;
  annale: {
    id: string | number;
    title: string;
    price: number;
    description?: string;
    pages?: number;
  } | null;
}

export default function ModalPDFPreview({ open, onClose, annale }: ModalPDFPreviewProps) {
  const { addItem } = useCart();

  if (!open || !annale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-heading font-semibold">{annale.title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview area */}
        <div className="p-6">
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center mb-4">
            <p className="text-muted-foreground text-sm text-center px-4">
              📄 Aperçu PDF disponible après connexion.<br />
              Contenu : {annale.pages || '—'} pages de sujets et corrigés.
            </p>
          </div>
          {annale.description && (
            <p className="text-sm text-muted-foreground mb-4">{annale.description}</p>
          )}
          <p className="text-2xl font-bold text-primary mb-6">
            {annale.price.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { addItem({ id: annale.id, title: annale.title, price: annale.price, type: 'annale' }); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 gradient-hero text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="h-4 w-4" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
