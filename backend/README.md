# E-commerce Backend API

A robust Node.js/Express backend for the Esperança de Amor e-commerce platform with comprehensive error handling, Google OAuth authentication, and file upload capabilities.

## 🚀 Features

- **🔐 Authentication & Authorization** - Google OAuth with JWT-based auth and role-based access
- **📁 File Upload** - AWS S3 integration for product and profile images
- **🛒 Shopping Cart** - Complete cart management with WhatsApp checkout
- **📧 Newsletter** - Email subscription and management
- **👥 User Management** - Profile management with image uploads
- **🛡️ Security** - Rate limiting, CORS, Helmet, input validation
- **📊 Admin Dashboard** - Comprehensive admin features
- **🔧 Error Handling** - Comprehensive error handling and logging

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Google OAuth + JWT (jsonwebtoken)
- **File Storage**: AWS S3
- **Email**: Nodemailer
- **Security**: helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Logging**: morgan
- **Google OAuth**: google-auth-library

## 📦 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Email Configuration (for newsletter)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# WhatsApp Configuration
WHATSAPP_PHONE_NUMBER=+1234567890
WHATSAPP_MESSAGE_TEMPLATE=Hello! I would like to place an order for the following items:

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Enhanced Error Handling

The backend includes comprehensive error handling to prevent crashes and provide meaningful error responses:

### **🛡️ Error Categories**

#### **Validation Errors (400)**
- **Mongoose Validation**: Field-specific validation errors
- **Input Validation**: Request body validation
- **File Upload**: File size, type, and count validation

#### **Authentication Errors (401)**
- **Invalid Token**: Malformed or invalid JWT
- **Expired Token**: JWT token has expired
- **Missing Token**: No authorization header

#### **Authorization Errors (403)**
- **Insufficient Permissions**: User lacks required role
- **Resource Access**: Cannot access specific resource

#### **Not Found Errors (404)**
- **Resource Not Found**: Database records not found
- **Route Not Found**: Invalid API endpoints

#### **Conflict Errors (409)**
- **Duplicate Entries**: Email already exists
- **Resource Conflicts**: Concurrent modifications

#### **Rate Limiting (429)**
- **Too Many Requests**: Rate limit exceeded

#### **Server Errors (500)**
- **Database Errors**: Connection issues
- **Storage Errors**: S3 upload/download failures
- **Internal Errors**: Unexpected server errors

### **📋 Error Response Format**

```json
{
  "success": false,
  "message": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register",
  "method": "POST",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 6 characters",
      "value": "123"
    }
  ]
}
```

### **🔍 Error Logging**

#### **Development Mode**
- Detailed error logs with stack traces
- Request body and headers logging
- Performance timing information

#### **Production Mode**
- Sanitized error logs
- Performance metrics
- Security-focused logging

### **🛠️ Error Prevention Features**

1. **Async Handler Wrapper**
   ```javascript
   const asyncHandler = require('../utils/asyncHandler');
   
   const register = asyncHandler(async (req, res, next) => {
     // Your controller logic here
     // Errors automatically caught and passed to error handler
   });
   ```

2. **Graceful Shutdown**
   - Handles SIGTERM and SIGINT signals
   - Closes database connections properly
   - Prevents data corruption

3. **Uncaught Exception Handling**
   - Catches unhandled exceptions
   - Logs errors before shutdown
   - Prevents silent failures

4. **Database Connection Resilience**
   - Automatic reconnection on failure
   - Connection pooling
   - Timeout handling

### **📊 Health Check Endpoint**

```bash
GET /api/health
```

Response:
```json
{
  "status": "OK",
  "message": "E-commerce API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "database": "connected",
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 10485760
  },
  "platform": "win32",
  "nodeVersion": "v18.17.0"
}
```

## 🔌 API Endpoints

### **Authentication (Google OAuth)**
- `POST /api/auth/google` - Google OAuth login/register
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/profile-picture` - Update profile picture
- `POST /api/auth/logout` - Logout user

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### **Cart**
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove from cart
- `POST /api/cart/checkout` - Checkout via WhatsApp

### **Wishlist**
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/:itemId` - Remove from wishlist
- `DELETE /api/wishlist/clear` - Clear all wishlist items
- `GET /api/wishlist/check/:productId` - Check if item in wishlist
- `GET /api/wishlist/count` - Get wishlist count

### **Orders**
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### **Newsletter**
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe
- `GET /api/newsletter/subscribers` - Get subscribers (Admin)
- `POST /api/newsletter/send` - Send newsletter (Admin)

### **Admin**
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🔐 Security Features

- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Request data validation
- **Google OAuth**: Secure OAuth authentication
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin and customer roles
- **File Upload Security**: Type and size validation