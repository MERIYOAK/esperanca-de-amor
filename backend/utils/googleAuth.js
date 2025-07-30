const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID token
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    return {
      success: true,
      data: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    };
  } catch (error) {
    console.error('❌ Google token verification failed:', error);
    return {
      success: false,
      error: 'Invalid Google token'
    };
  }
};

// Verify Google access token
const verifyGoogleAccessToken = async (accessToken) => {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return {
      success: true,
      data: {
        googleId: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture
      }
    };
  } catch (error) {
    console.error('❌ Google access token verification failed:', error);
    return {
      success: false,
      error: 'Invalid Google access token'
    };
  }
};

module.exports = {
  verifyGoogleToken,
  verifyGoogleAccessToken
}; 