import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck, Sparkles, CreditCard, Receipt } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold mb-2">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-6">Ajoutez des annales pour commencer.</p>
        <Link to="/annales" className="inline-flex items-center gap-2 gradient-hero text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Voir les annales <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 relative">
      <div className="pointer-events-none absolute inset-0 mesh-overlay opacity-20" aria-hidden="true" />
      <div className="container max-w-5xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-4 w-4" /> Votre selection
          </div>
          <h1 className="text-3xl font-heading font-bold">Mon panier ({totalItems})</h1>
        </div>

        <div className="space-y-3 mb-8">
          {items.map(item => (
            <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 bg-card/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-sm truncate">{item.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors" aria-label={`Diminuer la quantite de ${item.title}`}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors" aria-label={`Augmenter la quantite de ${item.title}`}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <p className="text-sm font-bold text-primary w-24 text-right">{(item.price * item.quantity).toLocaleString('fr-FR')} F</p>
              <button onClick={() => removeItem(item.id)} className="p-1.5 text-muted-foreground hover:text-accent transition-colors" aria-label={`Retirer ${item.title} du panier`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold">Resume de commande</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-heading font-bold text-primary">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <Link
            to="/paiement"
            className="inline-flex w-full items-center justify-center gap-2 text-center gradient-hero text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            <CreditCard className="h-4 w-4" />
            Proceder au paiement
          </Link>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Parcours de paiement securise
          </p>
        </div>
      </div>
    </div>
  );
}
