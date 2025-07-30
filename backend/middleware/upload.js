const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

// Check if required environment variables are set
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',                    
  'AWS_SECRET_ACCESS_KEY', 
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required AWS environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all AWS credentials are set.');
} else {
  console.log('✅ AWS environment variables are set');
  console.log(`📦 S3 Bucket: ${process.env.AWS_S3_BUCKET}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
}

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Project-specific folder name (you can change this)
const PROJECT_FOLDER = 'ecommerce-esperanca';

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // Removed acl: 'public-read' since bucket doesn't allow ACLs
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, `${PROJECT_FOLDER}/products/${fileName}`);
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
});

// Configure multer for profile picture upload
const profileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    // Removed acl: 'public-read' since bucket doesn't allow ACLs
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
      cb(null, `${PROJECT_FOLDER}/profiles/${fileName}`);
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
    files: 1 // Only 1 file for profile picture
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Profile picture upload
const uploadProfilePicture = profileUpload.single('profilePicture');

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
  console.error('Upload error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  // Handle S3-specific errors
  if (err.code === 'NoSuchBucket') {
    return res.status(500).json({
      success: false,
      message: 'S3 bucket does not exist. Please check your configuration.'
    });
  }

  if (err.code === 'AccessDenied') {
    return res.status(500).json({
      success: false,
      message: 'Access denied to S3 bucket. Please check your AWS credentials.'
    });
  }

  if (err.code === 'InvalidAccessKeyId') {
    return res.status(500).json({
      success: false,
      message: 'Invalid AWS Access Key ID. Please check your configuration.'
    });
  }

  if (err.code === 'SignatureDoesNotMatch') {
    return res.status(500).json({
      success: false,
      message: 'Invalid AWS Secret Access Key. Please check your configuration.'
    });
  }

  if (err.code === 'AccessControlListNotSupported') {
    return res.status(500).json({
      success: false,
      message: 'S3 bucket does not support ACLs. Files will be uploaded without public read access.'
    });
  }

  next(err);
};

// Middleware to handle profile picture upload errors
const handleProfileUploadError = (err, req, res, next) => {
  console.error('Profile upload error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Profile picture too large. Maximum size is 2MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one profile picture allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed for profile picture'
    });
  }

  // Handle S3-specific errors
  if (err.code === 'NoSuchBucket') {
    return res.status(500).json({
      success: false,
      message: 'S3 bucket does not exist. Please check your configuration.'
    });
  }

  if (err.code === 'AccessDenied') {
    return res.status(500).json({
      success: false,
      message: 'Access denied to S3 bucket. Please check your AWS credentials.'
    });
  }

  if (err.code === 'InvalidAccessKeyId') {
    return res.status(500).json({
      success: false,
      message: 'Invalid AWS Access Key ID. Please check your configuration.'
    });
  }

  if (err.code === 'SignatureDoesNotMatch') {
    return res.status(500).json({
      success: false,
      message: 'Invalid AWS Secret Access Key. Please check your configuration.'
    });
  }

  if (err.code === 'AccessControlListNotSupported') {
    return res.status(500).json({
      success: false,
      message: 'S3 bucket does not support ACLs. Profile picture will be uploaded without public read access.'
    });
  }

  next(err);
};

// Function to delete file from S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl) return true;
    
    const key = fileUrl.split('.com/')[1];
    if (!key) {
      console.error('Invalid file URL format:', fileUrl);
      return false;
    }

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    }).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Function to delete multiple files from S3
const deleteMultipleFilesFromS3 = async (fileUrls) => {
  try {
    const deletePromises = fileUrls.map(fileUrl => deleteFileFromS3(fileUrl));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error);
    return false;
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadProfilePicture,
  handleUploadError,
  handleProfileUploadError,
  deleteFileFromS3,
  deleteMultipleFilesFromS3
}; 