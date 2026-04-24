import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { confirmMockPaymentApi, createOrderApi, initiatePaymentApi } from '@/utils/api';
import { toast } from 'sonner';

export default function Payment() {
  const { items, totalPrice, clearCart } = useCart();
  const method = 'paydunya' as const;
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

      const normalizedPhone = phone.replace(/\s+/g, '').trim();
      if (!normalizedPhone) {
        throw new Error('Veuillez renseigner votre numero de telephone.');
      }

      if (!/^\+?\d{9,15}$/.test(normalizedPhone)) {
        throw new Error('Le numero de telephone est invalide.');
      }

      const order = await createOrderApi(orderItems);
      const payment = await initiatePaymentApi(order.id, method, normalizedPhone);
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
            className="inline-flex mb-6 gradient-hero text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ouvrir le lien de paiement
          </a>
        )}
        <div>
          <Link to="/dashboard" className="text-primary text-sm font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
            Aller vers mon espace
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">Aucun article à payer.</p>
        <Link to="/annales" className="text-primary text-sm hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">← Voir les annales</Link>
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
          <div className="py-3 px-4 rounded-lg border border-primary bg-primary/5 text-primary text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">P</div>
              <span className="font-semibold">Paydunya</span>
            </div>
            <p className="text-xs text-primary/70 mt-1">Wave, Orange Money et plus</p>
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
              inputMode="tel"
              pattern="^\+?[0-9 ]{9,20}$"
              aria-describedby="payment-phone-help"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p id="payment-phone-help" className="mt-1 text-xs text-muted-foreground">Format accepte: +221XXXXXXXXX</p>
          </div>
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full gradient-hero text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
