FROM node:22.21.1-slim

RUN apt update && apt install -y xdg-utils procps
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm store path /tmp/.pnpm-store
