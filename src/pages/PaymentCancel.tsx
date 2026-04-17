import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log l'annulation du paiement
    const params = new URLSearchParams(location.search);
    const paymentId = params.get('payment_id');
    const reason = params.get('reason');
    
    if (paymentId) {
      console.log('Paiement annulé:', { paymentId, reason });
      // TODO: Appeler l'API pour mettre à jour le statut
    }
  }, [location]);

  return (
    <div className="container py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex h-20 w-20 rounded-full bg-red-100 items-center justify-center mb-6 shadow-soft">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Paiement annulé</h1>
        
        <p className="text-muted-foreground mb-8">
          Votre paiement a été annulé.
          <br />
          Vous pouvez réessayer le paiement à tout moment depuis votre panier.
        </p>
        
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/panier')}
            className="w-full"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Retour au panier
          </Button>
          
          <Button 
            onClick={() => navigate('/annales')}
            className="w-full gradient-hero text-primary-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Continuer vos achats
          </Button>
        </div>
      </div>
    </div>
  );
}
