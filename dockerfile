# Multi-stage build for Vue.js application

# Stage 1: Build the application
FROM node:18-alpine AS build-stage

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

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