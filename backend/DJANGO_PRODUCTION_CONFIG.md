# Configuration Django en Production - Documentation

## 🔴 Problème résolu

**Erreur**: `DisallowedHost: Invalid HTTP_HOST header: 'www.infosconcours.sn'`

**Cause**: Les domaines `infosconcours.sn` et `www.infosconcours.sn` n'étaient pas dans `ALLOWED_HOSTS`

**Solution**: Configurer les variables d'environnement pour accepter les domaines

---

## ⚙️ Configuration pour votre VPS

### Étape 1 : Copier le fichier .env.production

```bash
# Sur votre VPS, dans le dossier backend/
cp .env.production .env
# OU si vous préférez garder séparé:
# Renommer en .env et Django le chargera automatiquement
```

### Étape 2 : Configurer les valeurs dans .env

```bash
# Éditer /var/www/backend/.env (ou votre chemin)
nano .env
```

Remplacer les valeurs suivantes :

```env
# ========================================
# Sécurité
# ========================================
DEBUG=False
SECRET_KEY=REMPLACER_PAR_VOTRE_CLE  # Voir section "Générer une SECRET_KEY"

# ========================================
# Domaines (ce qui résout votre erreur)
# ========================================
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
CORS_ALLOWED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
CSRF_TRUSTED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn

# ========================================
# Base de données
# ========================================
DB_NAME=infos_concours
DB_USER=infos_concours
DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE_BD
DB_HOST=127.0.0.1
DB_PORT=5432
```

---

## 🔑 Générer une SECRET_KEY sécurisée

```bash
# Sur le serveur, dans le virtualenv Django
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Exemple de résultat:
# ^k4m)f+7i^pq@!z5@zk9$^-3-7b7k*9-z@9^0lj_b8_-@0v@

# Copier cette clé dans SECRET_KEY dans .env
```

---

## 📋 Vue d'ensemble de la configuration

### ALLOWED_HOSTS

**Qu'est-ce que c'est**: Liste des domaines autorisés à accéder à Django

**Valeur pour votre cas**:
```
infosconcours.sn,www.infosconcours.sn
```

**Format**: Domaines séparés par des virgules, SANS `http://` ni `https://`

**Pourquoi c'est important**: Django refuse les requêtes avec un `Host` header invalide par sécurité

### CORS_ALLOWED_ORIGINS

**Qu'est-ce que c'est**: Liste des origins autorisées pour les requêtes cross-origin (JavaScript)

**Valeur pour votre cas**:
```
https://infosconcours.sn,https://www.infosconcours.sn
```

**Format**: URLs complètes avec protocole HTTPS, domaines séparés par des virgules

**Pourquoi c'est important**: 
- Le frontend fait des requêtes AJAX à `/api/v1/...`
- Le navigateur vérifie que le domaine du frontend est autorisé
- Sans cette config, vous auriez des erreurs CORS

### CSRF_TRUSTED_ORIGINS

**Qu'est-ce que c'est**: Domaines autorisés pour les tokens CSRF

**Valeur pour votre cas**:
```
https://infosconcours.sn,https://www.infosconcours.sn
```

**Format**: Même format que CORS

**Pourquoi c'est important**: Django protège contre les attaques CSRF avec des tokens

---

## 🏗️ Architecture du déploiement

```
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur via navigateur (https://www.infosconcours.sn)  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Request
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ Nginx (port 80/443)                                          │
│ ✅ Accepte www.infosconcours.sn & infosconcours.sn         │
├──────────────────────────────────────────────────────────────┤
│ location / {                                                 │
│     root /var/www/frontend-build;                           │
│     try_files $uri /index.html;                             │
│ }                                                            │
├──────────────────────────────────────────────────────────────┤
│ location /api {                                              │
│     proxy_pass http://127.0.0.1:8000;                       │
│ }                                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ 127.0.0.1:8000
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ Django (Gunicorn sur 127.0.0.1:8000)                         │
│ ✅ ALLOWED_HOSTS = infosconcours.sn,www.infosconcours.sn   │
│ ✅ CORS_ALLOWED_ORIGINS = https://infosconcours.sn,...     │
│ ✅ CSRF_TRUSTED_ORIGINS = https://infosconcours.sn,...     │
└──────────────────────────────────────────────────────────────┘
```

