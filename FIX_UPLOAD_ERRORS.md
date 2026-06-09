# 🔧 Correction: Error 413 + Error 401 - Upload fichiers

## 📍 État actuel

```
❌ Error 413: Request Entity Too Large (Nginx/Django limite trop petite)
❌ Error 401: Unauthorized (Token JWT manquant ou expiré)
```

---

## 🔴 Error 413: Request Entity Too Large

### Cause
Nginx et Django limitent la taille des uploads. Par défaut:
- **Nginx**: 1 MB (à augmenter)
- **Django**: 2.5 MB (à augmenter)

### Correction - 3 étapes

#### Étape 1: Augmenter la limite dans Django

✅ **Déjà fait dans le repo** → `backend/config/settings.py` contient:
```python
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50 MB
```

Sur le VPS, redémarrer Django:
```bash
systemctl restart gunicorn
```

#### Étape 2: Augmenter la limite dans Nginx

SSH sur votre VPS:
```bash
sudo nano /etc/nginx/sites-available/infosconcours.sn
```

**Ajouter cette ligne** (à l'intérieur du bloc `server { }` mais AVANT les `location { }`):

```nginx
server {
    listen 443 ssl http2;
    server_name infosconcours.sn www.infosconcours.sn;

    # ✅ AJOUTER CETTE LIGNE:
    client_max_body_size 50M;

    # ... reste de la configuration ...
}
```

**Position exacte** dans le fichier:
```nginx
server {
    listen 443 ssl http2;
    server_name infosconcours.sn www.infosconcours.sn;

    client_max_body_size 50M;  ← AJOUTER ICI

    ssl_certificate ...
    ssl_certificate_key ...

    location / { ... }
    location /api { ... }
}
```

#### Étape 3: Redémarrer Nginx

```bash
sudo nginx -t  # Vérifier la syntaxe

# Si OK:
sudo systemctl restart nginx
```

### Vérification
```bash
# Sur le VPS
curl -I https://www.infosconcours.sn/api/v1/admin/upload/image/

# Ou depuis le navigateur:
1. F12 → Network
2. Essayer d'uploader une image
3. Chercher la requête POST /api/v1/admin/upload/image/
4. Status doit être 413 → 200 après correction ✅
```

---

## 🟠 Error 401: Unauthorized

### Cause possible
Le token JWT n'est pas envoyé correctement lors de l'upload. Cela peut être:
1. Utilisateur non authentifié
2. Token expiré
3. Utilisateur n'a pas le rôle ADMIN
4. Token de refresh échoué

### Diagnostic

#### Test 1: Vérifier le token JWT

Dans la console du navigateur (F12):
```javascript
// Afficher le token stocké
console.log(localStorage.getItem('auth_token'));

// Doit afficher quelque chose comme:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Si vide**: L'utilisateur n'est pas connecté
- → Login d'abord avant d'essayer l'upload

**Si vaut quelque chose**: Token existe
- → Passer au test 2

#### Test 2: Vérifier le rôle de l'utilisateur

Dans la console:
```javascript
// Afficher les infos utilisateur
const token = localStorage.getItem('auth_token');
fetch('/api/v1/users/me/', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data));

// Résultat:
// { id: "...", role: "ADMIN", ... }
```

**Si role ≠ "ADMIN"**: L'utilisateur n'a pas les permissions
- → Contacter l'admin pour changer le rôle à ADMIN

#### Test 3: Tester l'API directement

Sur le VPS:
```bash
# Récupérer un token valide
python manage.py shell -c "
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.filter(role='ADMIN').first()
if user:
    refresh = RefreshToken.for_user(user)
    print('ACCESS:', refresh.access_token)
"

# Copier le token ACCESS et tester:
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg" \
  http://127.0.0.1:8000/api/v1/admin/upload/image/

