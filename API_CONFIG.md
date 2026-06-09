# Configuration API - Documentation

## Vue d'ensemble

Le frontend React/Vite utilise une variable d'environnement `VITE_API_URL` pour configurer l'URL de base de l'API. Cela permet d'avoir différentes configurations selon l'environnement (développement vs production).

## Configuration par environnement

### 🔧 Développement

**Fichier**: `.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```

Le frontend appelle directement le backend Django sur `http://localhost:8000`.

**Alternative avec proxy Vite**:
Vous pouvez également utiliser `VITE_API_URL=/api/v1` avec le proxy Vite configuré dans `vite.config.ts`. Cela permet de tester le comportement du proxy comme en production.

### 🚀 Production

**Fichier**: `.env.production`
```
VITE_API_URL=/api/v1
```

Le frontend appelle une URL relative `/api/v1`. Nginx/Apache doit proxifier ces appels vers le backend Django.

## Architecture Nginx recommandée

```nginx
upstream django_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name votre-domaine.com;

    # Servir le frontend (build React)
    location / {
        root /var/www/frontend-build;
        try_files $uri /index.html;
    }

    # Proxy vers le backend Django
    location /api {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Structure des appels API

Tous les appels API passent par le fichier `src/utils/api.ts` qui utilise `API_BASE_URL`.

### Exemple d'endpoint

**Développement** (`http://localhost:8000/api/v1`):
```
GET http://localhost:8000/api/v1/concours/
GET http://localhost:8000/api/v1/annales/
```

**Production** (`/api/v1`):
```
GET /api/v1/concours/
GET /api/v1/annales/
```

Nginx transforme:
```
/api/v1/concours/ → http://127.0.0.1:8000/api/v1/concours/
```

## Fichiers modifiés

### 1. `.env` (Nouveau)
Configuration pour développement

### 2. `.env.production` (Nouveau)
Configuration pour production (utilisée automatiquement par `npm run build`)

### 3. `.env.example` (Nouveau)
Template d'exemple pour documenter les variables disponibles

### 4. `src/utils/api.ts` (Modifié)
- Fallback amélioré: `/api/v1` (plus robuste pour production)
- Documentation ajoutée pour expliquer la configuration
- La variable `API_BASE_URL` configure tous les appels API

### 5. `vite.config.ts` (Modifié)
- Configuration du proxy Vite en développement
- Permet de tester avec `/api/v1` même en local

## Endpoints disponibles

### Authentification
- `POST /auth/login/`
- `POST /auth/register/`
- `POST /auth/logout/`
- `POST /auth/token/refresh/`

### Concours
- `GET /concours/` - Liste avec pagination
- `GET /concours/{id}/`

### Annales
- `GET /annales/` - Liste avec pagination
- `GET /annales/{id}/`
- `GET /annales/{id}/download/`

### Commandes
- `GET /orders/`
- `GET /orders/me/`
- `POST /orders/`

### Paiements
- `POST /payments/initiate/`
- `GET /payments/{id}/status/`
- `POST /payments/{id}/mock-confirm/`

### Autres
- `GET /users/me/`
- `POST /contact/`
- `POST /services/`
- `GET /services/me/`

## Commandes npm

```bash
# Développement
npm run dev      # Lance Vite sur http://localhost:8080

# Build production
npm run build    # Utilise automatiquement .env.production

# Preview
npm run preview  # Prévisualise le build production localement
```

## Troubleshooting

### Erreur CORS en développement
Si vous avez des erreurs CORS:
1. Vérifiez que Django a `CORS_ALLOWED_ORIGINS` configuré
2. Ou utilisez le proxy Vite (déjà configuré)

### Erreur 404 en production
Si les appels API échouent en production:
1. Vérifiez la configuration Nginx
2. Vérifiez que Django écoute sur `127.0.0.1:8000`
3. Vérifiez les logs Nginx

### Variable d'environnement non chargée
1. Vérifiez que le fichier `.env` (ou `.env.production`) existe
2. Redémarrez le serveur Vite
3. Vérifiez que la variable commence par `VITE_` (important pour Vite)

## Sécurité en production

1. **HTTPS**: Utilisez toujours HTTPS en production
2. **Credentials**: Configurez `credentials: 'include'` si vous utilisez des cookies
3. **CORS**: Configurez Django pour accepter les requêtes depuis votre domaine
4. **Rate limiting**: Configurez un rate limiter Nginx/Django
5. **Headers de sécurité**: Ajoutez `X-Content-Type-Options`, `X-Frame-Options`, etc.

## Notes supplémentaires

- Les variables `VITE_*` sont exposées au navigateur (ne pas y mettre de secrets)
- En production, utilisez toujours des chemins relatifs (`/api`) plutôt que des URLs complètes
- Le proxy Vite en développement simule le comportement du proxy production
