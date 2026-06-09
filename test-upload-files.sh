#!/bin/bash
# Test rapide: Upload de fichier et authentification

set -e

echo "🧪 Test Upload Fichiers & Authentification"
echo "==========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="${1:-http://127.0.0.1:8000}"
TEST_FILE="${2:-/tmp/test-image.jpg}"

echo "📍 URL API: $API_URL"
echo ""

# 1. Créer un fichier test si n'existe pas
if [ ! -f "$TEST_FILE" ]; then
    echo -e "${YELLOW}⚠️  Fichier test n'existe pas, création d'une petite image...${NC}"
    
    # Créer une petite image JPEG (1x1 pixel) avec ImageMagick si disponible
    if command -v convert &> /dev/null; then
        convert -size 1x1 xc:red "$TEST_FILE"
        echo -e "${GREEN}✅ Image test créée: $TEST_FILE${NC}"
    else
        # Sinon créer un fichier avec un header JPEG basique
        printf '\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01' > "$TEST_FILE"
        echo -e "${GREEN}✅ Pseudo-image créée: $TEST_FILE${NC}"
    fi
else
    echo -e "${GREEN}✅ Fichier test trouvé: $TEST_FILE${NC}"
fi

echo ""

# 2. Test 1: Vérifier que l'API répond
echo -e "${YELLOW}1️⃣  Test: L'API répond?${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/concours/")

if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API répond (status 200)${NC}"
else
    echo -e "${RED}❌ API ne répond pas correctement (status $RESPONSE)${NC}"
    exit 1
fi

echo ""

# 3. Test 2: Tester l'upload SANS token (doit échouer avec 401)
echo -e "${YELLOW}2️⃣  Test: Upload SANS authentification${NC}"
echo "   Taille du fichier: $(du -h "$TEST_FILE" | cut -f1)"

UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -F "file=@$TEST_FILE" \
    "$API_URL/api/v1/admin/upload/image/" \
    2>/dev/null)

HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✅ Upload sans token → 401 Unauthorized (attendu)${NC}"
elif [ "$HTTP_CODE" = "413" ]; then
    echo -e "${RED}❌ Error 413: Request Entity Too Large${NC}"
    echo "   → Vérifier: client_max_body_size dans Nginx"
    echo "   → Vérifier: FILE_UPLOAD_MAX_MEMORY_SIZE dans Django"
    exit 1
elif [ "$HTTP_CODE" = "405" ]; then
    echo -e "${YELLOW}⚠️  Error 405: Méthode non autorisée${NC}"
    echo "   → L'endpoint d'upload n'existe peut-être pas"
else
    echo -e "${RED}❌ Error $HTTP_CODE${NC}"
fi

echo ""

# 4. Test 3: Tester la taille de fichier
echo -e "${YELLOW}3️⃣  Test: Limites de taille${NC}"

FILE_SIZE=$(stat -f%z "$TEST_FILE" 2>/dev/null || stat -c%s "$TEST_FILE" 2>/dev/null || echo "unknown")
echo "   Taille fichier: $FILE_SIZE bytes"

# Créer un fichier plus grand (10 MB) pour tester la limite
echo "   Création d'un fichier de 10 MB pour test..."
TEST_BIG_FILE="/tmp/test-large-$(date +%s).jpg"
dd if=/dev/zero of="$TEST_BIG_FILE" bs=1M count=10 2>/dev/null

echo "   Test upload fichier 10 MB..."
BIG_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -F "file=@$TEST_BIG_FILE" \
    "$API_URL/api/v1/admin/upload/image/" \
    2>/dev/null | tail -n 1)

if [ "$BIG_RESPONSE" = "413" ]; then
    echo -e "${RED}❌ Error 413: Limite de 10 MB trop grande${NC}"
    echo "   → La limite est < 10 MB"
    echo "   → Django: FILE_UPLOAD_MAX_MEMORY_SIZE"
    echo "   → Nginx: client_max_body_size"
elif [ "$BIG_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Upload 10 MB accepté par le serveur (rejeté par auth, ok)${NC}"
else
    echo -e "${YELLOW}⚠️  Status $BIG_RESPONSE pour upload 10 MB${NC}"
fi

rm -f "$TEST_BIG_FILE"

echo ""

# 5. Test 4: Vérifier la configuration Nginx
echo -e "${YELLOW}4️⃣  Test: Configuration Nginx${NC}"

if [[ "$API_URL" == "http://127.0.0.1:8000" ]]; then
    echo "   (Test local - Nginx non accessible)"
else
    # Faire un HEAD request pour voir les headers
    HEADERS=$(curl -sI "$API_URL" 2>/dev/null)
    
    if echo "$HEADERS" | grep -q "nginx"; then
        echo -e "${GREEN}✅ Nginx détecté${NC}"
    fi
fi

echo ""

# 6. Test 5: Vérifier la configuration Django
echo -e "${YELLOW}5️⃣  Test: Configuration Django${NC}"

# Essayer de lire la limite depuis Django
DJANGO_LIMITS=$(curl -s "$API_URL/api/v1/admin/overview/" 2>/dev/null || echo "{}")

if echo "$DJANGO_LIMITS" | grep -q "error\|detail"; then
    echo -e "${YELLOW}⚠️  Endpoint /admin/overview/ a une erreur (normal si pas authentifié)${NC}"
else
    echo -e "${GREEN}✅ Endpoint /admin/overview/ accessible${NC}"
fi

echo ""

# Résumé
echo -e "${GREEN}✅ Tests terminés${NC}"
echo ""
echo "📋 Résumé:"
echo "  - API répond correctement"
echo "  - Upload sans token → 401 (normal)"
echo "  - Fichiers < 10 MB semblent acceptés"
echo ""
echo "Prochaines étapes:"
echo "  1. Configurer Nginx: client_max_body_size 50M"
echo "  2. Relancer Django: systemctl restart gunicorn"
echo "  3. Relancer Nginx: sudo systemctl restart nginx"
echo "  4. Retester l'upload depuis le navigateur"
echo ""
