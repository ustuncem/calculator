FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
ENV PORT=8080
CMD ["sh", "-c", "exec caddy file-server --root /srv --listen :$PORT"]
