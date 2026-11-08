# Image de production : l'API Node.js sert aussi l'interface React compilée.
# docker build -t tantsaha-connect .

# 1) Compilation de l'interface React
FROM node:24-alpine AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# 2) Image finale : API + fichiers compilés, sans les outils de développement
FROM node:24-alpine
ENV NODE_ENV=production PORT=5000
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client /app/client/dist /app/client/dist
# dossier de la base PGlite (utilisée seulement sans DATABASE_URL)
RUN mkdir .donnees && chown node .donnees
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:5000/api/sante || exit 1
CMD ["node", "src/index.js"]
