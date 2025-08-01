# Environment Variables Setup

## Backend Environment Variables

### Required Variables

#### Database Configuration
```
MONGODB_URI=mongodb://localhost:27017/edastore
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h
```

#### Server Configuration
```
PORT=5000
NODE_ENV=development
```

#### CORS Configuration (NEW)
```
# For local development - leave empty or add localhost URLs
ALLOWED_ORIGINS=

# For production - add your Vercel domain(s)
# Example: ALLOWED_ORIGINS=https://esperanca-de-amor.vercel.app,https://edastore.com
```

#### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Email Configuration (for newsletter)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### File Upload Configuration
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### Security
```
BCRYPT_SALT_ROUNDS=12
```

## Environment Setup Instructions

### Local Development (.env file)
Create a `.env` file in the backend directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/edastore

# JWT
JWT_SECRET=your-local-secret-key
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=development

# CORS - Leave empty for local development
ALLOWED_ORIGINS=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (optional for local)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Google OAuth (optional for local)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_SALT_ROUNDS=12
```

### Production (Render Environment Variables)
Set these in your Render dashboard:

```env
# Database
MONGODB_URI=your-mongodb-atlas-connection-string

# JWT
JWT_SECRET=your-production-secret-key
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=production

# CORS - Add your Vercel domain(s)
ALLOWED_ORIGINS=https://esperanca-de-amor.vercel.app,https://edastore.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_SALT_ROUNDS=12
```

## CORS Configuration Details

### ALLOWED_ORIGINS Variable
- **Format**: Comma-separated list of URLs
- **Example**: `https://esperanca-de-amor.vercel.app,https://edastore.com`
- **Local Development**: Leave empty or add localhost URLs
- **Production**: Add your actual Vercel domain(s)

### Default Allowed Origins (Built-in)
The following origins are always allowed for development:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:8080`
- `http://localhost:4173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:8080`
- `http://127.0.0.1:4173`

### Adding Production Domains
To add your Vercel domain to the allowed origins:

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to Environment variables
4. Add/update `ALLOWED_ORIGINS` with your Vercel URL:
   ```
   ALLOWED_ORIGINS=https://esperanca-de-amor.vercel.app
   ```

### Multiple Domains
If you have multiple domains, separate them with commas:
```
ALLOWED_ORIGINS=https://esperanca-de-amor.vercel.app,https://edastore.com,https://www.edastore.com
```

## Testing CORS Configuration

### Check Allowed Origins
The server will log the allowed origins when CORS blocks a request:
```
CORS blocked origin: https://example.com
Allowed origins: ['http://localhost:3000', 'https://esperanca-de-amor.vercel.app']
```

### Health Check
Test your API health endpoint:
```
GET https://your-backend-url.onrender.com/api/health
```

## Troubleshooting

### CORS Errors
If you're still getting CORS errors:
1. Check that your Vercel URL is correctly added to `ALLOWED_ORIGINS`
2. Ensure the URL format is correct (include `https://`)
3. Restart your Render service after updating environment variables
4. Check the server logs for CORS debugging information

### Environment Variable Not Loading
1. Make sure the variable name is exactly `ALLOWED_ORIGINS`
2. Check that there are no extra spaces in the value
3. Restart the service after adding environment variables 