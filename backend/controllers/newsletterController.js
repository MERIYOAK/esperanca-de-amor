const Newsletter = require('../models/Newsletter');
const PendingSubscriber = require('../models/PendingSubscriber');
const asyncHandler = require('../utils/asyncHandler');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Subscribe to newsletter (Public)
const subscribeToNewsletter = asyncHandler(async (req, res) => {
  const { email, name, source = 'other' } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Check if already subscribed and active
  const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existingSubscriber && existingSubscriber.isActive) {
    return res.status(400).json({
      success: false,
      message: 'You are already subscribed to our newsletter'
    });
  }

  // If user exists but is inactive (unsubscribed), reactivate them
  if (existingSubscriber && !existingSubscriber.isActive) {
    // Reactivate the subscription
    existingSubscriber.isActive = true;
    existingSubscriber.unsubscribedAt = null;
    existingSubscriber.resubscribedAt = new Date();
    await existingSubscriber.save();

    // Send welcome back email
    await sendWelcomeBackEmail(existingSubscriber.email, existingSubscriber.name || '');

    return res.status(200).json({
      success: true,
      message: 'Welcome back! You have been successfully resubscribed to our newsletter.'
    });
  }

  // Check if already pending
  const existingPending = await PendingSubscriber.findOne({ email: email.toLowerCase() });
  if (existingPending) {
    // If pending, send new confirmation email
    existingPending.generateConfirmationToken();
    await existingPending.save();
    
    await sendConfirmationEmail(existingPending.email, existingPending.confirmationToken, existingPending.name || '');
    
    return res.status(200).json({
      success: true,
      message: 'Confirmation email sent. Please check your inbox and click the confirmation link.'
    });
  }

  // Create pending subscriber for new users
  const confirmationToken = crypto.randomBytes(32).toString('hex');
  const pendingSubscriber = await PendingSubscriber.create({
    email: email.toLowerCase(),
    name: name || '',
    confirmationToken,
    source,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send confirmation email
  await sendConfirmationEmail(pendingSubscriber.email, confirmationToken, pendingSubscriber.name || '');

  res.status(201).json({
    success: true,
    message: 'Please check your email and click the confirmation link to complete your subscription.'
  });
});

// Confirm subscription (Public)
const confirmSubscription = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Confirmation token is required'
    });
  }

  // Find pending subscriber
  const pendingSubscriber = await PendingSubscriber.findByToken(token);
  
  if (!pendingSubscriber) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired confirmation link. Please subscribe again.'
    });
  }

  // Check if already subscribed
  const existingSubscriber = await Newsletter.findOne({ email: pendingSubscriber.email });
  if (existingSubscriber) {
    // Remove pending subscription
    await PendingSubscriber.findByIdAndDelete(pendingSubscriber._id);
    
    return res.status(400).json({
      success: false,
      message: 'You are already subscribed to our newsletter'
    });
  }

  // Create confirmed subscriber
  const subscriber = await Newsletter.create({
    email: pendingSubscriber.email,
    name: pendingSubscriber.name || null, // Handle empty name
    isActive: true,
    preferences: {
      promotions: true,
      newProducts: true,
      weeklyNewsletter: true
    }
  });

  // Remove pending subscription
  await PendingSubscriber.findByIdAndDelete(pendingSubscriber._id);

  // Send welcome email
  await sendWelcomeEmail(subscriber.email, subscriber.name || '');

  res.status(200).json({
    success: true,
    message: 'Thank you for subscribing to our newsletter!'
  });
});

// Unsubscribe from newsletter (Public)
const unsubscribeFromNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
  
  if (!subscriber) {
    return res.status(404).json({
      success: false,
      message: 'Subscriber not found'
    });
  }

  subscriber.isActive = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  res.status(200).json({
    success: true,
    message: 'You have been successfully unsubscribed from our newsletter.'
  });
});

