# ⚡ Action Rapide: Corriger Error 413 + Error 401

## 🎯 Objectif

Corriger les deux erreurs pour pouvoir uploader des images/PDFs:
```
❌ Error 413: Request Entity Too Large
❌ Error 401: Unauthorized
```

---

## ✅ Ce qui a été fait (en local)

```bash
✅ backend/config/settings.py - Limites augmentées à 50 MB
✅ FIX_UPLOAD_ERRORS.md - Guide complet des corrections
✅ test-upload-files.sh - Script de test
```

---

## 🚀 Actions pour le VPS (4 étapes - 5 min)

### 1️⃣ Pull le dernier code

```bash
cd /var/www/backend
git pull origin main
```

### 2️⃣ Redémarrer Django (pour les limites Django)

```bash
systemctl restart gunicorn
```

### 3️⃣ Configurer Nginx (ajouter la limite)

```bash
sudo nano /etc/nginx/sites-available/infosconcours.sn
```

**Ajouter cette ligne** à l'intérieur du bloc `server { }`:

```nginx
server {
    listen 443 ssl http2;
    server_name infosconcours.sn www.infosconcours.sn;

    # ✅ AJOUTER CETTE LIGNE:
    client_max_body_size 50M;

    # ... le reste ...
}
```

**Sauvegarder**: Ctrl+O → Enter → Ctrl+X

### 4️⃣ Redémarrer Nginx

```bash
sudo nginx -t  # Vérifier la config

# Si OK:
sudo systemctl restart nginx
```

---

## ✅ Vérification

### Test 1: Erreur 413 disparue?

```bash
# Sur le VPS
curl -X POST \
  -F "file=@/tmp/test.jpg" \
  http://127.0.0.1:8000/api/v1/admin/upload/image/

# Résultat:
# ✅ 401 Unauthorized (c'est ok, c'est le 401 attendu)
# ❌ 413 Request Entity Too Large (problème Nginx/Django)
```

### Test 2: Depuis le navigateur

```
1. Accédez à https://www.infosconcours.sn/admin
2. Assurez-vous d'être connecté en tant qu'ADMIN
3. Cliquez sur "Annales" → "Ajouter"
4. Sélectionnez une image
5. Ouvrir F12 → Network
6. Cliquez sur le bouton d'upload
7. Chercher: POST /api/v1/admin/upload/image/
8. Status doit être: 200 OK ✅
```

**Si encore 413**: 
- Vérifier que `client_max_body_size 50M` est bien dans Nginx
- Vérifier que Nginx a été redémarré
- Relancer: `sudo systemctl restart nginx`

**Si encore 401**:
- Vérifier que vous êtes connecté
- Vérifier que votre user a le rôle ADMIN:
  ```bash
  python manage.py shell
  >>> from django.contrib.auth import get_user_model
  >>> User = get_user_model()
  >>> user = User.objects.get(email='votre@email.com')
  >>> print(user.role)  # Doit afficher: ADMIN
  ```

---

## 📋 Checklist

- [ ] Pull le code: `git pull origin main`
- [ ] Redémarrer Django: `systemctl restart gunicorn`
- [ ] Éditer Nginx: `sudo nano /etc/nginx/sites-available/infosconcours.sn`
- [ ] Ajouter: `client_max_body_size 50M;`
- [ ] Vérifier: `sudo nginx -t`
- [ ] Redémarrer Nginx: `sudo systemctl restart nginx`
- [ ] Tester l'upload depuis le navigateur ✅

---

## 🆘 Si ça ne fonctionne pas

### Diagnostic complet
```bash
cd /var/www/backend
bash test-upload-files.sh
```

### Vérifications manuelles

**Vérifier Django**:
```bash
python manage.py shell
>>> from django.conf import settings
>>> print("FILE_UPLOAD_MAX_MEMORY_SIZE:", settings.FILE_UPLOAD_MAX_MEMORY_SIZE)
>>> print("DATA_UPLOAD_MAX_MEMORY_SIZE:", settings.DATA_UPLOAD_MAX_MEMORY_SIZE)
```

**Vérifier Nginx**:
```bash
sudo grep "client_max_body_size" /etc/nginx/sites-available/infosconcours.sn
# Doit afficher: client_max_body_size 50M;
```

**Vérifier l'utilisateur**:
```bash
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> for u in User.objects.filter(role='ADMIN'):
...     print(f"✅ ADMIN: {u.email}")
```

---

## 📚 Documentation complète

Pour plus de détails:
- `FIX_UPLOAD_ERRORS.md` - Guide détaillé
- `NGINX_UPLOAD_CONFIG.md` - Configuration Nginx complète
- `test-upload-files.sh` - Script de test

---

**Status**: 🟢 Configuration prête sur GitHub - À déployer sur VPS

---

## ⏱️ Temps estimé

**Avant**: Error 413/401, impossible d'uploader  
**Après correction**: 5-10 minutes ✅

Bonne chance! 🚀
