<div align="center">
  <img src="https://raw.githubusercontent.com/votre-repo/easyvote/main/public/easyvote.svg" alt="EasyVote Logo" width="200"/>
  <h1>EasyVote - Solution de Sondages Moderne</h1>
</div>

## 🚀 Démarrage Rapide

```bash
# Lancer avec les paramètres par défaut
docker run -p 3000:3000 votre-repo/easyvote

# Ou avec docker-compose
docker-compose up -d
```

## 🔧 Configuration

### Variables d'Environnement Complètes

| Variable | Description | Défaut |
|----------|-------------|---------|
| `PORT` | Port d'écoute | `3001` |
| `NODE_ENV` | Environnement | `production` |
| `DATABASE_URL` | URL de la base de données | `file:/data/db.sqlite` |
| `SMTP_HOST` | Serveur SMTP | - |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | - |
| `SMTP_PASS` | Mot de passe SMTP | - |
| `SMTP_FROM` | Adresse d'envoi | - |
| `INITIAL_ADMIN_PASSWORD` | Mot de passe admin initial | `admin123` |
| `AUTO_DELETE_DAYS` | Jours avant suppression auto | `30` |
| `ALLOWED_ORIGINS` | Origines CORS autorisées | `*` |

Toutes ces variables peuvent être configurées via les variables d'environnement Docker ou un fichier `.env`.

### Volumes

- `/app/data` : Données persistantes (base SQLite uniquement)

## 🛠️ Fonctionnalités

- Interface moderne et responsive
- Sécurité avancée (CORS, bcrypt)
- Invitations par email
- API RESTful
- Statistiques en temps réel
- Nettoyage automatique des sondages expirés

## 🔐 Sécurité

- Protection contre les votes multiples
- Authentification administrateur
- Validation des entrées
- Rate limiting

## 🤝 Support

- Documentation dans le README du projet
- Issues et discussions sur le dépôt du projet

## 📝 License

MIT License - voir le fichier LICENSE du projet

---

<div align="center">
  <sub>Built with ❤️ by Your Name</sub>
</div> 