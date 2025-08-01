const Announcement = require('../models/Announcement');
const { deleteImageFromS3, deleteMultipleImagesFromS3 } = require('../utils/s3Upload');
const asyncHandler = require('../utils/asyncHandler');

// Get all announcements with pagination and filters
const getAnnouncements = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const type = req.query.type || '';
  const priority = req.query.priority || '';
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  if (type) {
    filter.type = type;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get announcements with pagination
  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Announcement.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get single announcement
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      announcement
    }
  });
});

// Create new announcement
const createAnnouncement = asyncHandler(async (req, res) => {
  console.log('🔍 DEBUG: createAnnouncement called');
  console.log('📋 Request body:', req.body);
  console.log('📋 Request files:', req.files);
  console.log('📋 Request headers:', req.headers);

  const {
    title,
    content,
    type,
    priority,
    startDate,
    endDate,
    targetAudience,
    displayLocation,
    images
  } = req.body;

  console.log('📋 Extracted data:');
  console.log('  - title:', title);
  console.log('  - content:', content);
  console.log('  - type:', type);
  console.log('  - priority:', priority);
  console.log('  - startDate:', startDate);
  console.log('  - endDate:', endDate);
  console.log('  - targetAudience:', targetAudience);
  console.log('  - displayLocation:', displayLocation);

  // Validate required fields
  if (!title || !content || !endDate) {
    console.log('❌ Validation failed:');
    console.log('  - title exists:', !!title);
    console.log('  - content exists:', !!content);
    console.log('  - endDate exists:', !!endDate);
    
    return res.status(400).json({
      success: false,
      message: 'Title, content, and end date are required'
    });
  }

  console.log('✅ Validation passed');

  // Process images from uploaded files
  const processedImages = [];
  if (req.files && req.files.length > 0) {
    console.log('📋 Processing uploaded files:', req.files.length);
    processedImages.push(...req.files.map(file => ({
      url: file.location,
      alt: file.originalname,
      caption: ''
    })));
    console.log('📋 Processed images:', processedImages);
  } else {
    console.log('📋 No files uploaded');
  }

  // Add any additional images from request body
  if (images && Array.isArray(images)) {
    processedImages.push(...images);
  }

  const announcementData = {
    title,
    content,
    type: type || 'info',
    priority: priority || 'medium',
    startDate: startDate || new Date(),
    endDate: new Date(endDate),
    targetAudience: targetAudience || 'all',
    displayLocation: displayLocation || 'top',
    images: processedImages,
    createdBy: req.admin.id
  };

  console.log('📋 Final announcement data:', announcementData);

  try {
    const announcement = await Announcement.create(announcementData);
    console.log('✅ Announcement created successfully:', announcement._id);

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'name email');
    console.log('✅ Announcement populated successfully');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: {
        announcement: populatedAnnouncement
      }
    });
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
});

// Update announcement
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  const {
    title,
    content,
    type,
    priority,
    startDate,
    endDate,
    targetAudience,
    displayLocation,
    images,
    removeImages,
    isActive
  } = req.body;

  // Handle image updates
  let updatedImages = announcement.images || [];

  // Remove specified images
  if (removeImages && Array.isArray(removeImages)) {
    const imagesToRemove = updatedImages.filter(img => 
      removeImages.includes(img.url)
    );
    
    // Delete from S3
    await deleteMultipleImagesFromS3(imagesToRemove.map(img => img.url));
    
    // Remove from array
    updatedImages = updatedImages.filter(img => 
      !removeImages.includes(img.url)
    );
  }

  // Add new uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({
      url: file.location,
      alt: file.originalname,
      caption: ''
    }));
    updatedImages.push(...newImages);
  }

  // Add any additional images from request body
  if (images && Array.isArray(images)) {
    updatedImages.push(...images);
  }

  // Update announcement
  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    req.params.id,
    {
      title: title || announcement.title,
      content: content || announcement.content,
      type: type || announcement.type,
      priority: priority || announcement.priority,
      startDate: startDate ? new Date(startDate) : announcement.startDate,
      endDate: endDate ? new Date(endDate) : announcement.endDate,
      targetAudience: targetAudience || announcement.targetAudience,
      displayLocation: displayLocation || announcement.displayLocation,
      images: updatedImages,
      isActive: isActive !== undefined ? isActive : announcement.isActive,
      updatedBy: req.admin.id
    },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: {
      announcement: updatedAnnouncement
    }
  });
});

// Delete announcement
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Delete images from S3
  if (announcement.images && announcement.images.length > 0) {
    const imageUrls = announcement.images.map(img => img.url);
    await deleteMultipleImagesFromS3(imageUrls);
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

// Bulk operations
const bulkDeleteAnnouncements = asyncHandler(async (req, res) => {
  const { announcementIds } = req.body;

  if (!announcementIds || !Array.isArray(announcementIds) || announcementIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Announcement IDs array is required'
    });
  }

  // Get announcements to delete their images
  const announcements = await Announcement.find({ _id: { $in: announcementIds } });
  
  // Delete images from S3
  for (const announcement of announcements) {
    if (announcement.images && announcement.images.length > 0) {
      const imageUrls = announcement.images.map(img => img.url);
      await deleteMultipleImagesFromS3(imageUrls);
    }
  }

  // Delete announcements
  const result = await Announcement.deleteMany({ _id: { $in: announcementIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} announcements deleted successfully`
  });
});

// Toggle announcement status
const toggleAnnouncementStatus = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  announcement.isActive = !announcement.isActive;
  await announcement.save();

  res.status(200).json({
    success: true,
    message: `Announcement ${announcement.isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      announcement
    }
  });
});

// Get active announcements for frontend
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const { location, audience } = req.query;

  const filter = {
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };

  if (location) {
    filter.displayLocation = location;
  }

  if (audience) {
    filter.targetAudience = audience;
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name')
    .sort({ priority: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      announcements
    }
  });
});

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,
  toggleAnnouncementStatus,
  getActiveAnnouncements
}; 