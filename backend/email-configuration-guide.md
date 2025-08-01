# Email Configuration Guide for Newsletter System

## Overview
This guide will help you configure the email settings for the newsletter system to send confirmation emails and newsletters.

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce-esperanca

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cabindaretailshop

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@esperancadeamor.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Email Setup Instructions

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to Google Account settings
   - Navigate to Security
   - Click on "App passwords" (under 2-Step Verification)
   - Select "Mail" and "Other (Custom name)"
   - Enter "EDA Store Newsletter" as the name
   - Copy the generated 16-character password

3. **Update .env File**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail-address@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

## Testing Email Configuration

### 1. Test Email Sending
Create a test script to verify email configuration:

```javascript
// test-email.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'test@example.com',
      subject: 'Test Email from EDA Store',
      html: '<h1>Test Email</h1><p>This is a test email from the newsletter system.</p>'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

testEmail();
```

### 2. Run the Test
```bash
cd backend
node test-email.js
```

## Frontend URL Configuration

Make sure the `FRONTEND_URL` is set correctly:

- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

This URL is used in email confirmation links.

## Security Considerations

1. **Never commit .env file**: Add `.env` to `.gitignore`
2. **Use App Passwords**: Don't use your main Gmail password
3. **Environment-specific configs**: Use different settings for dev/prod
4. **Rate Limiting**: Consider adding rate limiting for email sending

## Troubleshooting

### Common Issues

1. **"Invalid login" error**:
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure SMTP settings are correct

2. **"Connection timeout" error**:
   - Check firewall settings
   - Verify SMTP host and port
   - Try different port (465 for SSL, 587 for TLS)

3. **"Authentication failed" error**:
   - Regenerate app password
   - Check if account is locked
   - Verify email address

### Debug Commands

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.SMTP_HOST)"
```

## Production Deployment

For production deployment:

1. **Use environment variables** in your hosting platform
2. **Set up proper DNS records** for email delivery
3. **Configure SPF/DKIM records** for better deliverability
4. **Monitor email sending limits** (Gmail: 500/day for free accounts)
5. **Consider using email service providers** like SendGrid, Mailgun, or AWS SES

## Next Steps

After configuring email:

1. **Test the newsletter subscription flow**
2. **Verify confirmation emails are received**
3. **Test admin newsletter sending**
4. **Monitor email delivery rates**

The newsletter system is now ready to send emails! 🎉 