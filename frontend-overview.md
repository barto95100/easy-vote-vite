# 🗳️ Easy Vote Frontend

Interface utilisateur moderne, intuitive et réactive pour la gestion de sondages en temps réel.

## ✨ Caractéristiques principales
- 📱 Interface responsive (mobile, tablette, desktop)
- ⚡ Mises à jour en temps réel via WebSocket
- 🌓 Thème clair/sombre automatique
- 🔒 Sécurité intégrée
- 🌍 Support multi-langues
- ♿ Accessibilité (WCAG 2.1)

## 🛠️ Stack technique
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **State Management**: Zustand
- **Real-time**: WebSocket
- **UI Components**: Shadcn/ui

## ⚙️ Configuration

### Variables d'environnement
| Variable | Description | Obligatoire | Défaut |
|----------|-------------|-------------|---------|
| VITE_API_URL | URL de l'API backend | Non | /api |
| VITE_WS_URL | URL des WebSockets | Non | /ws |
| VITE_PORT | Port d'écoute | Non | 4173 |
| VITE_HOST | Host d'écoute | Non | 0.0.0.0 |

## 🔗 Intégration avec Reverse Proxy
### Configuration Nginx
```
server {
    listen 80;
    server_name vote.toto.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name vote.xxxx.com;

    ssl_certificate /etc/nginx/ssl/vote.toto.com.crt;
    ssl_certificate_key /etc/nginx/ssl/vote.toto.com.key;

    # Frontend
    location / {
        proxy_pass http://easy-vote-frontend:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://easy-vote-backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://easy-vote-backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuration pour le HMR de Vite
    location /wss {
        proxy_pass http://localhost:24678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
} 
```
## 🛡️ Sécurité
- Rate limiting
- Protection CSRF
- Sanitization des entrées
- Headers sécurisés (helmet)
- Validation des données
## 📝 Fonctionnalités détaillées
- **Création de sondages**
  - Options multiples
  - Dates d'expiration
  - Restrictions d'accès
- **Gestion des votes**
  - Vote unique par utilisateur
  - Résultats en temps réel
  - Graphiques interactifs
- **Interface administrateur**
  - Tableau de bord
  - Gestion des sondages
  - Statistiques

## 🤝 Support
Pour toute question ou problème :
- 📖 [Documentation complète](https://github.com/barto95100/easy-vote-vite)
- 🐛 [Signaler un bug](https://github.com/barto95100/easy-vote-vite/issues)
- 💡 [Proposer une amélioration](https://github.com/barto95100/easy-vote-vite/issues)

## 📜 Licence
Ce projet est sous licence Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

### Ce que cette licence permet :
- ✅ Utilisation personnelle
- ✅ Modification du code (avec notification à l'auteur)
- ✅ Distribution des versions modifiées sous les mêmes conditions

### Ce que cette licence interdit :
- ❌ Utilisation commerciale
- ❌ Distribution sans attribution
- ❌ Modification sans partage des changements

### Obligations :
1. Attribution : Vous devez créditer l'auteur original (Barto95100)
2. Notification : Informer l'auteur de toute modification apportée au code
3. Partage : Les versions modifiées doivent être partagées sous la même licence

Pour plus d'informations, contactez l'auteur via GitHub.

## 🚀 Démarrage rapide

### Docker Compose
Créez un fichier `docker-compose.yml` :
```yaml
version: '3.8'

services:
  frontend:
    image: barto95100/easy-vote-vite-frontend:latest
    environment:
      - VITE_API_URL=/api
      - VITE_WS_URL=/ws
      - VITE_PORT=4173
      - VITE_HOST=0.0.0.0
    restart: unless-stopped
    networks:
      - app_network

  backend:
    image: barto95100/easy-vote-vite-backend:latest
    environment:
      - PORT=${PORT:-3001}
      - HOST=${HOST:-0.0.0.0}
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL:-file:./polls.db}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${DOMAIN}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT:-587}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
      - SMTP_SECURE=${SMTP_SECURE:-false}
      - CLEANUP_INTERVAL=${CLEANUP_INTERVAL:-"0 0 * * *"}
      - POLL_RETENTION_DAYS=${POLL_RETENTION_DAYS:-30}
      - DEFAULT_ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
      - RATE_LIMIT_WINDOW_MS=${RATE_LIMIT_WINDOW_MS:-900000}
      - RATE_LIMIT_MAX_REQUESTS=${RATE_LIMIT_MAX_REQUESTS:-100}
    volumes:
      - ./data/polls.db:/app/polls.db
    restart: unless-stopped
    networks:
      - app_network

networks:
  app_network:
    driver: bridge
```

### Configuration .env
Créez un fichier `.env` à côté de votre docker-compose.yml :
```env
# Configuration générale
DOMAIN=https://vote.example.com
JWT_SECRET=votre-secret-key-tres-longue-et-securisee
ADMIN_PASSWORD=votre-mot-de-passe-admin

# Configuration des ports
VITE_PORT=4173
PORT=3001
HOST=0.0.0.0

# Configuration de la base de données
DATABASE_URL=file:./polls.db

# Configuration SMTP (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre-user
SMTP_PASS=votre-password
SMTP_FROM=noreply@example.com
SMTP_SECURE=false

# Configuration du nettoyage automatique
CLEANUP_INTERVAL="0 0 * * *"
POLL_RETENTION_DAYS=30

# Configuration de la sécurité
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```