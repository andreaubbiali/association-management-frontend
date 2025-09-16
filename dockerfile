# Multi-stage build for Vue.js application

# Stage 1: Build the application
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL=https://management.bloomacademyasd.com/api/v1/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set production environment and mode
ENV NODE_ENV=production
ENV VITE_MODE=production

# Build the application
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine AS production-stage

# Copy built application from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]