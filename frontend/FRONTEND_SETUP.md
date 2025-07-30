# Frontend Setup Guide

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Esperança de Amor
VITE_APP_VERSION=1.0.0
```

## Important Notes

1. **Environment Variable Prefix**: Since this is a Vite application, all environment variables must be prefixed with `VITE_` to be accessible in the browser.

2. **Google Client ID**: You need to get this from Google Cloud Console (see backend setup guide).

3. **Development vs Production**: 
   - Development: Use `http://localhost:5000` for API URL
   - Production: Use your production API URL

## Getting Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID for Web application
7. Copy the Client ID and add it to your `.env` file

## Testing

1. Start the backend server
2. Start the frontend development server: `npm run dev`
3. Navigate to `/login`
4. Click "Continue with Google"
5. Complete Google authentication

## Troubleshooting

### "process is not defined"
- Make sure you're using `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`

### "Google OAuth not working"
- Check that `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
- Verify the Google Client ID is correct
- Check browser console for errors

### "API calls failing"
- Check that `VITE_API_URL` is set correctly
- Ensure backend server is running
- Check CORS configuration in backend 