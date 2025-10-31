# Étape build
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape production
FROM nginx:alpine

# Copier le build dans nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
