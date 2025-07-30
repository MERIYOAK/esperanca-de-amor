# Google OAuth Troubleshooting Guide

This guide helps you resolve common Google OAuth issues in the Esperança de Amor e-commerce application.

## 🚨 Common Errors and Solutions

### 1. **403 Error: "The given origin is not allowed for the given client ID"**

**Problem:** Your domain is not authorized in Google Cloud Console.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID and click on it
5. In **Authorized JavaScript origins**, add these URLs:
   ```
   http://localhost:8080
   http://localhost:3000
   http://127.0.0.1:8080
   http://127.0.0.1:3000
   ```
6. Click **Save**
7. Wait 5-10 minutes for changes to propagate

### 2. **"Google Client ID not configured"**

**Problem:** Missing environment variable.

**Solution:**
1. Create or edit `.env` file in the frontend directory
2. Add your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   VITE_API_URL=http://localhost:5000
   ```
3. Restart your development server

### 3. **"Button width is invalid"**

**Problem:** Google Sign-In button width configuration.

**Solution:** ✅ Already fixed in the code - using fixed width (300px) instead of percentage.

### 4. **"Cross-Origin-Opener-Policy" Warning**

**Problem:** Browser security warning.

**Solution:** ✅ This is just a warning and doesn't affect functionality. Can be safely ignored.

### 5. **"Failed to load resource: 403"**

**Problem:** Same as #1 - origin not allowed.

**Solution:** Follow the steps in #1 to add your domain to authorized origins.

## 🔧 Quick Fix Checklist

### For 403 Errors:
- [ ] Add `http://localhost:8080` to authorized origins
- [ ] Add `http://localhost:3000` to authorized origins  
- [ ] Add `http://127.0.0.1:8080` to authorized origins
- [ ] Add `http://127.0.0.1:3000` to authorized origins
- [ ] Wait 5-10 minutes after saving
- [ ] Clear browser cache and reload

### For Configuration Issues:
- [ ] Check `.env` file has `VITE_GOOGLE_CLIENT_ID`
- [ ] Verify Google Client ID is correct
- [ ] Restart development server
- [ ] Check browser console for errors

## 🛠️ Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized origins (see above)
7. Copy the Client ID

### Step 2: Environment Variables
Create `.env` file in frontend directory:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here
VITE_API_URL=http://localhost:5000
```

### Step 3: Backend Configuration
Ensure your backend has the Google Client ID in `.env`:
```env
GOOGLE_CLIENT_ID=your-client-id-here
```

## 🐛 Debug Mode

To enable debug mode:
1. Open browser console
2. Run: `localStorage.setItem('gsi_debug', 'true')`
3. Reload page
4. Check console for detailed Google OAuth logs

## 📞 Support

If you're still having issues:
1. Check browser console for specific error messages
2. Verify all environment variables are set
3. Ensure Google Cloud Console is properly configured
4. Try clearing browser cache and cookies
5. Test in incognito/private mode

## 🔍 Common Issues by Platform

### Development (localhost)
- Most common: Origin not allowed
- Solution: Add localhost URLs to authorized origins

### Production
- Most common: Domain not in authorized origins
- Solution: Add your production domain to authorized origins

### Mobile
- Most common: Different user agent
- Solution: Test on actual mobile device, not just mobile view 