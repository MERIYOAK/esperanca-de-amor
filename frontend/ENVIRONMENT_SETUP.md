# Frontend Environment Variables Setup

## Required Environment Variables

### API Configuration
```
# Backend API URL
# Local development: http://localhost:5000
# Production: https://your-backend-url.onrender.com
VITE_API_URL=http://localhost:5000
```

## Environment Setup Instructions

### Local Development (.env file)
Create a `.env` file in the frontend directory with:

```env
# Backend API URL for local development
VITE_API_URL=http://localhost:5000
```

### Production (Vercel Environment Variables)
Set these in your Vercel dashboard:

```env
# Backend API URL for production
VITE_API_URL=https://esperanca-de-amor.onrender.com
```

## Setup Instructions

### Local Development
1. Create a `.env` file in the `frontend` directory
2. Add the local backend URL:
   ```
   VITE_API_URL=http://localhost:5000
   ```
3. Restart your development server

### Production (Vercel)
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to Environment Variables
4. Add the production backend URL:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://esperanca-de-amor.onrender.com`
5. Redeploy your application

## Testing Configuration

### Check Environment Variables
The application includes environment variable testing. Check the browser console for:
```
✅ VITE_API_URL: Set
```

### API Connection Test
1. Open your deployed website
2. Check the browser console for any API errors
3. Test features that require backend communication (login, products, etc.)

## Troubleshooting

### API Connection Issues
If you're getting API connection errors:
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Check that your backend is running on Render
3. Ensure CORS is configured properly on the backend
4. Check the browser console for specific error messages

### Environment Variable Not Loading
1. Make sure the variable name is exactly `VITE_API_URL`
2. Check that there are no extra spaces in the value
3. Redeploy after adding environment variables
4. Clear browser cache and reload

### CORS Errors
If you're getting CORS errors:
1. Ensure your backend `ALLOWED_ORIGINS` includes your Vercel domain
2. Check that the backend is properly configured
3. Verify the API URL format (include `https://`)

## Example Configurations

### Local Development
```env
VITE_API_URL=http://localhost:5000
```

### Production
```env
VITE_API_URL=https://esperanca-de-amor.onrender.com
```

### Multiple Environments
You can have different configurations for different environments:
- **Development**: `http://localhost:5000`
- **Staging**: `https://staging-backend.onrender.com`
- **Production**: `https://esperanca-de-amor.onrender.com` 