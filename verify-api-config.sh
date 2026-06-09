#!/bin/bash
# Script de vérification de la configuration API - Production

echo "🔍 Vérification de la configuration API..."
echo ""

# 1. Vérifier les fichiers .env
echo "1️⃣  Fichiers de configuration:"
echo "   .env:"
[ -f .env ] && echo "      ✅ Existe" || echo "      ❌ MANQUANT"
grep -q "VITE_API_URL" .env 2>/dev/null && echo "      ✅ VITE_API_URL configurée" || echo "      ⚠️  VITE_API_URL manquante"

echo "   .env.production:"
[ -f .env.production ] && echo "      ✅ Existe" || echo "      ❌ MANQUANT"
grep -q "VITE_API_URL" .env.production 2>/dev/null && echo "      ✅ VITE_API_URL configurée" || echo "      ⚠️  VITE_API_URL manquante"

echo ""
echo "2️⃣  Configuration API (src/utils/api.ts):"
grep -q "API_BASE_URL" src/utils/api.ts && echo "   ✅ API_BASE_URL définie" || echo "   ❌ API_BASE_URL manquante"
grep -q "VITE_API_URL" src/utils/api.ts && echo "   ✅ Variable d'env utilisée" || echo "   ❌ Variable d'env non utilisée"
grep -q "import.meta.env" src/utils/api.ts && echo "   ✅ Vite env loader utilisé" || echo "   ❌ Vite env loader non utilisé"

echo ""
echo "3️⃣  Vérification des appels API hardcodés:"
HARDCODED=$(grep -r "localhost:8000" src/ 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$HARDCODED" -eq 0 ]; then
    echo "   ✅ Aucun hardcode localhost detected"
else
    echo "   ❌ $HARDCODED occurrences de localhost trouvées:"
    grep -r "localhost:8000" src/ 2>/dev/null | grep -v "node_modules"
fi

echo ""
echo "4️⃣  Build production:"
[ -d dist ] && echo "   ✅ Dossier dist/ généré" || echo "   ❌ dist/ manquant (lancer: npm run build)"

if [ -d dist ]; then
    SIZE=$(du -sh dist | cut -f1)
    echo "   📦 Taille: $SIZE"
fi

echo ""
echo "5️⃣  Documentation:"
[ -f API_CONFIG.md ] && echo "   ✅ API_CONFIG.md présent" || echo "   ⚠️  API_CONFIG.md manquant"
[ -f DEPLOYMENT_CHECKLIST.md ] && echo "   ✅ DEPLOYMENT_CHECKLIST.md présent" || echo "   ⚠️  DEPLOYMENT_CHECKLIST.md manquant"

echo ""
echo "📋 Résumé des variables d'environnement:"
echo "   Développement:"
grep "VITE_API_URL" .env 2>/dev/null | sed 's/^/      /'
echo "   Production:"
grep "VITE_API_URL" .env.production 2>/dev/null | sed 's/^/      /'

echo ""
echo "✅ Vérification terminée!"
