FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN HUSKY=0 npm ci
COPY . .
RUN npm run lint && npm run format:check && npm test && npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
ENV PORT=8080
COPY Caddyfile .env.production /etc/caddy/
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--envfile", "/etc/caddy/.env.production"]
