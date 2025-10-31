# Utiliser l'image officielle Node
FROM node:20

# Créer le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code
COPY . .

# Exposer le port du backend
EXPOSE 8080

# Lancer le serveur
CMD ["npm", "run", "dev"]