// Send confirmation email
const sendConfirmationEmail = async (email, token, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const confirmationUrl = `${process.env.FRONTEND_URL}/confirm-subscription/${token}`;
    
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm Your Newsletter Subscription</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .content { 
            padding: 30px 20px; 
            background-color: #ffffff;
          }
          .content h2 {
            color: #dc2626;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
          }
          .btn { 
            display: inline-block; 
            padding: 14px 28px; 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            min-width: 200px;
          }
          .btn:hover {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
            transform: translateY(-2px);
          }
          .warning { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #f59e0b;
          }
          .warning strong {
            color: #92400e;
          }
          .link-text {
            word-break: break-all; 
            color: #666; 
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-wrap: break-word;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 20px 0;
          }
          .icon {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: #dc2626;
            border-radius: 50%;
            color: white;
            text-align: center;
            line-height: 20px;
            font-size: 12px;
            margin-right: 8px;
          }
          
          /* Mobile Responsive Styles */
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 6px;
            }
            .header {
              padding: 20px 15px;
            }
            .header h1 {
              font-size: 20px;
            }
            .content {
              padding: 20px 15px;
            }
            .content h2 {
              font-size: 18px;
            }
            .btn {
              padding: 12px 20px;
              font-size: 14px;
              min-width: 180px;
              width: 100%;
              max-width: 280px;
            }
            .warning {
              padding: 15px;
              margin: 15px 0;
            }
            .footer {
              padding: 15px;
              font-size: 11px;
            }
            .link-text {
              font-size: 11px;
              padding: 10px;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .container {
              margin: 5px;
            }
            .header {
              padding: 15px 10px;
            }
            .header h1 {
              font-size: 18px;
            }
            .content {
              padding: 15px 10px;
            }
            .content h2 {
              font-size: 16px;
            }
            .btn {
              padding: 10px 16px;
              font-size: 13px;
              min-width: 160px;
            }
            .warning {
              padding: 12px;
              margin: 12px 0;
            }
            .footer {
              padding: 12px 10px;
              font-size: 10px;
            }
            .link-text {
              font-size: 10px;
              padding: 8px;
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1f2937;
            }
            .container {
              background-color: #374151;
              color: #f9fafb;
            }
            .content {
              background-color: #374151;
              color: #f9fafb;
            }
            .content h2 {
              color: #fca5a5;
            }
            .footer {
              background: #4b5563;
              color: #d1d5db;
            }
            .link-text {
              background: #4b5563;
              color: #d1d5db;
              border-color: #6b7280;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Confirm Your Newsletter Subscription</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}! 👋</h2>
            <p>Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
            
            <p>To complete your subscription and start receiving our updates, please click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="btn">✅ Confirm Subscription</a>
            </div>
            
            <div class="warning">
              <strong>⏰ Important:</strong> This confirmation link will expire in 24 hours. If you don't confirm within this time, you'll need to subscribe again.
            </div>
            
            <div class="divider"></div>
            
            <p><strong>Having trouble with the button?</strong></p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p class="link-text">${confirmationUrl}</p>
          </div>
          <div class="footer">
            <p>🔒 If you didn't request this subscription, you can safely ignore this email.</p>
            <p>📧 This email was sent to ${email}</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              EDA Store Newsletter • Stay updated with our latest offers and products
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Confirm Your Newsletter Subscription - EDA Store',
      html: emailTemplate
    });

    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending confirmation email to ${email}:`, error.message);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EDA Store Newsletter</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .content { 
            padding: 30px 20px; 
            background-color: #ffffff;
          }
          .content h2 {
            color: #dc2626;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
          }
          .feature-list {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .feature-list h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
            font-weight: 600;
          }
          .feature-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .feature-list li {
            color: #92400e;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 20px 0;
          }
          .welcome-message {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
          }
          .welcome-message p {
            color: #0c4a6e;
            margin: 0;
            font-size: 14px;
            font-style: italic;
          }
          .unsubscribe-link {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
            padding: 12px 24px;
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            display: inline-block;
            margin: 10px 0;
            transition: all 0.3s ease;
            font-size: 14px;
            min-width: 120px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
          }
          .unsubscribe-link:hover {
            background: #dc2626;
            color: white;
            text-decoration: none;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
          }
          .unsubscribe-link:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
          }
          
          /* Mobile Responsive Styles */
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 6px;
            }
            .header {
              padding: 20px 15px;
            }
            .header h1 {
              font-size: 20px;
            }
            .content {
              padding: 20px 15px;
            }
            .content h2 {
              font-size: 18px;
            }
            .feature-list {
              padding: 15px;
              margin: 15px 0;
            }
            .feature-list h3 {
              font-size: 15px;
            }
            .feature-list li {
              font-size: 13px;
              margin-bottom: 6px;
            }
            .welcome-message {
              padding: 15px;
              margin: 15px 0;
            }
            .welcome-message p {
              font-size: 13px;
            }
            .footer {
              padding: 15px;
              font-size: 11px;
            }
            .unsubscribe-link {
              padding: 14px 20px;
              font-size: 15px;
              margin: 15px 0;
              width: 100%;
              max-width: 280px;
              min-width: 200px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .container {
              margin: 5px;
            }
            .header {
              padding: 15px 10px;
            }
            .header h1 {
              font-size: 18px;
            }
            .content {
              padding: 15px 10px;
            }
            .content h2 {
              font-size: 16px;
            }
            .feature-list {
              padding: 12px;
              margin: 12px 0;
            }
            .feature-list h3 {
              font-size: 14px;
            }
            .feature-list li {
              font-size: 12px;
              margin-bottom: 5px;
            }
            .welcome-message {
              padding: 12px;
              margin: 12px 0;
            }
            .welcome-message p {
              font-size: 12px;
            }
            .footer {
              padding: 12px 10px;
              font-size: 10px;
            }
            .unsubscribe-link {
              padding: 16px 20px;
              font-size: 16px;
              margin: 12px auto;
              width: 100%;
              max-width: 250px;
              min-width: 180px;
              border-radius: 10px;
              font-weight: 700;
            }
          }
          
          @media only screen and (max-width: 360px) {
            .container {
              margin: 2px;
            }
            .header {
              padding: 12px 8px;
            }
            .header h1 {
              font-size: 16px;
            }
            .content {
              padding: 12px 8px;
            }
            .content h2 {
              font-size: 15px;
            }
            .footer {
              padding: 10px 8px;
              font-size: 9px;
            }
            .unsubscribe-link {
              padding: 18px 16px;
              font-size: 15px;
              margin: 10px auto;
              width: 100%;
              max-width: 220px;
              min-width: 160px;
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1f2937;
            }
            .container {
              background-color: #374151;
              color: #f9fafb;
            }
            .content {
              background-color: #374151;
              color: #f9fafb;
            }
            .content h2 {
              color: #fca5a5;
            }
            .footer {
              background: #4b5563;
              color: #d1d5db;
            }
            .feature-list {
              background: #451a03;
              border-color: #92400e;
            }
            .feature-list h3,
            .feature-list li {
              color: #fef3c7;
            }
            .welcome-message {
              background: #0c4a6e;
              border-color: #0ea5e9;
            }
            .welcome-message p {
              color: #e0f2fe;
            }
            .unsubscribe-link {
              background: #dc2626;
              color: white;
              border-color: #dc2626;
            }
            .unsubscribe-link:hover {
              background: #b91c1c;
              border-color: #b91c1c;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to EDA Store Newsletter!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}! 👋</h2>
            
            <div class="welcome-message">
              <p>🎊 Thank you for confirming your subscription to our newsletter. You're now part of our exclusive community!</p>
            </div>
            
            <p>We're excited to keep you informed about all the latest happenings at EDA Store. Here's what you can expect:</p>
            
            <div class="feature-list">
              <h3>📧 What You'll Receive:</h3>
              <ul>
                <li>🆕 New products and arrivals</li>
                <li>💰 Special promotions and discounts</li>
                <li>📢 Store news and updates</li>
                <li>📰 Weekly newsletters</li>
                <li>🎁 Exclusive member-only offers</li>
                <li>🚚 Early access to sales</li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <p>We promise to only send you valuable content and never spam your inbox. You can unsubscribe anytime if you change your mind.</p>
          </div>
          <div class="footer">
            <p>🔒 If you ever want to unsubscribe, you can do so by clicking <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${email}" class="unsubscribe-link">here</a>.</p>
            <p>📧 This email was sent to ${email}</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              EDA Store Newsletter • Stay updated with our latest offers and products
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome to EDA Store Newsletter!',
      html: emailTemplate
    });

    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error.message);
    // Don't throw error for welcome email - it's not critical
  }
};

// Send welcome back email for resubscribed users
const sendWelcomeBackEmail = async (email, name) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Back to EDA Store Newsletter</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); 
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .content { 
            padding: 30px 20px; 
            background-color: #ffffff;
          }
          .content h2 {
            color: #dc2626;
            margin-top: 0;
            font-size: 20px;
            font-weight: 600;
          }
          .footer { 
            background: #f8f9fa; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
          }
          .welcome-back-message {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #22c55e;
          }
          .welcome-back-message p {
            color: #166534;
            margin: 0;
            font-size: 14px;
            font-style: italic;
          }
          .feature-list {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .feature-list h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
            font-weight: 600;
          }
          .feature-list ul {
            margin: 0;
            padding-left: 20px;
          }
          .feature-list li {
            color: #92400e;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 20px 0;
          }
          .unsubscribe-link {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
            padding: 12px 24px;
            background: #fef2f2;
            border: 2px solid #fecaca;
            border-radius: 8px;
            display: inline-block;
            margin: 10px 0;
            transition: all 0.3s ease;
            font-size: 14px;
            min-width: 120px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
          }
          .unsubscribe-link:hover {
            background: #dc2626;
            color: white;
            text-decoration: none;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
          }
          .unsubscribe-link:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
          }
          
          /* Mobile Responsive Styles */
          @media only screen and (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 6px;
            }
            .header {
              padding: 20px 15px;
            }
            .header h1 {
              font-size: 20px;
            }
            .content {
              padding: 20px 15px;
            }
            .content h2 {
              font-size: 18px;
            }
            .welcome-back-message {
              padding: 15px;
              margin: 15px 0;
            }
            .welcome-back-message p {
              font-size: 13px;
            }
            .feature-list {
              padding: 15px;
              margin: 15px 0;
            }
            .feature-list h3 {
              font-size: 15px;
            }
            .feature-list li {
              font-size: 13px;
              margin-bottom: 6px;
            }
            .footer {
              padding: 15px;
              font-size: 11px;
            }
            .unsubscribe-link {
              padding: 14px 20px;
              font-size: 15px;
              margin: 15px 0;
              width: 100%;
              max-width: 280px;
              min-width: 200px;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .container {
              margin: 5px;
            }
            .header {
              padding: 15px 10px;
            }
            .header h1 {
              font-size: 18px;
            }
            .content {
              padding: 15px 10px;
            }
            .content h2 {
              font-size: 16px;
            }
            .welcome-back-message {
              padding: 12px;
              margin: 12px 0;
            }
            .welcome-back-message p {
              font-size: 12px;
            }
            .feature-list {
              padding: 12px;
              margin: 12px 0;
            }
            .feature-list h3 {
              font-size: 14px;
            }
            .feature-list li {
              font-size: 12px;
              margin-bottom: 5px;
            }
            .footer {
              padding: 12px 10px;
              font-size: 10px;
            }
            .unsubscribe-link {
              padding: 16px 20px;
              font-size: 16px;
              margin: 12px auto;
              width: 100%;
              max-width: 250px;
              min-width: 180px;
              border-radius: 10px;
              font-weight: 700;
            }
          }
          
          @media only screen and (max-width: 360px) {
            .container {
              margin: 2px;
            }
            .header {
              padding: 12px 8px;
            }
            .header h1 {
              font-size: 16px;
            }
            .content {
              padding: 12px 8px;
            }
            .content h2 {
              font-size: 15px;
            }
            .footer {
              padding: 10px 8px;
              font-size: 9px;
            }
            .unsubscribe-link {
              padding: 18px 16px;
              font-size: 15px;
              margin: 10px auto;
              width: 100%;
              max-width: 220px;
              min-width: 160px;
            }
          }
          
          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #1f2937;
            }
            .container {
              background-color: #374151;
              color: #f9fafb;
            }
            .content {
              background-color: #374151;
              color: #f9fafb;
            }
            .content h2 {
              color: #fca5a5;
            }
            .footer {
              background: #4b5563;
              color: #d1d5db;
            }
            .welcome-back-message {
              background: #064e3b;
              border-color: #22c55e;
            }
            .welcome-back-message p {
              color: #d1fae5;
            }
            .feature-list {
              background: #451a03;
              border-color: #92400e;
            }
            .feature-list h3,
            .feature-list li {
              color: #fef3c7;
            }
            .unsubscribe-link {
              background: #dc2626;
              color: white;
              border-color: #dc2626;
            }
            .unsubscribe-link:hover {
              background: #b91c1c;
              border-color: #b91c1c;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome Back to EDA Store Newsletter!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name || 'there'}! 👋</h2>
            
            <div class="welcome-back-message">
              <p>🎊 We're so glad to have you back! Your newsletter subscription has been reactivated.</p>
            </div>
            
            <p>We've missed you and are excited to keep you updated with all the latest happenings at EDA Store. Here's what you can expect:</p>
            
            <div class="feature-list">
              <h3>📧 What You'll Receive:</h3>
              <ul>
                <li>🆕 New products and arrivals</li>
                <li>💰 Special promotions and discounts</li>
                <li>📢 Store news and updates</li>
                <li>📰 Weekly newsletters</li>
                <li>🎁 Exclusive member-only offers</li>
                <li>🚚 Early access to sales</li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <p>Your preferences have been restored, and you'll start receiving our updates immediately. Thank you for coming back!</p>
          </div>
          <div class="footer">
            <p>🔒 If you ever want to unsubscribe again, you can do so by clicking <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${email}" class="unsubscribe-link">here</a>.</p>
            <p>📧 This email was sent to ${email}</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">
              EDA Store Newsletter • Welcome back to our community!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Welcome Back to EDA Store Newsletter!',
      html: emailTemplate
    });

    console.log(`✅ Welcome back email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome back email to ${email}:`, error.message);
    // Don't throw error for welcome back email - it's not critical
  }
};

// Cleanup expired pending subscriptions (Admin)
const cleanupExpiredSubscriptions = asyncHandler(async (req, res) => {
  const deletedCount = await PendingSubscriber.cleanupExpired();
  
  res.status(200).json({
    success: true,
    message: `${deletedCount} expired pending subscriptions cleaned up`
  });
});

// Get pending subscriptions (Admin)
const getPendingSubscriptions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const pendingSubscribers = await PendingSubscriber.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PendingSubscriber.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      pendingSubscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  subscribeToNewsletter,
  confirmSubscription,
  unsubscribeFromNewsletter,
  cleanupExpiredSubscriptions,
  getPendingSubscriptions
}; 