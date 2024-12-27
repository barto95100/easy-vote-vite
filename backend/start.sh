#!/bin/sh

# Exécuter les migrations Prisma
npx prisma migrate deploy

# Démarrer l'application
npm start 