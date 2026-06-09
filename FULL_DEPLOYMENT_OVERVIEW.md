# 🏗️ Synthèse Globale: Configuration Frontend + Backend en Production

## 📊 Vue d'ensemble complète

Vous avez deux systèmes à configurer en production:

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React/Vite)                                           │
├─────────────────────────────────────────────────────────────────┤
│ Fichier: .env.production                                        │
│ VITE_API_URL=/api/v1                                           │
│ → Appelle l'API via URL relative                               │
└─────────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ NGINX (Reverse Proxy)                                           │
├─────────────────────────────────────────────────────────────────┤
│ Port 80/443 (HTTPS)                                             │
│ → Sert le frontend (dist/)                                     │
│ → Proxy /api → http://127.0.0.1:8000                          │
└─────────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (Django/Gunicorn)                                       │
├─────────────────────────────────────────────────────────────────┤
│ Fichier: .env.production → .env (sur VPS)                       │
│ ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn           │
│ CORS_ALLOWED_ORIGINS=https://...                               │
│ CSRF_TRUSTED_ORIGINS=https://...                               │
│ → Accepte les requêtes du frontend                             │
└─────────────────────────────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL (Database)                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Déploiement Complet

### Frontend (Déjà configuré ✅)

```bash
# Build
npm run build  # Utilise .env.production automatiquement

# Déployer
scp -r dist/* user@VPS:/var/www/frontend-build/
```

**Configuration déjà en place**:
- ✅ `.env` - Dev: http://localhost:8000/api/v1
- ✅ `.env.production` - Prod: /api/v1
- ✅ `vite.config.ts` - Proxy Vite configuré
- ✅ `src/utils/api.ts` - Tous les appels centralisés

### Backend (À déployer sur VPS ⚠️)

```bash
# Sur le VPS
cd /var/www/backend

# 1. Copier la config
cp .env.production .env

# 2. Éditer .env
nano .env
# → Remplacer SECRET_KEY (générer avec Python)
# → Remplacer DB_PASSWORD

# 3. Redémarrer
systemctl restart gunicorn
```

**Configuration à vérifier**:
- ⚠️ `backend/.env.production` → À copier en `.env` sur VPS
- ✅ `backend/config/settings.py` - Amélioré pour production
- ✅ `backend/env.example` - Documentation variables

---

## 🔗 Flux complet d'une requête API

```
1. Utilisateur: https://www.infosconcours.sn
                          ▼
2. Navigateur réçoit index.html + app.js
   VITE_API_URL = /api/v1
                          ▼
3. Frontend (JS): fetch('/api/v1/concours/')
                          ▼
4. Requête HTTP:
   GET https://www.infosconcours.sn/api/v1/concours/
   Host: www.infosconcours.sn
   Origin: https://www.infosconcours.sn
                          ▼
5. Nginx intercepte /api
   Envoie vers http://127.0.0.1:8000
                          ▼
6. Django reçoit:
   ✅ ALLOWED_HOSTS check  → www.infosconcours.sn ✓
   ✅ CORS check           → Origin autorisé ✓
   ✅ Traitement requête   → Retourne JSON ✓
                          ▼
7. Réponse HTTP:
   Status: 200 OK
   CORS headers: ✓
   JSON data: [concours...]
                          ▼
8. Navigateur affiche les données ✅
```

---

## 📁 Fichiers et leur rôle

### Frontend
| Fichier | Rôle | Status |
|---------|------|--------|
| `.env` | Dev API URL | ✅ Configuré |
| `.env.production` | Prod API URL | ✅ Créé |
| `vite.config.ts` | Proxy Vite | ✅ Configuré |
| `src/utils/api.ts` | API centrale | ✅ Configuré |

### Backend
| Fichier | Rôle | Status |
|---------|------|--------|
| `.env.production` | Config template | ✅ Créé |
| `config/settings.py` | Django settings | ✅ Amélioré |
| `env.example` | Doc variables | ✅ Amélioré |