# Résultat attendu: 200 OK
```

### Correction

#### Si utilisateur non connecté
```javascript
// Dans le navigateur, aller à /login et se connecter
// Puis relancer l'upload
```

#### Si utilisateur n'a pas ADMIN
```bash
# Sur le VPS
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> user = User.objects.get(email='votre@email.com')
>>> user.role = 'ADMIN'
>>> user.save()
>>> print(f"✅ {user.email} est maintenant ADMIN")
```

#### Si token expiré
Le frontend devrait automatiquement rafraîchir le token. Mais si ça ne fonctionne pas:

```javascript
// Dans la console du navigateur
localStorage.removeItem('auth_token');
localStorage.removeItem('refresh_token');

// Puis relancer le login
// Rediriger à /login
window.location.href = '/login';
```

---

## 🧪 Test Complet: Upload fichier

### Avant le test
```
✅ Nginx: client_max_body_size = 50M
✅ Django: FILE_UPLOAD_MAX_MEMORY_SIZE = 50M
✅ Utilisateur: Connecté
✅ Utilisateur: Role = ADMIN
✅ Token: Valide et dans localStorage
```

### Test dans le navigateur
```
1. Aller à https://www.infosconcours.sn/admin
2. Cliquer sur "Annales"
3. Cliquer sur "Ajouter une annale"
4. Sélectionner une image (< 50 MB)
5. Ouvrir F12 → Network
6. Cliquer sur le bouton d'upload
7. Chercher la requête POST /api/v1/admin/upload/image/
8. Status doit être 200 OK ✅
```

**Si encore 413**:
- Vérifier que le redémarrage de Nginx a bien eu lieu
- Vérifier que `client_max_body_size 50M` est bien dans la config
- Redémarrer Nginx: `sudo systemctl restart nginx`

**Si encore 401**:
- Vérifier le token dans localStorage
- Vérifier le rôle de l'utilisateur
- Relancer le login

---

## 📋 Checklist Finale

### Nginx (sur le VPS)
- [ ] Ajouter `client_max_body_size 50M;` dans `/etc/nginx/sites-available/infosconcours.sn`
- [ ] Exécuter `sudo nginx -t`
- [ ] Redémarrer: `sudo systemctl restart nginx`

### Django (sur le VPS)
- [ ] Récupérer le dernier code du repo (pull)
- [ ] Redémarrer: `systemctl restart gunicorn`

### Utilisateur (dans le navigateur)
- [ ] Vérifier que vous êtes connecté
- [ ] Vérifier que vous avez le rôle ADMIN
- [ ] Essayer l'upload à nouveau

### Vérification
- [ ] Error 413 → disparue ✅
- [ ] Error 401 → disparue ✅
- [ ] Image uploadée avec succès ✅

---

## 🆘 Si ça ne fonctionne toujours pas

### Pour Error 413 (après les corrections)
```bash
# Sur le VPS
curl -I https://www.infosconcours.sn/

# Chercher le header:
# server: nginx/1.18.0

# Vérifier la config Nginx:
sudo grep "client_max_body_size" /etc/nginx/sites-available/*

# Doit afficher:
# client_max_body_size 50M;

# Sinon, éditer le fichier:
sudo nano /etc/nginx/sites-available/infosconcours.sn
```

### Pour Error 401
```bash
# Sur le VPS, vérifier les utilisateurs
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> for u in User.objects.all():
...     print(f"{u.email} - Role: {u.role}")

# Créer un utilisateur ADMIN si besoin:
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.create_superuser(
...     email='admin@example.com',
...     password='strong_password',
...     first_name='Admin',
...     last_name='User'
... )
```

---

## 📚 Fichiers concernés

| Fichier | Modification |
|---------|-------------|
| `backend/config/settings.py` | ✅ Limites fichier ajoutées |
| `/etc/nginx/sites-available/infosconcours.sn` | ⚠️ À ajouter: `client_max_body_size 50M` |
| `src/utils/api.ts` | ✅ Upload functions OK |

---

**Status**: 🟡 Corrections prêtes à déployer
