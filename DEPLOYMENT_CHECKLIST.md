# ✅ Checklist Déploiement Production - Frontend React/Vite

## État actuel

**Date**: 2026-06-09  
**Build**: ✅ Succès (1913 modules)  
**Git**: ✅ Commits pushés sur main  
**Configuration API**: ✅ Production-ready

---

## 📋 Configuration API - Vérifications

### ✅ Fichiers de configuration créés

- [.env](.env) → Développement
  ```
  VITE_API_URL=http://localhost:8000/api/v1
  ```

- [.env.production](.env.production) → Production
  ```
  VITE_API_URL=/api/v1
  ```

- [API_CONFIG.md](API_CONFIG.md) → Documentation complète

### ✅ Fichiers modifiés

- [src/utils/api.ts](src/utils/api.ts)
  - Fallback sécurisée : `/api/v1`
  - Tous les appels API centralisés via `API_BASE_URL`
  
- [vite.config.ts](vite.config.ts)
  - Proxy Vite configuré pour développement
  - Permet de tester le comportement production localement

### ✅ Pages utilisant l'API

Toutes les pages utilisant l'API passent par `src/utils/api.ts` :
- ✅ `Home.tsx` → `getAnnalesApi()`, `getConcoursApi()`
- ✅ `Contact.tsx` → `submitContactApi()`
- ✅ `Services.tsx` → `submitServiceRequestApi()`
- ✅ Autres pages → via le contexte `AuthContext` et autres services

**Résultat**: ✅ **AUCUN hardcode localhost** détecté

---

## 🚀 Instructions de déploiement VPS

### Étape 1 : Build le frontend
```bash
npm run build  # Utilise .env.production automatiquement
```
Génère les fichiers dans le dossier `dist/`

### Étape 2 : Transférer sur VPS
```bash
# Via SCP ou FTP, copier le contenu de dist/ vers :
/var/www/frontend-build/   # ou votre répertoire web
```

### Étape 3 : Configurer Nginx

**Fichier**: `/etc/nginx/sites-available/votre-domaine.com`

```nginx
upstream django_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Rediriger HTTP vers HTTPS (recommandé)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Servir le frontend React
    root /var/www/frontend-build;
    index index.html;

    # React Router - Rediriger toutes les routes vers index.html
    location / {
        try_files $uri /index.html;
    }

    # Proxy vers Django backend
    location /api {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout et buffer
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    # Cache statique (assets)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sécurité headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### Étape 4 : Activer la configuration Nginx
```bash
sudo ln -s /etc/nginx/sites-available/votre-domaine.com \
           /etc/nginx/sites-enabled/votre-domaine.com

sudo nginx -t  # Tester la config
sudo systemctl restart nginx
```

### Étape 5 : Vérifier le déploiement
```bash
# 1. Vérifier que Nginx est OK
curl https://votre-domaine.com/

# 2. Vérifier que l'API répond
curl https://votre-domaine.com/api/v1/concours/

# 3. Vérifier les logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔍 Vérifications supplémentaires

### Backend Django

Vérifier que Django écoute correctement :
```bash
# Sur le VPS
ps aux | grep "python manage.py runserver"

# Doit montrer : ... 127.0.0.1:8000 (ou :8000)
```

### CORS (Cross-Origin)

Si vous avez des erreurs CORS, vérifier `backend/config/settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "https://votre-domaine.com",
    "https://www.votre-domaine.com",
]
```

### Certificats SSL

Pour HTTPS avec Let's Encrypt :
```bash
sudo certbot certonly --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 🧪 Tests de fonctionnement

### En navigateur (production)
1. Accédez à `https://votre-domaine.com`
2. Ouvrez la console (F12 → Network)
3. Vérifiez que les appels API vont à `/api/v1/...`
4. Vérifiez que le statut HTTP est 200 (succès)

### Endpoints à tester
```
GET /api/v1/concours/          → Liste des concours
GET /api/v1/annales/           → Liste des annales
GET /api/v1/users/me/          → Infos utilisateur (authentifié)
POST /auth/login/              → Connexion
```

---

## 📊 Optimisations apportées

| Aspect | Avant | Après | Bénéfice |
|--------|-------|-------|----------|
| **Hardcode localhost** | ❌ Cassé en prod | ✅ Variable env | Portable |
| **Fallback** | http://localhost:8000 | /api/v1 | Production-safe |
| **Proxy dev** | ❌ Absent | ✅ Configuré | Teste le vrai comportement |
| **Documentation** | ❌ Manquante | ✅ Complète | Maintenance facilitée |
| **Sécurité** | ❌ URLs hardcodées | ✅ Centralisée | Attaques réduites |

---

## 🔐 Checklist Sécurité

- ✅ Pas de secrets en `.env` (exposé au navigateur)
- ✅ URLs relatives `/api` en production
- ✅ HTTPS forcé via Nginx
- ✅ Headers de sécurité configurés
- ✅ CORS restrictif pour Django
- ✅ Proxy Nginx restreint à `/api`
- ✅ Cache-Control sur assets statiques
- ⚠️ À faire: Rate limiting Nginx (optionnel mais recommandé)

---

## 📞 Support / Troubleshooting

### Erreur: "Impossible de joindre l'API"
```bash
# Vérifier la connexion Nginx → Django
curl http://127.0.0.1:8000/api/v1/concours/
```

### Erreur: "CORS bloqué"
```bash
# Vérifier les settings Django
grep CORS_ALLOWED_ORIGINS backend/config/settings.py
```

### Erreur: "404 sur les routes React"
```bash
# Vérifier try_files dans Nginx
# Doit rediriger vers /index.html
```

---

**Status**: 🟢 Production-Ready
**Dernière mise à jour**: 2026-06-09
