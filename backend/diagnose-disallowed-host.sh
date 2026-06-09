#!/bin/bash
# Diagnostic DisallowedHost - À exécuter sur le VPS

echo "🔍 Diagnostic DisallowedHost sur le VPS"
echo "========================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_DIR="${1:-.}"  # Utiliser le chemin passé en argument ou le dossier courant

cd "$BACKEND_DIR" || exit 1

echo -e "${BLUE}📍 Localisation: $BACKEND_DIR${NC}"
echo ""

# 1. Vérifier .env
echo -e "${BLUE}1️⃣  Vérification du fichier .env${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env existe${NC}"
    echo ""
    echo "Contenu de .env:"
    cat .env | grep -E "^(DEBUG|SECRET_KEY|ALLOWED_HOSTS|CORS_|CSRF_)" | head -10
    echo ""
else
    echo -e "${RED}❌ .env N'EXISTE PAS${NC}"
    echo -e "${YELLOW}⚠️  SOLUTION: cp .env.production .env${NC}"
    echo ""
fi

# 2. Vérifier DEBUG
echo -e "${BLUE}2️⃣  Statut de DEBUG${NC}"
if grep -q "DEBUG=False" .env 2>/dev/null; then
    echo -e "${GREEN}✅ DEBUG=False${NC}"
elif grep -q "DEBUG=True" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  DEBUG=True (mode développement)${NC}"
else
    echo -e "${RED}❌ DEBUG non trouvé dans .env${NC}"
fi
echo ""

# 3. Vérifier SECRET_KEY
echo -e "${BLUE}3️⃣  Vérification de SECRET_KEY${NC}"
if grep -q "SECRET_KEY=dev-only" .env 2>/dev/null; then
    echo -e "${RED}❌ SECRET_KEY = dev-only (DANGEREUX en production)${NC}"
    echo -e "${YELLOW}⚠️  SOLUTION: Générer une vraie clé${NC}"
    echo "   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
elif grep -q "SECRET_KEY=REMPLACER_PAR" .env 2>/dev/null; then
    echo -e "${RED}❌ SECRET_KEY = REMPLACER_PAR_... (non configurée)${NC}"
    echo -e "${YELLOW}⚠️  SOLUTION: Générer et remplacer${NC}"
elif grep -q "^SECRET_KEY=" .env 2>/dev/null; then
    echo -e "${GREEN}✅ SECRET_KEY configurée${NC}"
else
    echo -e "${RED}❌ SECRET_KEY non trouvé${NC}"
fi
echo ""

# 4. Vérifier ALLOWED_HOSTS
echo -e "${BLUE}4️⃣  Vérification de ALLOWED_HOSTS${NC}"
ALLOWED=$(grep "^ALLOWED_HOSTS=" .env 2>/dev/null || echo "")
if [ -z "$ALLOWED" ]; then
    echo -e "${RED}❌ ALLOWED_HOSTS non trouvé${NC}"
else
    echo -e "${GREEN}✅ $ALLOWED${NC}"
    if echo "$ALLOWED" | grep -q "www.infosconcours.sn"; then
        echo -e "${GREEN}   ✅ Contient www.infosconcours.sn${NC}"
    else
        echo -e "${RED}   ❌ Ne contient PAS www.infosconcours.sn${NC}"
    fi
    if echo "$ALLOWED" | grep -q "infosconcours.sn,"; then
        echo -e "${GREEN}   ✅ Contient infosconcours.sn${NC}"
    else
        echo -e "${RED}   ❌ Ne contient PAS infosconcours.sn${NC}"
    fi
fi
echo ""

# 5. Vérifier CORS
echo -e "${BLUE}5️⃣  Vérification de CORS_ALLOWED_ORIGINS${NC}"
CORS=$(grep "^CORS_ALLOWED_ORIGINS=" .env 2>/dev/null || echo "")
if [ -z "$CORS" ]; then
    echo -e "${RED}❌ CORS_ALLOWED_ORIGINS non trouvé${NC}"
else
    echo -e "${GREEN}✅ $CORS${NC}"
fi
echo ""

# 6. Vérifier CSRF
echo -e "${BLUE}6️⃣  Vérification de CSRF_TRUSTED_ORIGINS${NC}"
CSRF=$(grep "^CSRF_TRUSTED_ORIGINS=" .env 2>/dev/null || echo "")
if [ -z "$CSRF" ]; then
    echo -e "${RED}❌ CSRF_TRUSTED_ORIGINS non trouvé${NC}"
else
    echo -e "${GREEN}✅ $CSRF${NC}"
fi
echo ""

# 7. Vérifier que settings.py est en place
echo -e "${BLUE}7️⃣  Vérification de settings.py${NC}"
if [ -f "config/settings.py" ]; then
    echo -e "${GREEN}✅ settings.py existe${NC}"
    if grep -q "ALLOWED_HOSTS.*os.getenv" config/settings.py; then
        echo -e "${GREEN}   ✅ Utilise os.getenv pour ALLOWED_HOSTS${NC}"
    else
        echo -e "${RED}   ❌ Ne charge pas ALLOWED_HOSTS depuis .env${NC}"
    fi
else
    echo -e "${RED}❌ settings.py NOT FOUND${NC}"
fi
echo ""

# 8. Vérifier le statut de Django
echo -e "${BLUE}8️⃣  Statut de Django/Gunicorn${NC}"
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet gunicorn; then
        echo -e "${GREEN}✅ Gunicorn est actif${NC}"
        echo -e "${YELLOW}⚠️  Redémarrer après changements: systemctl restart gunicorn${NC}"
    else
        echo -e "${RED}❌ Gunicorn n'est pas actif${NC}"
        echo -e "${YELLOW}   Démarrer: systemctl start gunicorn${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  systemctl non disponible (pas un système Linux?)${NC}"
fi
echo ""

# 9. Résumé
echo -e "${BLUE}📋 RÉSUMÉ${NC}"
echo ""
ISSUES=0

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ PROBLÈME 1: .env manquant${NC}"
    ISSUES=$((ISSUES+1))
fi

if grep -q "ALLOWED_HOSTS=" .env 2>/dev/null; then
    if ! grep "^ALLOWED_HOSTS=" .env | grep -q "www.infosconcours.sn"; then
        echo -e "${RED}❌ PROBLÈME 2: www.infosconcours.sn absent de ALLOWED_HOSTS${NC}"
        ISSUES=$((ISSUES+1))
    fi
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Configuration semble correcte${NC}"
    echo ""
    echo "Si l'erreur persiste, redémarrer Django:"
    echo "  systemctl restart gunicorn"
    echo ""
    echo "Vérifier les logs:"
    echo "  journalctl -u gunicorn -n 50"
else
    echo -e "${RED}$ISSUES problème(s) trouvé(s)${NC}"
    echo ""
    echo "ACTIONS À EFFECTUER:"
    if [ ! -f ".env" ]; then
        echo "1. cp .env.production .env"
    fi
    if grep -q "ALLOWED_HOSTS=" .env 2>/dev/null; then
        if ! grep "^ALLOWED_HOSTS=" .env | grep -q "www.infosconcours.sn"; then
            echo "2. Éditer .env et ajouter www.infosconcours.sn à ALLOWED_HOSTS"
        fi
    fi
    echo "3. systemctl restart gunicorn"
fi
echo ""
