import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Mettre à jour le statut du paiement si nécessaire
    const params = new URLSearchParams(location.search);
    const paymentId = params.get('payment_id');
    const token = params.get('token');
    
    if (paymentId) {
      console.log('Paiement réussi pour:', { paymentId, token });
      // TODO: Appeler l'API pour confirmer le paiement
    }
  }, [location]);

  return (
    <div className="container py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex h-20 w-20 rounded-full gradient-hero items-center justify-center mb-6 shadow-soft">
          <CheckCircle className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Paiement réussi !</h1>
        
        <p className="text-muted-foreground mb-8">
          Félicitations ! Votre paiement a été traité avec succès.
          <br />
          Vous pouvez maintenant accéder à vos annales depuis votre tableau de bord.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full gradient-hero text-primary-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Aller au tableau de bord
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/annales')}
            className="w-full"
          >
            Voir les annales
          </Button>
        </div>
      </div>
    </div>
  );
}
