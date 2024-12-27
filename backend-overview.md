# 🖥️ Easy Vote Backend

Serveur backend robuste et sécurisé pour la gestion de sondages en temps réel.

## ✨ Caractéristiques principales
- 🔐 Authentification JWT
- 📊 Base de données SQLite intégrée
- ⚡ WebSocket pour temps réel
- 📧 Notifications email
- 🧹 Nettoyage automatique
- 🔒 Protection CSRF/XSS

## 🛠️ Stack technique
- **Runtime**: Node.js 18
- **Framework**: Express
- **Database**: SQLite + Prisma ORM
- **Real-time**: WebSocket (ws)
- **Security**: helmet, cors, rate-limiting
- **Emails**: nodemailer

## ⚙️ Configuration

### Variables d'environnement essentielles
| Variable | Description | Obligatoire | Exemple |
|----------|-------------|-------------|---------|
| JWT_SECRET | Clé secrète JWT | Oui | eyJhbGciOiJIUzI1... |
| DOMAIN | URL du frontend | Oui | https://vote.example.com |
| ADMIN_PASSWORD | Mot de passe admin | Oui | motdepasse123 |

### Configuration SMTP (optionnelle)
| Variable | Description | Défaut |
|----------|-------------|---------|
| SMTP_HOST | Serveur SMTP | - |
| SMTP_PORT | Port SMTP | 587 |
| SMTP_USER | Utilisateur SMTP | - |
| SMTP_PASS | Mot de passe SMTP | - |
| SMTP_FROM | Email expéditeur | - |

### Configuration avancée
| Variable | Description | Défaut |
|----------|-------------|---------|
| PORT | Port d'écoute | 3001 |
| HOST | Host d'écoute | 0.0.0.0 |
| CLEANUP_INTERVAL | Intervalle de nettoyage | "0 0 * * *" |
| POLL_RETENTION_DAYS | Rétention des sondages | 30 |

## 💾 Persistance des données
Le backend utilise SQLite avec un fichier de base de données monté en volume
## 🔗 Intégration avec Reverse Proxy

### Configuration Nginx

```nginx
server {
listen 80;
server_name vote.example.com;
location /api {
proxy_pass http://backend:3001;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
}
location /ws {
proxy_pass http://backend:3001;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
}
}}
```

## 🛡️ Sécurité
- Rate limiting
- Protection CSRF
- Sanitization des entrées
- Headers sécurisés (helmet)
- Validation des données

## 📊 API Endpoints
- `POST /api/auth/login` - Authentification
- `POST /api/polls` - Création de sondage
- `GET /api/polls` - Liste des sondages
- `PUT /api/polls/:id` - Mise à jour
- `DELETE /api/polls/:id` - Suppression
- `POST /api/votes` - Vote
- `GET /api/stats` - Statistiques

## 🤝 Support
- 📖 [Documentation API](https://github.com/barto95100/easy-vote-vite)
- 🐛 [Signaler un bug](https://github.com/barto95100/easy-vote-vite/issues)
- 💡 [Suggestions](https://github.com/barto95100/easy-vote-vite/issues)

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
