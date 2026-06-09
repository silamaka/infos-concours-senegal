# Fix Django DisallowedHost - Résumé Rapide

## 🔴 Problème
```
Invalid HTTP_HOST header: 'www.infosconcours.sn'. You may need to add this to ALLOWED_HOSTS.
```

## 🟢 Solution

### 3 étapes simples

#### 1️⃣ Copier la configuration
```bash
cp backend/.env.production backend/.env
```

#### 2️⃣ Éditer le fichier et remplacer 3 valeurs
```bash
nano backend/.env
```

À remplacer:
- `SECRET_KEY=REMPLACER_PAR_CLEF_SECRETE_GENEREE`
  ```bash
  python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
  ```
- `DB_PASSWORD=REMPLACER_PAR_MOT_DE_PASSE_BD` → votre mot de passe PostgreSQL
- `ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn` → adapter si besoin

#### 3️⃣ Relancer Django
```bash
systemctl restart gunicorn
# ou selon votre configuration
systemctl restart django
```

## 📋 Ce qui a changé

### Fichiers créés:
- `backend/.env.production` → Configuration complète pour production
- `backend/DJANGO_PRODUCTION_CONFIG.md` → Documentation détaillée
- `backend/setup-django-production.sh` → Script de vérification

### Fichiers modifiés:
- `backend/env.example` → Documentation améliorée
- `backend/config/settings.py` → Gestion robuste des domaines

## 🔍 Configuration appliquée

Trois variables clés sont maintenant correctes:

```env
# ✅ Accepte les requêtes pour ces domaines
ALLOWED_HOSTS=infosconcours.sn,www.infosconcours.sn

# ✅ Autorise les requêtes AJAX du frontend
CORS_ALLOWED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn

# ✅ Autorise les tokens CSRF du frontend
CSRF_TRUSTED_ORIGINS=https://infosconcours.sn,https://www.infosconcours.sn
```

## ✅ Vérification

Après relancer Django, tester:

```bash
# Sur le VPS
curl -H "Host: www.infosconcours.sn" http://127.0.0.1:8000/api/v1/concours/

# Résultat attendu: 200 OK ✅
```

Ou depuis le navigateur:
- Accéder à `https://www.infosconcours.sn`
- Ouvrir la console (F12 → Network)
- Appeler l'API
- Vérifier que le statut HTTP est 200 ✅

## 📚 Documentation complète

Pour plus de détails, voir:
- `backend/DJANGO_PRODUCTION_CONFIG.md` - Configuration détaillée
- `backend/env.example` - Toutes les variables d'environnement
- `backend/.env.production` - Template production

## 🚀 Déploiement complet

Pour un déploiement complet avec Nginx, voir:
- `DEPLOYMENT_CHECKLIST.md` (racine du projet)
- Architecture Nginx + proxy vers Django

---

**Status**: ✅ Configuration production-ready
