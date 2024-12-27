<div align="center">
  <img src="public/easyvote.svg" alt="EasyVote Logo" width="200"/>
  <h1>EasyVote</h1>
  <p>Une solution moderne et élégante pour la gestion de sondages en ligne</p>

  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
</div>

## ✨ Caractéristiques

- 🔒 **Sécurité**
  - Protection CORS
  - Authentification administrateur
  - Chiffrement bcrypt
  - Protection contre les votes multiples
  - Rate limiting

- 📱 **Interface Utilisateur**
  - Design responsive
  - Interface intuitive
  - Animations fluides
  - Composants réutilisables

- 🚀 **Performance**
  - Application React optimisée
  - API RESTful efficace
  - Base de données SQLite légère

- 📊 **Fonctionnalités**
  - Création de sondages
  - Invitations par email
  - Statistiques en temps réel
  - Nettoyage automatique des sondages expirés

## 🛠️ Stack Technique

### Frontend
- React 18 avec TypeScript
- TailwindCSS pour le styling
- Vite comme bundler
- React Router pour la navigation

### Backend
- Node.js & Express
- Prisma comme ORM
- SQLite comme base de données
- Nodemailer pour les emails

### Sécurité
- CORS
- Rate Limiting
- Validation des entrées
- Protection contre les votes multiples

## 🚀 Installation

### Avec Docker (recommandé)
```bash
# Lancer avec docker-compose
docker-compose up -d
```

### Installation manuelle
```bash
# Cloner le repo
git clone https://github.com/votre-repo/easyvote.git
cd easyvote

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer en développement
npm run dev

# Ou builder pour la production
npm run build
npm start
```

## 📖 Configuration

### Variables d'Environnement

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# Database
DATABASE_URL="file:../dev.db"

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM="EasyVote <noreply@yourdomain.com>"
SMTP_SECURE=false
SMTP_REQUIRE_AUTH=true
SMTP_TLS_REJECT_UNAUTHORIZED=true

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=http://localhost:5173

# Security
INITIAL_ADMIN_PASSWORD=admin123     # Mot de passe admin initial
RATE_LIMIT_WINDOW_MS=15000        # Fenêtre de rate limiting
RATE_LIMIT_MAX_REQUESTS=100       # Nombre max de requêtes

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://example.com

# Automatic Cleanup
AUTO_DELETE_DAYS=30               # Suppression des sondages après X jours

# URL de l'API backend (exemple: http://localhost:3001 ou http://mondomaine.com:3001)
VITE_API_URL=http://localhost:3001
```

### Description des Variables

#### 🌐 Serveur
- `PORT`: Port d'écoute du serveur (défaut: 3001)
- `HOST`: Adresse d'écoute (0.0.0.0 pour toutes les interfaces)
- `NODE_ENV`: Environnement (development/production)

#### 📧 Email
- `SMTP_HOST`: Serveur SMTP
- `SMTP_PORT`: Port SMTP (généralement 587 ou 465)
- `SMTP_USER`: Nom d'utilisateur SMTP
- `SMTP_PASS`: Mot de passe SMTP
- `SMTP_FROM`: Adresse d'envoi
- `SMTP_SECURE`: Utiliser SSL/TLS
- `SMTP_REQUIRE_AUTH`: Authentification requise
- `SMTP_TLS_REJECT_UNAUTHORIZED`: Vérification du certificat TLS

#### 🔐 Sécurité
- `INITIAL_ADMIN_PASSWORD`: Mot de passe administrateur initial
- `RATE_LIMIT_WINDOW_MS`: Fenêtre de limitation de requêtes
- `RATE_LIMIT_MAX_REQUESTS`: Nombre maximum de requêtes par fenêtre

#### 🧹 Nettoyage Automatique
- `AUTO_DELETE_DAYS`: Nombre de jours avant suppression automatique des sondages expirés

#### 🌍 CORS
- `ALLOWED_ORIGINS`: Liste des origines autorisées (séparées par des virgules)

#### 🔄 URL de l'API backend
- `VITE_API_URL`: URL de votre backend (exemple: http://localhost:3001)


### Générer un JWT Secret
Pour générer un JWT secret sécurisé, vous pouvez utiliser une des méthodes suivantes :

1. **Via Node.js** (recommandé) :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Via OpenSSL** :
```bash
openssl rand -hex 64
```

3. **Via un générateur en ligne sécurisé** :
- Visitez [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
- Ou [https://randomkeygen.com/](https://randomkeygen.com/)

⚠️ **Important** : 
- Ne jamais utiliser le secret par défaut en production
- Ne jamais commiter le fichier .env dans Git
- Changer régulièrement le secret en production

## Configuration avec un nom de domaine

### Avec Nginx

1. Installez Nginx :
```bash
sudo apt install nginx
```

2. Créez une configuration pour votre domaine :
```bash
sudo nano /etc/nginx/sites-available/easyvote
```

3. Utilisez la configuration Nginx fournie ci-dessous: (Adaptez le domaine et les chemins aux vôtres.)
```nginx
# /etc/nginx/sites-available/easyvote

# Configuration des headers de sécurité globaux
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name vote.toto.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name vote.toto.com;

    # Configuration SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "private-state-token-redemption=(), private-state-token-issuance=(), browsing-topics=()";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";

    # Frontend (Vite/React)
    location / {
        proxy_pass http://IP_DU_SERVEUR:5173;  # Remplacer par l'IP du serveur
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://IP_DU_SERVEUR:3001;  # Remplacer par l'IP du serveur
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://IP_DU_SERVEUR:3001;  # Remplacer par l'IP du serveur
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Activez le site :
```bash
sudo ln -s /etc/nginx/sites-available/easyvote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Configurez votre .env :
```env
VITE_API_URL=https://vote.toto.com
```


## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push sur la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- Tous nos contributeurs ❤️

---

<div align="center">
  <sub>Built with ❤️ by Your Name</sub>
</div>
