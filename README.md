<div align="center">
  <img src="public/easyvote.svg" alt="EasyVote Logo" width="200"/>
  <h1>EasyVote</h1>
  <p>Une solution moderne et élégante pour la gestion de sondages en ligne</p>

  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
  [![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-green.svg)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
</div>

## ✨ Caractéristiques

- 🔒 **Sécurité**
  - Protection CORS
  - Authentification JWT
  - Protection contre les votes multiples
  - Rate limiting

- 📱 **Interface Utilisateur**
  - Design responsive
  - Thème clair/sombre
  - Temps réel avec WebSocket
  - Support multi-langues

- 📊 **Fonctionnalités**
  - Création de sondages
  - Votes uniques
  - Statistiques en temps réel
  - Nettoyage automatique

## 🚀 Démarrage rapide

### Avec Docker (recommandé)
```bash
# Créer le fichier docker-compose.yml
curl -O https://raw.githubusercontent.com/barto95100/easy-vote-vite/main/docker-compose.yml

# Créer le fichier .env
curl -O https://raw.githubusercontent.com/barto95100/easy-vote-vite/main/.env.example
mv .env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env

# Démarrer les services
docker compose up -d
```

### Configuration minimale (.env)
```env
# Configuration générale
DOMAIN=https://vote.example.com
JWT_SECRET=votre-secret-key-tres-longue
ADMIN_PASSWORD=votre-mot-de-passe-admin

# Configuration SMTP (optionnel)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=votre-user
SMTP_PASS=votre-password
SMTP_FROM=noreply@example.com
```

## 📖 Documentation

- [Documentation Frontend](frontend-overview.md)
- [Documentation Backend](backend-overview.md)
- [Images Docker Hub Frontend](https://hub.docker.com/r/barto95100/easy-vote-vite-frontend)
- [Images Docker Hub Backend](https://hub.docker.com/r/barto95100/easy-vote-vite-backend)

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

## 🤝 Support

- 📖 [Documentation complète](https://github.com/barto95100/easy-vote-vite)
- 🐛 [Signaler un bug](https://github.com/barto95100/easy-vote-vite/issues)
- 💡 [Proposer une amélioration](https://github.com/barto95100/easy-vote-vite/issues)

---

<div align="center">
  <sub>Built with ❤️ by Barto_95</sub>
</div>
