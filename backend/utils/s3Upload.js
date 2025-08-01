const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// Check if required environment variables are set
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',                    
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
const s3Configured = missingEnvVars.length === 0;

if (!s3Configured) {
  console.error('❌ Missing required AWS environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all AWS credentials are set.');
  console.log('📋 Using local storage fallback');
} else {
  console.log('✅ AWS environment variables are set');
  console.log(`📦 S3 Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
}

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Project-specific folder name
const PROJECT_FOLDER = 'ecommerce-esperanca';

// Configure multer for S3 upload (using the working logic from upload.js)
const upload = s3Configured ? multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // Removed acl: 'public-read' since bucket doesn't support ACLs
    // Bucket should be made public through bucket policy instead
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
      const folder = req.uploadPath || 'products';
      cb(null, `${PROJECT_FOLDER}/${folder}/${fileName}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
}) : null;

// Upload single image
const uploadSingle = (uploadPath = 'general') => {
  return (req, res, next) => {
    console.log('🔍 DEBUG: uploadSingle middleware called');
    console.log('📋 Upload path:', uploadPath);
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📋 Request method:', req.method);
    console.log('📋 Request URL:', req.url);
    
    if (s3Configured && upload) {
      console.log('📋 Using S3 storage');
      req.uploadPath = uploadPath;
      const uploadMiddleware = upload.single('image');
      
      uploadMiddleware(req, res, (err) => {
        console.log('🔍 DEBUG: uploadSingle callback (S3)');
        console.log('📋 Error:', err);
        console.log('📋 File:', req.file);
        console.log('📋 Request body keys:', Object.keys(req.body || {}));
        
        if (err) {
          console.log('❌ Upload error:', err.message);
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        console.log('✅ Upload middleware completed successfully (S3)');
        next();
      });
    } else {
      console.log('📋 Using local storage (S3 not configured)');
      
      // Create uploads directory if it doesn't exist
      const fs = require('fs');
      const uploadsDir = 'ecommerce-esperanca';
      const specificDir = path.join(uploadsDir, uploadPath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(specificDir)) {
        fs.mkdirSync(specificDir, { recursive: true });
      }
      
      const localStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, specificDir);
        },
        filename: function (req, file, cb) {
          const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
          cb(null, fileName);
        }
      });
      
      const uploadLocal = multer({
        storage: localStorage,
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'), false);
          }
        }
      });
      
      const uploadMiddleware = uploadLocal.single('image');
      
      uploadMiddleware(req, res, (err) => {
        console.log('🔍 DEBUG: uploadSingle callback (Local)');
        console.log('📋 Error:', err);
        console.log('📋 File:', req.file);
        console.log('📋 Request body keys:', Object.keys(req.body || {}));
        
        if (err) {
          console.log('❌ Upload error:', err.message);
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        // Convert local file path to URL for consistency
        if (req.file) {
          req.file.location = `http://localhost:5000/ecommerce-esperanca/${uploadPath}/${req.file.filename}`;
        }
        
        console.log('✅ Upload middleware completed successfully (Local)');
        next();
      });
    }
  };
};

// Upload multiple images
const uploadMultiple = (uploadPath = 'general', maxCount = 5) => {
  return (req, res, next) => {
    console.log('🔍 DEBUG: uploadMultiple middleware called');
    console.log('📋 Upload path:', uploadPath);
    console.log('📋 Max count:', maxCount);
    
    if (s3Configured && upload) {
      console.log('📋 Using S3 storage');
      req.uploadPath = uploadPath;
      const uploadMiddleware = upload.array('images', maxCount);
      
      uploadMiddleware(req, res, (err) => {
        console.log('🔍 DEBUG: uploadMultiple callback (S3)');
        console.log('📋 Error:', err);
        console.log('📋 Files:', req.files);
        
        if (err) {
          console.log('❌ Upload error:', err.message);
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        console.log('✅ Upload middleware completed successfully (S3)');
        next();
      });
    } else {
      console.log('📋 Using local storage (S3 not configured)');
      
      // Create uploads directory if it doesn't exist
      const fs = require('fs');
      const uploadsDir = 'ecommerce-esperanca';
      const specificDir = path.join(uploadsDir, uploadPath);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(specificDir)) {
        fs.mkdirSync(specificDir, { recursive: true });
      }
      
      const localStorage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, specificDir);
        },
        filename: function (req, file, cb) {
          const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
          cb(null, fileName);
        }
      });
      
      const uploadLocal = multer({
        storage: localStorage,
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed'), false);
          }
        }
      });
      
      const uploadMiddleware = uploadLocal.array('images', maxCount);
      
      uploadMiddleware(req, res, (err) => {
        console.log('🔍 DEBUG: uploadMultiple callback (Local)');
        console.log('📋 Error:', err);
        console.log('📋 Files:', req.files);
        
        if (err) {
          console.log('❌ Upload error:', err.message);
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        
        // Convert local file paths to URLs for consistency
        if (req.files) {
          req.files.forEach(file => {
            file.location = `http://localhost:5000/ecommerce-esperanca/${uploadPath}/${file.filename}`;
          });
        }
        
        console.log('✅ Upload middleware completed successfully (Local)');
        next();
      });
    }
  };
};

// Delete image from S3
const deleteImageFromS3 = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes(process.env.AWS_S3_BUCKET)) {
      return false;
    }

    const key = imageUrl.split('.com/')[1];
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
};

// Delete multiple images from S3
const deleteMultipleImagesFromS3 = async (imageUrls) => {
  try {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return false;
    }

    const keys = imageUrls
      .filter(url => url && url.includes(process.env.AWS_S3_BUCKET))
      .map(url => url.split('.com/')[1]);

    if (keys.length === 0) {
      return false;
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: {
        Objects: keys.map(key => ({ Key: key }))
      }
    };

    await s3.deleteObjects(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting images from S3:', error);
    return false;
  }
};

// Generate presigned URL for direct upload
const generatePresignedUrl = async (fileName, contentType, uploadPath = 'general') => {
  try {
    const key = `${PROJECT_FOLDER}/${uploadPath}/${Date.now()}_${fileName}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
      Expires: 300 // 5 minutes
    };

    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      presignedUrl,
      key,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImageFromS3,
  deleteMultipleImagesFromS3,
  generatePresignedUrl,
  s3
}; 