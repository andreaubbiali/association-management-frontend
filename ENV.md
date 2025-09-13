# Environment Configuration

This project uses environment variables to configure different settings for development and production environments.

## Environment Files

- `.env` - Default/fallback environment variables (committed to git)
- `.env.development` - Development-specific variables (committed to git)  
- `.env.production` - Production template variables (committed to git)
- `.env.local` - Local overrides (ignored by git, create as needed)

## Available Environment Variables

### API Configuration
- `VITE_API_BASE_URL` - Base URL for the backend API
  - Development: `http://localhost:8000/api/v1/`
  - Production: Update in `.env.production` with your production API URL

### Application Info
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Usage in Code

Environment variables are accessed using `import.meta.env`:

```javascript
// Example: Using API base URL
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/'
```

## Important Notes

1. **Vite Prefix**: All environment variables must start with `VITE_` to be accessible in the client-side code
2. **Build Time**: Environment variables are embedded at build time, not runtime
3. **Security**: Never put sensitive data in environment variables that start with `VITE_` as they will be exposed to the client

## Local Development Override

Create a `.env.local` file (ignored by git) to override any environment variables for your local setup:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api/v1/
```

## Production Deployment

Before deploying to production:

1. Update `.env.production` with your production API URL
2. Or override during Docker build:
   ```bash
   docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1/ -t app .
   ```

## Environment Loading Order

Vite loads environment files in this order (later files override earlier ones):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.development` or `.env.production`)
4. `.env.[mode].local`