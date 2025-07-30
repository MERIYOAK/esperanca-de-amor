# Google OAuth Setup Guide

## Backend Configuration

### 1. Install Dependencies
```bash
npm install google-auth-library passport passport-google-oauth20
```

### 2. Environment Variables
Add these to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Other required variables
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/ecommerce
FRONTEND_URL=http://localhost:8080
```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: "Esperança de Amor"
   - User support email: your email
   - Developer contact information: your email
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: "Esperança de Amor Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:8080`
     - `http://localhost:3000`
     - `http://localhost:5173`
   - Authorized redirect URIs:
     - `http://localhost:8080/login`
     - `http://localhost:3000/login`
     - `http://localhost:5173/login`

### 4. Frontend Configuration

Add to your frontend `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Note:** Since this is a Vite application, environment variables must be prefixed with `VITE_` instead of `REACT_APP_`.

## How It Works

### Registration Flow:
1. User clicks "Sign Up with Google"
2. Google OAuth popup opens
3. User authenticates with Google
4. Frontend receives Google ID token
5. Frontend sends token to backend
6. Backend verifies token with Google
7. Backend creates/updates user in database
8. Backend returns JWT token
9. User is logged in

### Login Flow:
1. User clicks "Sign In with Google"
2. Same flow as registration
3. If user exists, they're logged in
4. If user doesn't exist, account is created

### Profile Image:
- Users can upload custom profile images after registration
- Google profile picture is used as default
- Custom images are stored in AWS S3

## Security Features

- ✅ Google token verification
- ✅ JWT token authentication
- ✅ No password storage
- ✅ Secure session management
- ✅ Rate limiting
- ✅ CORS protection

## Testing

1. Start the backend server
2. Start the frontend development server
3. Navigate to `/login`
4. Click "Continue with Google"
5. Complete Google authentication
6. Verify user is logged in

## Troubleshooting

### Common Issues:

1. **"Invalid Google token"**
   - Check GOOGLE_CLIENT_ID in backend .env
   - Verify Google Cloud Console setup

2. **CORS errors**
   - Check FRONTEND_URL in backend .env
   - Verify frontend URL is in CORS configuration

3. **"Google OAuth not working"**
   - Check VITE_GOOGLE_CLIENT_ID in frontend .env
   - Verify Google Cloud Console credentials

4. **"User not found"**
   - Check MongoDB connection
   - Verify database is running

## Production Deployment

1. Update Google Cloud Console:
   - Add production domain to authorized origins
   - Add production domain to redirect URIs

2. Update environment variables:
   - Use production MongoDB URI
   - Use production JWT secret
   - Use production frontend URL

3. SSL/HTTPS:
   - Ensure all URLs use HTTPS in production
   - Update Google Cloud Console accordingly 