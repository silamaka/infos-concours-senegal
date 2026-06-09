# Configuration Nginx pour uploads de fichiers
# À ajouter dans /etc/nginx/sites-available/infosconcours.sn

# ========================================
# IMPORTANT: Ajouter cette ligne à la configuration du serveur
# ========================================

# À ajouter AVANT ou APRÈS le bloc location /api
# AVANT = s'applique à tout le serveur
# APRÈS = s'applique juste au bloc /api

# Emplacement recommandé: dans le bloc server { } mais AVANT les location { }

# ========================================
# Option 1: Augmenter la limite globalement (recommandé)
# ========================================

server {
    listen 443 ssl http2;
    server_name infosconcours.sn www.infosconcours.sn;

    # ✅ AJOUTER CETTE LIGNE (à l'intérieur du bloc server, avant les location)
    client_max_body_size 50M;

    ssl_certificate /etc/letsencrypt/live/infosconcours.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/infosconcours.sn/privkey.pem;

    # ... reste de la configuration ...

    location / {
        root /var/www/frontend-build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ... reste ...
}

# ========================================
# Option 2: Configuration détaillée (si Option 1 ne suffit pas)
# ========================================

# Si vous voulez des limites différentes par endpoint:

server {
    listen 443 ssl http2;
    server_name infosconcours.sn www.infosconcours.sn;

    # Limite globale
    client_max_body_size 50M;

    # Limites spécifiques par endpoint (optionnel)
    location /api/v1/admin/upload/ {
        client_max_body_size 50M;  # 50 MB pour les uploads
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts augmentés pour les gros uploads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /api {
        client_max_body_size 50M;
        
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ... reste ...
}

# ========================================
# Vérifier la configuration
# ========================================

# Après modification:
sudo nginx -t

# Si OK:
sudo systemctl restart nginx

# Vérifier que la limite est bien configurée:
curl -I http://localhost:8000/api/v1/admin/upload/image/
# Chercher: "client_max_body_size"
