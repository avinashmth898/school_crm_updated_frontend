# Step 1: build the static React bundle
FROM node:20-alpine AS build
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: serve it with Nginx, which also reverse-proxies /api/ to the
# backend container so the frontend's relative "/api" base URL (see
# src/services/apiClient.js) just works, same-origin, no CORS needed.
FROM nginx:alpine
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443
