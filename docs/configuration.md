# Configuration Guide

This document explains how to configure the PhoneBid application for different environments.

## Environment Variables

### Server Configuration (server/.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | Yes |
| `CLIENT_URL` | Frontend application URL | http://localhost:5173 | No |
| `NODE_ENV` | Environment mode | development | No |

### Client Configuration (client/.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | http://localhost:5000/api | No |
| `VITE_APP_NAME` | Application name | PhoneBid | No |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | - | Yes |

## Environment Files

### Development
- Server: `server/.env` or `server/.env.development`
- Client: `client/.env` or `client/.env.development`

### Production
- Server: `server/.env.production`
- Client: `client/.env.production`

### Example Configurations

#### Development Environment

**Server (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/phonebid-dev
JWT_SECRET=dev-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-dev-google-client-id
GOOGLE_CLIENT_SECRET=your-dev-google-client-secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=PhoneBid (Dev)
VITE_GOOGLE_CLIENT_ID=your-dev-google-client-id
```

#### Production Environment

**Server (.env.production):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phonebid-prod
JWT_SECRET=super-secure-production-secret-key
GOOGLE_CLIENT_ID=your-prod-google-client-id
GOOGLE_CLIENT_SECRET=your-prod-google-client-secret
CLIENT_URL=https://your-domain.com
NODE_ENV=production
```

**Client (.env.production):**
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_APP_NAME=PhoneBid
VITE_GOOGLE_CLIENT_ID=your-prod-google-client-id
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.com`
6. Copy Client ID and Client Secret to your environment files

## MongoDB Setup

### Local Development
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/phonebid-dev`

### Production (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create a cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string and add to environment variables

## Security Considerations

- Never commit `.env` files to version control
- Use strong, unique JWT secrets for each environment
- Rotate secrets regularly in production
- Use HTTPS in production
- Restrict CORS origins in production
- Use environment-specific Google OAuth credentials

## Deployment

### Using Environment Files
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

### Using Docker
```dockerfile
# Example Dockerfile with environment variables
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Using Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env.production
```

## Troubleshooting

### Common Issues

1. **API calls failing**: Check `VITE_API_BASE_URL` in client environment
2. **Authentication not working**: Verify Google OAuth credentials
3. **Database connection failed**: Check MongoDB URI and network access
4. **CORS errors**: Ensure `CLIENT_URL` is set correctly in server environment

### Environment Variable Loading

**Vite (Client):**
- Only variables prefixed with `VITE_` are exposed to the client
- Variables are replaced at build time
- Use `import.meta.env.VITE_VARIABLE_NAME` to access

**Node.js (Server):**
- All variables in `.env` are available
- Use `process.env.VARIABLE_NAME` to access
- Install `dotenv` package for automatic loading