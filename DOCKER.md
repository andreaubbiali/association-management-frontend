# Docker Instructions

## Environment Configuration

This application uses different API base URLs for development and production:

- **Development**: `http://localhost:8000/api/v1/` (from `.env.development`)
- **Production**: `https://your-production-api.com/api/v1/` (from `.env.production`)

Make sure to update the production URL in `.env.production` before building for production.

## Building the Docker Image

To build the Docker image for this Vue.js application:

```bash
# For production deployment (Linux AMD64) - uses production API URL by default
docker build --platform linux/amd64 -t association-management-frontend .

# For local development (ARM64 on Mac)
docker build -t association-management-frontend .
```

### Building with Custom API URL

You can override the production API URL during build:

```bash
# For production deployment (Linux AMD64) with custom API URL
docker build --platform linux/amd64 --build-arg VITE_API_BASE_URL=https://your-api.example.com/api/v1/ -t association-management-frontend .
```

## Running the Container

To run the container on port 8080:

```bash
# Running locally built image
docker run -p 8080:8080 association-management-frontend

# If you built for Linux AMD64, you might need to specify platform when running locally for testing
docker run --platform linux/amd64 -p 8080:8080 association-management-frontend
```

The application will be available at: http://localhost:8080

## Cross-Platform Building

When building on macOS ARM for Linux AMD64 deployment:

### Prerequisites
Make sure you have Docker buildx enabled (it's enabled by default in recent Docker versions):

```bash
docker buildx version
```

### Building for Multiple Platforms
For production deployments that need to run on different architectures:

```bash
# Build and push to registry for multiple platforms
docker buildx build --platform linux/amd64,linux/arm64 -t your-registry/association-management-frontend --push .

# Build only for Linux AMD64 (most common for production servers)
docker buildx build --platform linux/amd64 -t association-management-frontend --load .
```

**Note**: Use `--load` when building for a single platform to load the image into your local Docker daemon. Use `--push` when building for multiple platforms to push directly to a registry.

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