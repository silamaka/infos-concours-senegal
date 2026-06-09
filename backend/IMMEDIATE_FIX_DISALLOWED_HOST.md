# 🚨 URGENT - Résoudre l'erreur DisallowedHost en production

## État du problème

```
❌ DisallowedHost: Invalid HTTP_HOST header: 'www.infosconcours.sn'
```

**Cause**: Le fichier `.env` sur le VPS ne contient pas les bons paramètres, OU Django n'a pas été redémarré après la mise à jour.

---

## ⚡ Solution rapide (5 minutes)

### Étape 1: SSH sur votre VPS
```bash
ssh user@www.infosconcours.sn
# ou
ssh user@IP_VPS
```

### Étape 2: Aller au dossier backend
```bash
cd /var/www/backend
# ou votre chemin personnalisé
```

### Étape 3: Exécuter le diagnostic
```bash
bash diagnose-disallowed-host.sh
```

Cela affichera l'état exact de la configuration et les actions à effectuer.

### Étape 4: Si .env n'existe pas
```bash
# Vérifier que .env.production existe
ls -la .env.production

# Copier la configuration
cp .env.production .env

# Éditer les valeurs à remplacer
nano .env
```

Remplacer:
```env
SECRET_KEY=REMPLACER_PAR_CLEF_SECRETE_GENEREE
→ Générer avec: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE_BD
→ Votre mot de passe PostgreSQL
```

### Étape 5: Redémarrer Django
```bash
systemctl restart gunicorn
# ou selon votre configuration:
# service gunicorn restart
# supervisorctl restart gunicorn
```

### Étape 6: Vérifier que ça fonctionne
```bash
# Tester l'API
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/

# Résultat attendu:
# HTTP/1.1 200 OK
# [JSON data]
```

---

## 📋 Checklist détaillée

### ✅ Vérification 1: .env existe
```bash
ls -la .env
```
**Résultat attendu**: Le fichier existe avec les droits `-rw-r--r--`

**Si absent**:
```bash
cp .env.production .env
```

---

### ✅ Vérification 2: DEBUG est False
```bash
grep "^DEBUG=" .env
```
**Résultat attendu**: `DEBUG=False`

**Si True**: Éditer .env et remplacer `DEBUG=True` par `DEBUG=False`

---

### ✅ Vérification 3: ALLOWED_HOSTS contient les domaines
```bash
grep "^ALLOWED_HOSTS=" .env
```
**Résultat attendu**:
```
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
```

**Si absent ou incomplet**:
```bash
nano .env
# Ajouter ou corriger:
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
```

---

### ✅ Vérification 4: SECRET_KEY configurée
```bash
grep "^SECRET_KEY=" .env
```
**Résultat attendu**: Une clé longue et complexe, PAS `REMPLACER_PAR_...`

**Si REMPLACER_PAR_...**:
```bash
# Générer une nouvelle clé
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Copier la sortie et éditer .env
nano .env
# Remplacer SECRET_KEY=REMPLACER_PAR_... par la clé générée
```

---

### ✅ Vérification 5: Django en Python
```bash
python manage.py shell
>>> from django.conf import settings
>>> print("DEBUG:", settings.DEBUG)
>>> print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
>>> print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
>>> exit()
```

**Résultat attendu**:
```
DEBUG: False
ALLOWED_HOSTS: ['infosconcours.sn', 'www.infosconcours.sn']
CORS_ALLOWED_ORIGINS: ['https://infosconcours.sn', 'https://www.infosconcours.sn']
```

---

### ✅ Vérification 6: Gunicorn redémarré
```bash
systemctl status gunicorn
```

**Résultat attendu**: `active (running)`

**Si pas actif**:
```bash
systemctl restart gunicorn
sleep 2
systemctl status gunicorn
```

---

### ✅ Vérification 7: Tester l'API
```bash
# Test basique
curl http://127.0.0.1:8000/api/v1/concours/

# Résultat: DisallowedHost ou 200 OK

# Tester avec le bon Host header
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/

# Résultat attendu: 200 OK + JSON
```

---

## 🔍 Troubleshooting

### Erreur: DisallowedHost persiste
```bash
# 1. Vérifier que Gunicorn a chargé le nouveau .env
systemctl restart gunicorn
sleep 3

# 2. Vérifier les logs
journalctl -u gunicorn -n 50

# 3. Vérifier la configuration Django
python manage.py shell -c "from django.conf import settings; print(settings.ALLOWED_HOSTS)"

# 4. Si toujours en erreur: Redémarrer le serveur
sudo reboot
```

### Erreur: SECRET_KEY invalide
```
ImproperlyConfigured: SECRET_KEY must be set in production
```

**Solution**:
```bash
# Générer une clé
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Copier dans .env
nano .env
# SECRET_KEY=VOTRE_CLE_GENEREE

# Redémarrer
systemctl restart gunicorn
```

### Erreur: Nginx redirige mal
```
Vérifier que Nginx envoie le bon Host header à Django
```

**Solution** (dans `/etc/nginx/sites-available/infosconcours.sn`):
```nginx
location /api {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;  # ✅ Important!
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Puis redémarrer Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📝 Commandes à copier-coller

Si vous êtes pressé, voici les commandes à exécuter séquentiellement:

```bash
# 1. Aller au dossier backend
cd /var/www/backend

# 2. Copier la config
cp .env.production .env

# 3. Éditer .env (remplacer les valeurs)
nano .env

# 4. Redémarrer Django
systemctl restart gunicorn

# 5. Attendre 2 secondes
sleep 2

# 6. Vérifier que c'est ok
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/

# 7. Vérifier les logs si erreur
journalctl -u gunicorn -f
```

---

## ✅ Validation finale

Accédez à `https://www.infosconcours.sn` dans votre navigateur:

1. Ouvrir **F12** (DevTools)
2. Aller à l'onglet **Network**
3. Cliquer sur un bouton qui appelle l'API (ex: "Concours")
4. Chercher une requête `GET /api/v1/concours/`
5. Vérifier le **Status**: doit être **200 OK** ✅

Si vous voyez **200 OK**, c'est résolu! 🎉

Si vous voyez une erreur ou une page d'erreur Django, exécutez:
```bash
journalctl -u gunicorn -n 100
```

---

## 📞 Si ça ne fonctionne toujours pas

Exécuter le diagnostic complet:
```bash
bash /var/www/backend/diagnose-disallowed-host.sh
```

Et me montrer la sortie - je pourrai identifier exactement le problème.

---

**Status**: 🟡 En attente de déploiement sur VPS
