import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { confirmMockPaymentApi, createOrderApi, initiatePaymentApi } from '@/utils/api';
import { toast } from 'sonner';

export default function Payment() {
  const { items, totalPrice, clearCart } = useCart();
  const [method, setMethod] = useState<'wave' | 'orange'>('wave');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isMockPaymentEnabled = (import.meta.env.VITE_PAYMENT_MODE || 'mock') === 'mock';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const orderItems = items
        .filter(item => item.type === 'annale')
        .map(item => ({ annale_id: String(item.id), quantity: item.quantity }));

      if (orderItems.length === 0) {
        throw new Error('Votre panier ne contient pas d\'annales valides pour la commande.');
      }

      if (!phone.trim()) {
        throw new Error('Veuillez renseigner votre numero de telephone.');
      }

      const order = await createOrderApi(orderItems);
      const payment = await initiatePaymentApi(order.id, method, phone.trim());
      setPaymentUrl(payment.payment_url);

      if (payment.mock_mode && isMockPaymentEnabled) {
        await confirmMockPaymentApi(payment.payment_id, 'paid');
      }

      setSuccess(true);
      clearCart();
      toast.success(payment.mock_mode ? 'Paiement simulé confirmé.' : 'Paiement initié avec succès.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de lancer le paiement.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-flex h-20 w-20 rounded-full gradient-hero items-center justify-center mb-5 shadow-soft">
          <CheckCircle className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-heading font-bold mb-2">Paiement réussi !</h1>
        <p className="text-muted-foreground mb-3">Vos annales seront disponibles dès confirmation du paiement.</p>
        {paymentUrl && (
          <a
            href={paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex mb-6 gradient-hero text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Ouvrir le lien de paiement
          </a>
        )}
        <Link to="/dashboard" className="inline-flex gradient-hero text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          Aller au tableau de bord
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Aucun article à payer.</p>
        <Link to="/annales" className="text-primary text-sm hover:underline">← Voir les annales</Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="h-4 w-4" /> Checkout securise
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Paiement</h1>
          <p className="text-sm text-muted-foreground">Finalisez votre commande rapidement avec un flux simple et protege.</p>
        </div>

        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 mb-6 shadow-card">
          <h3 className="font-heading font-semibold mb-3">Récapitulatif</h3>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{i.title} ×{i.quantity}</span>
              <span className="font-medium">{(i.price * i.quantity).toLocaleString('fr-FR')} F</span>
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <form onSubmit={handlePay} className="bg-card/95 backdrop-blur-md border border-border rounded-2xl p-6 space-y-4 shadow-card">
          <h3 className="font-heading font-semibold">Mode de paiement</h3>
          <div className="flex gap-3">
            {(['wave', 'orange'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                  method === m ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {m === 'wave' ? '🌊 Wave' : '🟠 Orange Money'}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="payment-phone" className="text-sm font-medium mb-1 block">Numéro de téléphone</label>
            <input
              id="payment-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+221 7X XXX XX XX"
              autoComplete="tel"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full gradient-hero text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {submitting ? 'Traitement en cours...' : `Payer ${totalPrice.toLocaleString('fr-FR')} FCFA`}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Paiement chiffre et verification en temps reel
          </p>
        </form>
      </div>
    </div>
  );
}
