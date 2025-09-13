# Docker Instructions

## Environment Configuration

This application uses different API base URLs for development and production:

- **Development**: `http://localhost:8000/api/v1/` (from `.env.development`)
- **Production**: `https://your-production-api.com/api/v1/` (from `.env.production`)

Make sure to update the production URL in `.env.production` before building for production.

## Building the Docker Image

To build the Docker image for this Vue.js application:

```bash
docker build -t association-management-frontend .
```

### Building with Custom API URL

You can override the production API URL during build:

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-api.example.com/api/v1/ -t association-management-frontend .
```

## Running the Container

To run the container on port 8080:

```bash
docker run -p 8080:8080 association-management-frontend
```

The application will be available at: http://localhost:8080

## Docker Compose (Optional)

If you want to use Docker Compose, create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "8080:8080"
    container_name: association-management-frontend
```

Then run:
```bash
docker-compose up
```

## Development vs Production

This Dockerfile is optimized for production deployment. For development, you might want to:

1. Use `npm run dev` instead of building static files
2. Mount your source code as a volume for hot reloading
3. Use a development-specific Dockerfile

## Architecture

This Dockerfile uses a multi-stage build:
1. **Build Stage**: Uses Node.js to install dependencies and build the Vue.js application
2. **Production Stage**: Uses Nginx to serve the static files on port 8080