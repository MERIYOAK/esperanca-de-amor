const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging with request details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code
    }
  };

  // Log error for debugging (different levels based on environment)
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error Details:', errorLog);
    console.error('📋 Request Body:', req.body);
    console.error('🔑 Request Headers:', req.headers);
  } else {
    console.error('🚨 Error:', {
      method: req.method,
      url: req.url,
      error: err.message,
      name: err.name,
      code: err.code
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    const message = 'Validation failed';
    error = { 
      message, 
      statusCode: 400,
      errors: validationErrors
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size exceeds the maximum limit';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field in request';
    error = { message, statusCode: 400 };
  }

  // AWS S3 errors
  if (err.code === 'NoSuchBucket') {
    const message = 'Storage configuration error - bucket not found';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'AccessDenied') {
    const message = 'Storage access denied - check credentials';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'InvalidAccessKeyId') {
    const message = 'Invalid storage credentials';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'SignatureDoesNotMatch') {
    const message = 'Storage authentication failed';
    error = { message, statusCode: 500 };
  }

  // Network and connection errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Database connection refused';
    error = { message, statusCode: 503 };
  }

  if (err.code === 'ENOTFOUND') {
    const message = 'Service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400) {
    const message = 'Invalid JSON format in request body';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Generic error handling
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  };

  // Add validation errors if present
  if (error.errors) {
    errorResponse.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      code: err.code,
      originalMessage: err.message
    };
  }

  // Send error response
  res.status(error.statusCode).json(errorResponse);
};

module.exports = errorHandler; 