### Documentation
| Fichier | Contenu |
|---------|---------|
| `FIX_SUMMARY.md` | 🌟 Résumé rapide à lire d'abord |
| `CHECKLIST_ACTION.md` | 📋 À cocher pendant le déploiement |
| `IMMEDIATE_FIX_DISALLOWED_HOST.md` | 🔥 Guide action si DisallowedHost |
| `DJANGO_PRODUCTION_CONFIG.md` | 📚 Documentation complète |
| `API_REQUEST_FLOW.md` | 🔄 Comprendre le flux |
| `diagnose-disallowed-host.sh` | 🔧 Script diagnostic |

---

## 🎯 Priorisation: Qu'faire en premier?

### Urgence 🔴 (Blocke production maintenant)
```
1. Sur VPS: cp backend/.env.production backend/.env
2. Éditer .env - remplacer SECRET_KEY et DB_PASSWORD
3. systemctl restart gunicorn
```

### Important 🟠 (À faire après)
```
4. Vérifier que https://www.infosconcours.sn fonctionne
5. Vérifier les logs: journalctl -u gunicorn -f
6. Tester toutes les pages (Concours, Annales, Login, etc.)
```

### Maintenance 🟡 (À faire plus tard)
```
7. Configurer Rate Limiting (optionnel mais recommandé)
8. Configurer Email (optionnel pour notifications)
9. Configurer Redis Cache (optionnel pour performance)
```

---

## 🔐 Sécurité: Vérification finale

**Avant de considérer l'app en production**:

- ✅ Django: `DEBUG=False`
- ✅ Django: `SECRET_KEY` unique et complexe
- ✅ Django: `ALLOWED_HOSTS` restreint
- ✅ HTTPS: Certificat SSL valide (Let's Encrypt)
- ✅ HTTPS: Redirecte HTTP → HTTPS
- ✅ CORS: Restreint aux domaines autorisés
- ✅ CSRF: Tokens protégés
- ✅ HSTS: Activé (1 an)
- ✅ X-Frame-Options: DENY
- ⚠️ Rate Limiting: À configurer
- ⚠️ WAF: À considérer (optionnel)

---

## 📞 Besoin d'aide?

### Problème: DisallowedHost
→ Voir: `FIX_SUMMARY.md` ou `IMMEDIATE_FIX_DISALLOWED_HOST.md`

### Problème: CORS bloqué
→ Vérifier: `CORS_ALLOWED_ORIGINS` dans `.env`

### Problème: CSRF validation failed
→ Vérifier: `CSRF_TRUSTED_ORIGINS` dans `.env`

### Problème: API appelle localhost en prod
→ Vérifier: `VITE_API_URL` dans frontend `.env.production`

### Besoin d'exécuter un diagnostic
```bash
cd /var/www/backend
bash diagnose-disallowed-host.sh
```

---

## 📊 État actuel (2026-06-09)

### ✅ Terminé
- Frontend: Configuration API
- Backend: Configuration Django
- Documentation: Complète

### ⚠️ À faire
- Copier `.env.production` → `.env` sur VPS
- Configurer SECRET_KEY et DB_PASSWORD
- Redémarrer Django
- Tester production

### 🔴 En erreur actuellement
- DisallowedHost (à corriger avec les steps ci-dessus)

---

## 🚀 Déploiement rapide (Ctrl+C, Ctrl+V)

Sur le VPS:
```bash
cd /var/www/backend

# 1. Copier config
cp .env.production .env

# 2. Éditer - remplacer les valeurs
nano .env

# 3. Redémarrer
systemctl restart gunicorn

# 4. Vérifier
systemctl status gunicorn

# 5. Tester
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/
```

---

## 📈 Prochaines étapes après correction

1. **Monitoring**: Configurer les logs
2. **Performance**: Ajouter Redis cache
3. **Sécurité**: Configurer Rate Limiting
4. **Email**: Configurer notifications
5. **Backup**: Planifier backups PostgreSQL

---

**Documentation version**: 2026-06-09  
**Status**: 🟡 Configuration ready, awaiting VPS deployment
