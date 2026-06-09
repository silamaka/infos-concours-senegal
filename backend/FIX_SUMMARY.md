# 🎯 Résumé: Corriger l'erreur DisallowedHost sur votre VPS

## 📍 Situation

L'erreur **DisallowedHost** signifie que votre domaine `www.infosconcours.sn` n'est pas accepté par Django.

```
❌ DisallowedHost: Invalid HTTP_HOST header: 'www.infosconcours.sn'
```

**Cause racine**: Le fichier `.env` sur le VPS ne contient pas la configuration correcte, OU Django n'a pas été redémarré après les changements.

---

## 🔧 Correction (3 actions simples)

### Action 1️⃣: Copier la configuration de production sur le VPS

SSH sur votre VPS:
```bash
ssh user@VPS_IP
cd /var/www/backend  # adapter votre chemin
cp .env.production .env
```

### Action 2️⃣: Éditer .env et remplacer 2 valeurs

```bash
nano .env
```

Trouver et remplacer:

```env
# 1️⃣ Remplacer ceci:
SECRET_KEY=REMPLACER_PAR_CLEF_SECRETE_GENEREE

# Par le résultat de cette commande:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
# Exemple: SECRET_KEY=^k4m)f+7i^pq@!z5@zk9$^-3-7b7k*9-z@9^0lj_b8_

# 2️⃣ Remplacer ceci:
DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE_BD

# Par votre mot de passe PostgreSQL
```

**Vérifier les domaines** (ces lignes doivent être correctes):
```env
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
CORS_ALLOWED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
CSRF_TRUSTED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
DEBUG=False
```

Sauvegarder: **Ctrl+O** → Enter → **Ctrl+X**

### Action 3️⃣: Redémarrer Django

```bash
systemctl restart gunicorn
```

Attendre 2-3 secondes, puis vérifier:
```bash
systemctl status gunicorn
```

Doit afficher: `active (running) ✅`

---

## ✅ Vérification: L'erreur est-elle corrigée?

### Test 1: Depuis le terminal (sur le VPS)
```bash
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/
```

**Résultat attendu**: 
```json
{
  "count": X,
  "results": [...]
}
```

**Si encore l'erreur DisallowedHost**:
```
DisallowedHost: Invalid HTTP_HOST header
```

→ Allez à la section "Troubleshooting" ci-dessous

### Test 2: Depuis le navigateur
1. Accédez à `https://www.infosconcours.sn`
2. Ouvrir **F12** → **Network**
3. Cliquer sur "Concours" ou une page qui appelle l'API
4. Chercher une requête `/api/v1/...`
5. Vérifier que le **Status** est **200** ✅

---

## 🆘 Troubleshooting

### Problème: DisallowedHost persiste

**Diagnostic**:
```bash
cd /var/www/backend
bash diagnose-disallowed-host.sh
```

Cela affichera l'état exact et les actions à faire.

**Solutions courantes**:

**1. .env n'existe pas**
```bash
ls -la .env
# Si le fichier n'existe pas:
cp .env.production .env
```

**2. ALLOWED_HOSTS ne contient pas le domaine**
```bash
grep "ALLOWED_HOSTS=" .env
# Doit afficher: ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn
```

**3. Gunicorn n'a pas été redémarré**
```bash
systemctl restart gunicorn
sleep 3
systemctl status gunicorn
```

**4. DEBUG est toujours True**
```bash
grep "DEBUG=" .env
# Doit être: DEBUG=False
```

---

## 📁 Documentation complète

Pour plus de détails, voir les fichiers disponibles:

| Fichier | Purpose |
|---------|---------|
| `IMMEDIATE_FIX_DISALLOWED_HOST.md` | Guide complet avec toutes les vérifications |
| `DJANGO_PRODUCTION_CONFIG.md` | Configuration Django détaillée |
| `API_REQUEST_FLOW.md` | Comprendre le flux des requêtes API |
| `diagnose-disallowed-host.sh` | Script de diagnostic automatique |
| `.env.production` | Configuration template pour production |

---

## 📋 Résumé des fichiers modifiés/créés

### ✅ Fichiers déjà en production (à deployer)
- `backend/.env.production` - Configuration pour VPS
- `backend/config/settings.py` - Configuration Django améliorée
- `backend/env.example` - Documentation des variables

### ✅ Fichiers de guidance/debug (utiles sur VPS)
- `backend/IMMEDIATE_FIX_DISALLOWED_HOST.md` - Guide action immédiate
- `backend/DJANGO_PRODUCTION_CONFIG.md` - Documentation complète
- `backend/API_REQUEST_FLOW.md` - Flux des requêtes
- `backend/QUICK_FIX_DISALLOWED_HOST.md` - Résumé rapide
- `backend/diagnose-disallowed-host.sh` - Script de diagnostic

---

## 🚀 Après la correction

Une fois l'erreur résolue:

1. **Tester l'API** depuis le navigateur ✅
2. **Vérifier les logs** s'il y a d'autres erreurs
   ```bash
   journalctl -u gunicorn -f
   ```
3. **Vérifier Nginx** redirige correctement
   ```bash
   sudo nginx -t
   ```
4. **Tester depuis un navigateur** incognito (pas de cache)

---

## 🔐 Sécurité - Rappel

**IMPORTANT**: 
- `SECRET_KEY` doit être unique et complexe (générer avec Python)
- `DEBUG` doit être `False` en production
- `ALLOWED_HOSTS` doit être restreint à vos domaines uniquement
- Utiliser HTTPS (SSL) en production

---

## 📞 Besoin d'aide?

Si la correction ne fonctionne pas:

1. Exécuter le diagnostic:
   ```bash
   cd /var/www/backend
   bash diagnose-disallowed-host.sh
   ```

2. Partager la sortie de:
   ```bash
   journalctl -u gunicorn -n 100
   ```

3. Ou consulter les autres documents de configuration

---

**Last Updated**: 2026-06-09  
**Status**: 🟢 Configuration ready to deploy
