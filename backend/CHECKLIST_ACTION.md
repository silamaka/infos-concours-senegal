# 📋 Checklist Action: Corriger DisallowedHost sur VPS

## 🎯 Objectif
Corriger l'erreur:
```
DisallowedHost: Invalid HTTP_HOST header: 'www.infosconcours.sn'
```

**Temps estimé**: 5 minutes

---

## ✅ Actions à effectuer (à cocher au fur et à mesure)

### 1️⃣ SSH sur le VPS
```bash
[ ] ssh user@VPS_IP
[ ] cd /var/www/backend  # adapter le chemin
```

### 2️⃣ Copier la configuration
```bash
[ ] cp .env.production .env
```

### 3️⃣ Éditer .env
```bash
[ ] nano .env
```

**Dans l'éditeur**, trouver et remplacer:

#### SECRET_KEY
```env
Chercher: SECRET_KEY=REMPLACER_PAR_CLEF_SECRETE_GENEREE

Remplacer par (générer d'abord):
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

[ ] SECRET_KEY = [clé générée]
```

#### DB_PASSWORD
```env
Chercher: DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE_BD

Remplacer par votre mot de passe PostgreSQL:
[ ] DB_PASSWORD = [votre password]
```

#### Vérifier les domaines
```env
[ ] ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
[ ] CORS_ALLOWED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
[ ] CSRF_TRUSTED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
```

#### Vérifier le mode
```env
[ ] DEBUG=False
```

**Sauvegarder**: Ctrl+O → Enter → Ctrl+X

### 4️⃣ Redémarrer Django
```bash
[ ] systemctl restart gunicorn
[ ] sleep 3
```

### 5️⃣ Vérifier le statut
```bash
[ ] systemctl status gunicorn
```

**Résultat attendu**: `active (running)` ✅

### 6️⃣ Tester l'API
```bash
[ ] curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/
```

**Résultat attendu**: 
```json
{
  "count": X,
  "results": [...]
}
```

❌ Si encore l'erreur DisallowedHost → Aller à "Troubleshooting"

### 7️⃣ Tester depuis le navigateur
```
[ ] Accédez à https://www.infosconcours.sn
[ ] Ouvrir F12 → Network
[ ] Cliquer sur une page (ex: Concours)
[ ] Vérifier une requête /api/v1/... → Status 200 OK ✅
```

---

## 🆘 Troubleshooting

### Si DisallowedHost persiste:

```bash
# 1. Exécuter le diagnostic
[ ] bash diagnose-disallowed-host.sh

# 2. Vérifier que .env existe
[ ] ls -la .env

# 3. Vérifier ALLOWED_HOSTS
[ ] grep "ALLOWED_HOSTS=" .env

# 4. Vérifier DEBUG
[ ] grep "DEBUG=" .env

# 5. Vérifier les logs
[ ] journalctl -u gunicorn -n 50

# 6. Redémarrer Gunicorn
[ ] systemctl restart gunicorn

# 7. Attendre et retester
[ ] sleep 5
[ ] curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/
```

### Si SECRET_KEY invalide:
```bash
[ ] python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
[ ] nano .env  # remplacer SECRET_KEY
[ ] systemctl restart gunicorn
```

### Si Gunicorn n'est pas actif:
```bash
[ ] systemctl status gunicorn
[ ] systemctl start gunicorn
[ ] systemctl status gunicorn  # doit dire "active (running)"
```

### Si Nginx redirige mal:
```bash
[ ] sudo nginx -t
[ ] Vérifier /etc/nginx/sites-available/infosconcours.sn:
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;  # ← Important!
    }
[ ] sudo systemctl restart nginx
```

---

## 📁 Documents de référence

En cas de besoin, consulter:

| Document | Utilité |
|----------|---------|
| `FIX_SUMMARY.md` | 📌 Résumé rapide (cette page) |
| `IMMEDIATE_FIX_DISALLOWED_HOST.md` | 📖 Guide complet avec explications |
| `DJANGO_PRODUCTION_CONFIG.md` | 📚 Documentation détaillée |
| `API_REQUEST_FLOW.md` | 🔄 Comprendre le flux des requêtes |
| `diagnose-disallowed-host.sh` | 🔍 Script de diagnostic auto |

---

## 🎉 Succès!

Une fois que le statut est **200 OK**:

```
✅ DisallowedHost résolu
✅ API fonctionnelle
✅ Production operational
```

Bravo! 🚀

---

## 📝 Notes personnelles

```
Date de correction: _______________
Problème: DisallowedHost
Solution appliquée: [décrire en 2 lignes]
Résultat: ✅ Fonctionnel / ❌ Toujours en erreur
```

---

**Last Updated**: 2026-06-09
