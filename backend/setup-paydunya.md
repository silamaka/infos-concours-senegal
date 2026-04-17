# Configuration Paydunya - Guide d'Installation

## Étapes Suivies

### 1. Installation du Client Paydunya
```bash
pip install paydunya==1.0.2
```
**Status: **

### 2. Création Compte Paydunya Sandbox

**Instructions:**
1. Allez sur https://paydunya.com/signup
2. Créez un compte Paydunya Business
3. Connectez-vous et allez dans "Intégrez notre API"
4. Cliquez sur "Configurer une nouvelle application"
5. Choisissez "MODE TEST, JE VEUX FAIRE DES TESTS DE PAIEMENT"
6. Activez le mode de production plus tard

**Status: Documentation obtenue**

### 3. Configuration Variables d'Environnement

**Créez votre fichier `.env` dans le dossier backend:**

```bash
# Configuration Paydunya (à remplir avec vos vraies clés)
PAYDUNYA_MASTER_KEY=your-paydunya-master-key
PAYDUNYA_PRIVATE_KEY=your-paydunya-private-key
PAYDUNYA_PUBLIC_KEY=your-paydunya-public-key
PAYDUNYA_TOKEN=your-paydunya-token
PAYDUNYA_MODE=test

# URLs de l'application
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Configuration Paiements
PAYMENT_PROVIDER_MODE=mock  # Mettre à "live" pour Paydunya réel
PAYMENT_WEBHOOK_SECRET=dev-secret
```

### 4. Création Compte Fictif (Test)

**Instructions:**
1. Connectez-vous à Paydunya
2. Allez dans "Intégrez notre API" > "Clients fictifs"
3. Créez un compte de test avec:
   - Nom: "Test User"
   - Email: "test@example.com"
   - Solde: 100000 FCFA
   - Téléphone: "+221770000000"

### 5. Test du Workflow

**Commandes pour tester:**
```bash
# Démarrer le backend
python manage.py runserver

# Démarrer le frontend (autre terminal)
cd ../
npm run dev
```

**Test Flow:**
1. Créer un compte utilisateur
2. Ajouter des annales au panier
3. Aller à la page paiement
4. Remplir le numéro de téléphone
5. Confirmer le paiement
6. Vérifier la redirection Paydunya

### 6. Clés API à Obtenir

**Dans votre dashboard Paydunya > Intégration API:**
- **MASTER KEY**: Clé principale
- **PRIVATE KEY**: Clé privée  
- **PUBLIC KEY**: Clé publique
- **TOKEN**: Token d'application

### 7. URLs de Callback

**Configurez dans Paydunya:**
- **URL de succès**: `http://localhost:3000/payment/success`
- **URL d'annulation**: `http://localhost:3000/payment/cancel`
- **URL de retour**: `http://localhost:3000/payment/return`
- **IPN/Webhook**: `http://localhost:8000/api/v1/payments/webhook/`

### 8. Mode Production

**Quand prêt:**
1. Changez `PAYDUNYA_MODE=test` vers `PAYDUNYA_MODE=live`
2. Changez `PAYMENT_PROVIDER_MODE=mock` vers `PAYMENT_PROVIDER_MODE=live`
3. Utilisez vos clés API production
4. Mettez à jour les URLs de callback avec votre domaine

### 9. Dépannage

**Erreurs communes:**
- "Client Paydunya non installé" -> `pip install paydunya==1.0.2`
- "API Paydunya non configurée" -> Vérifiez les variables d'environnement
- "Erreur de validation" -> Vérifiez que tous les champs requis sont remplis

### 10. Support

**Documentation Paydunya:**
- https://developers.paydunya.com/
- https://developers.paydunya.com/doc/FR/softpay

**Test rapide avec curl:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/initiate/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": "uuid-order-id",
    "provider": "paydunya", 
    "phone": "+221770000000"
  }'
```
