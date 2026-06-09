# Flux des Requêtes API - Production

## 🔄 Flux complet d'une requête API en production

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Utilisateur ouvre le navigateur                               │
│    URL: https://www.infosconcours.sn                             │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. Nginx reçoit la requête HTTP                                  │
│    Host: www.infosconcours.sn (port 80 → redirige vers 443)    │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. Nginx établit connexion HTTPS (port 443)                      │
│    ✅ Certificat SSL Let's Encrypt                              │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. Nginx sert le frontend (dist/)                                │
│    ✅ index.html + JS/CSS                                       │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. Navigateur exécute le JavaScript React                        │
│    Détecte VITE_API_URL = /api/v1                               │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. Frontend appelle l'API                                        │
│    GET https://www.infosconcours.sn/api/v1/concours/            │
│    Headers: {                                                    │
│      Host: www.infosconcours.sn                                 │
│      Origin: https://www.infosconcours.sn                       │
│    }                                                             │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. Nginx reçoit la requête /api/v1/...                          │
│    ✅ location /api { proxy_pass http://127.0.0.1:8000 }       │
│    Envoie vers Django sur 127.0.0.1:8000                        │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. Django (Gunicorn) reçoit la requête                           │
│    Host: www.infosconcours.sn (envoyé par Nginx)               │
│    ✅ ALLOWED_HOSTS contient www.infosconcours.sn              │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. Django valide CORS                                            │
│    Origin: https://www.infosconcours.sn                         │
│    ✅ Dans CORS_ALLOWED_ORIGINS                                 │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. Django traite la requête                                     │
│     GET /api/v1/concours/                                        │
│     ✅ Retourne JSON 200 OK                                     │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 11. Nginx envoie la réponse au navigateur                        │
│     ✅ Status 200 OK                                            │
│     ✅ CORS headers correctes                                   │
└──────────────────────────────────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ 12. Navigateur reçoit la réponse                                 │
│     ✅ JavaScript affiche les données                           │
│     ✅ Utilisateur voit la liste des concours                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Points de vérification dans ce flux

### Point 8 - ALLOWED_HOSTS ✅
```python
# backend/.env.production
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn

# backend/config/settings.py
if not DEBUG and not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must be set in production")
```

**Si ce point échoue**:
```
DisallowedHost: Invalid HTTP_HOST header: 'www.infosconcours.sn'
```

**Solution**: Ajouter le domaine dans ALLOWED_HOSTS

---

### Point 9 - CORS ✅
```python
# backend/.env.production
CORS_ALLOWED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn

# Le middleware CORS vérifie:
# - Origin header du navigateur
# - Présence dans CORS_ALLOWED_ORIGINS
```

**Si ce point échoue**:
```
Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy
```

**Solution**: Ajouter le domaine dans CORS_ALLOWED_ORIGINS

---

## 📊 Exemple d'une requête qui fonctionne ✅

### Frontend (React)
```javascript
// src/utils/api.ts
const API_BASE_URL = "/api/v1";  // Relatif, donc https://www.infosconcours.sn/api/v1

// Appel API
const response = await fetch(`${API_BASE_URL}/concours/`);
```

### En production
```
GET /api/v1/concours/ HTTP/1.1
Host: www.infosconcours.sn
Origin: https://www.infosconcours.sn
```

### Nginx intercepte et envoie à Django
```
GET /api/v1/concours/ HTTP/1.1
Host: www.infosconcours.sn
X-Real-IP: 203.0.113.42
X-Forwarded-For: 203.0.113.42
X-Forwarded-Proto: https
```

### Django vérifie
```python
# 1. ALLOWED_HOSTS check
request.META['HTTP_HOST'] = 'www.infosconcours.sn'
'www.infosconcours.sn' in settings.ALLOWED_HOSTS  # ✅ True

# 2. CORS check
request.META['HTTP_ORIGIN'] = 'https://www.infosconcours.sn'
'https://www.infosconcours.sn' in settings.CORS_ALLOWED_ORIGINS  # ✅ True

# 3. Request processing
# Retourne les données JSON
```

### Réponse HTTP
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://www.infosconcours.sn
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "count": 5,
  "results": [
    {
      "id": "1",
      "title": "Concours ENA 2026",
      ...
    }
  ]
}
```

### Navigateur reçoit et affiche ✅
```
✅ CORS check: Access-Control-Allow-Origin = https://www.infosconcours.sn
✅ Données affichées correctement
```

---

## ❌ Exemples d'erreurs et leurs causes

### Erreur 1: DisallowedHost
```
Invalid HTTP_HOST header: 'www.infosconcours.sn'
```
**Cause**: `www.infosconcours.sn` ∉ ALLOWED_HOSTS  
**Fix**: Ajouter dans backend/.env.production

### Erreur 2: CORS bloqué
```
Access to XMLHttpRequest at 'https://www.infosconcours.sn/api/v1/concours/' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' 
header in the response must not be the wildcard '*' when the request's 
credentials mode (include) is 'include'.
```
**Cause**: `https://www.infosconcours.sn` ∉ CORS_ALLOWED_ORIGINS  
**Fix**: Ajouter dans backend/.env.production

### Erreur 3: CSRF token (POST)
```
CSRF verification failed. Request aborted.
```
**Cause**: `https://www.infosconcours.sn` ∉ CSRF_TRUSTED_ORIGINS  
**Fix**: Ajouter dans backend/.env.production

---

## 📋 Vérifier que tout fonctionne

### 1. Sur le VPS, depuis le terminal
```bash
# Tester que Django accepte le domaine
curl -H "Host: www.infosconcours.sn" \
     http://127.0.0.1:8000/api/v1/concours/

# Résultat attendu:
# HTTP/1.1 200 OK
# [JSON data]
```

### 2. Depuis le navigateur
```
1. Ouvrir https://www.infosconcours.sn
2. Ouvrir F12 → Network
3. Interagir avec la page (ex: cliquer sur "Concours")
4. Chercher une requête GET /api/v1/concours/
5. Vérifier Status: 200 OK ✅
```

### 3. Dans Django shell
```bash
python manage.py shell
>>> from django.conf import settings
>>> print("DEBUG:", settings.DEBUG)  # False
>>> print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
>>> print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
```

---

## 🎯 Configuration finale complète

Votre stack en production:

```
Frontend (React/Vite)
  ↓ VITE_API_URL=/api/v1
Nginx + SSL
  ↓ proxy_pass http://127.0.0.1:8000
Django (Gunicorn)
  ✅ ALLOWED_HOSTS = infosconcours.sn,www.infosconcours.sn
  ✅ CORS_ALLOWED_ORIGINS = https://infosconcours.sn,https://www.infosconcours.sn
  ✅ CSRF_TRUSTED_ORIGINS = https://infosconcours.sn,https://www.infosconcours.sn
  ↓
PostgreSQL
```

---

**Status**: ✅ Configuration production-ready et complètement opérationnelle