**Points clés**:
1. Nginx reçoit les requêtes pour `www.infosconcours.sn`
2. Nginx envoie au serveur Django interne (`127.0.0.1:8000`)
3. Django vérifie le `Host` header contre `ALLOWED_HOSTS` ✅
4. Django autorise les requêtes API du frontend ✅

---

## 🧪 Vérification de la configuration

Après déploiement, tester sur le VPS:

### 1. Vérifier que .env est chargé
```bash
cd /var/www/backend
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DEBUG)  # Doit être False
>>> print(settings.ALLOWED_HOSTS)  # Doit contenir votre domaine
```

### 2. Tester localement depuis le VPS
```bash
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/
# Résultat attendu: 200 OK (liste des concours)
```

### 3. Tester depuis votre navigateur
```
Ouvrir: https://www.infosconcours.sn
Ouvrir la console (F12 → Network)
Cliquer sur une action qui appelle l'API
Vérifier que le statut HTTP est 200 ✅
```

---

## 🔐 Sécurité

### Configuration en production (déjà incluse)

```python
DEBUG = False                          # Pas de debug en prod
SECURE_SSL_REDIRECT = True             # Force HTTPS
SESSION_COOKIE_SECURE = True           # Cookies en HTTPS only
CSRF_COOKIE_SECURE = True              # CSRF token en HTTPS only
SECURE_HSTS_SECONDS = 31536000        # HSTS 1 an
SECURE_HSTS_INCLUDE_SUBDOMAINS = True # HSTS sur subdomaines
```

### Checklist de sécurité

- ✅ `DEBUG = False` dans `.env.production`
- ✅ `SECRET_KEY` générée (unique, complexe)
- ✅ `ALLOWED_HOSTS` restreint à vos domaines
- ✅ HTTPS activé (certificat SSL)
- ✅ CORS restreint à vos domaines
- ✅ CSRF_TRUSTED_ORIGINS restreint à vos domaines
- ⚠️ À faire: Rate limiting sur `/api/auth/login/`
- ⚠️ À faire: Configurer Email pour notifications

---

## ❌ Erreurs courantes et solutions

### Erreur: DisallowedHost

```
Invalid HTTP_HOST header: 'www.infosconcours.sn'. You may need to add this to ALLOWED_HOSTS.
```

**Solution**:
```bash
# Vérifier le fichier .env
cat .env | grep ALLOWED_HOSTS

# Doit contenir:
# ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn

# Relancer Django
systemctl restart gunicorn  # ou votre commande
```

### Erreur: CORS bloqué

```
Access to XMLHttpRequest at 'https://...' has been blocked by CORS policy
```

**Solution**:
```python
# Vérifier dans Django shell
python manage.py shell
>>> from django.conf import settings
>>> print(settings.CORS_ALLOWED_ORIGINS)

# Doit contenir votre domaine avec https://
```

### Erreur: CSRF token

```
CSRF verification failed. Request aborted.
```

**Solution**:
```python
# Vérifier CSRF_TRUSTED_ORIGINS
python manage.py shell
>>> from django.conf import settings
>>> print(settings.CSRF_TRUSTED_ORIGINS)

# Doit contenir votre domaine avec https://
```

---

## 📦 Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `backend/.env.production` | ✅ Créé - Configuration pour VPS |
| `backend/env.example` | ✅ Amélioré - Documentation complète |
| `backend/config/settings.py` | ✅ Amélioré - Gestion robuste des domaines |

---

## 🚀 Prochaines étapes

1. **Sur votre local** (développement):
   - Continue à utiliser `DEBUG=True`
   - Créer/configurer `backend/.env` pour dev

2. **Sur votre VPS** (production):
   - Copier `.env.production` → `.env`
   - Générer une `SECRET_KEY` sécurisée
   - Configurer les variables dans `.env`
   - Relancer Django (Gunicorn/systemd)

3. **Tester**:
   - Accédez à `https://www.infosconcours.sn`
   - Ouvrez la console du navigateur
   - Vérifiez que les appels API réussissent ✅

---

**Status**: 🟢 Configuration production-ready
