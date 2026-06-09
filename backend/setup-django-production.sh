#!/bin/bash
# Script de configuration Django pour production sur VPS
# Usage: bash setup-django-production.sh

set -e

echo "🚀 Configuration Django pour Production"
echo "========================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier que .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erreur: .env.production non trouvé${NC}"
    echo "Copier depuis le repo:"
    echo "  cp backend/.env.production backend/.env"
    exit 1
fi

echo -e "${GREEN}✅ .env.production trouvé${NC}"
echo ""

# 2. Vérifier les variables requises
echo "📋 Vérification des variables dans .env.production:"
echo ""

REQUIRED_VARS=("DEBUG" "SECRET_KEY" "ALLOWED_HOSTS" "CORS_ALLOWED_ORIGINS" "CSRF_TRUSTED_ORIGINS" "DB_PASSWORD")

for VAR in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${VAR}=" .env.production; then
        VALUE=$(grep "^${VAR}=" .env.production | cut -d'=' -f2)
        
        if [[ "$VAR" == "SECRET_KEY" && "$VALUE" == "REMPLACER_PAR"* ]]; then
            echo -e "${YELLOW}⚠️  ${VAR} = REMPLACER_PAR_... (à remplacer)${NC}"
        elif [[ "$VAR" == "DB_PASSWORD" && "$VALUE" == "REMPLACER_PAR"* ]]; then
            echo -e "${YELLOW}⚠️  ${VAR} = REMPLACER_PAR_... (à remplacer)${NC}"
        elif [[ "$VALUE" == "REMPLACER_PAR"* ]]; then
            echo -e "${YELLOW}⚠️  ${VAR} = $VALUE${NC}"
        else
            echo -e "${GREEN}✅ ${VAR} = $VALUE${NC}"
        fi
    else
        echo -e "${RED}❌ ${VAR} manquant${NC}"
    fi
done

echo ""
echo "📝 Variables à remplacer avant déploiement:"
echo ""
echo "1. SECRET_KEY:"
echo "   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
echo ""
echo "2. DB_PASSWORD:"
echo "   Votre mot de passe PostgreSQL"
echo ""

echo "🔐 Vérification de la configuration Django:"
echo ""

# 3. Test Python
if command -v python &> /dev/null; then
    echo -e "${GREEN}✅ Python disponible${NC}"
    PYTHON_VERSION=$(python --version)
    echo "   Version: $PYTHON_VERSION"
else
    echo -e "${RED}❌ Python non trouvé${NC}"
    exit 1
fi

echo ""
echo "📦 Vérification des fichiers:"
echo ""

FILES=(
    "backend/config/settings.py"
    "backend/.env.production"
    "backend/env.example"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "${GREEN}✅ $FILE${NC}"
    else
        echo -e "${RED}❌ $FILE manquant${NC}"
    fi
done

echo ""
echo "✅ Vérification terminée!"
echo ""
echo "📌 Prochaines étapes sur le VPS:"
echo ""
echo "1. Éditer backend/.env:"
echo "   nano backend/.env"
echo ""
echo "2. Remplacer les valeurs:"
echo "   - SECRET_KEY (générer avec python)"
echo "   - DB_PASSWORD"
echo "   - ALLOWED_HOSTS (si différent de infosconcours.sn,www.infosconcours.sn)"
echo ""
echo "3. Relancer Django:"
echo "   systemctl restart gunicorn"
echo ""
echo "4. Vérifier les logs:"
echo "   journalctl -u gunicorn -f"
echo ""
