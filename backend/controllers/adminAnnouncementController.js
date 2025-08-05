const Announcement = require('../models/Announcement');
const { deleteImageFromS3, deleteMultipleImagesFromS3 } = require('../utils/s3Upload');
const asyncHandler = require('../utils/asyncHandler');
const XLSX = require('xlsx');

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

  // Process image from uploaded file
  const processedImages = [];
  if (req.files && req.files.length > 0) {
    console.log('📋 Processing uploaded file:', req.files.length);
    processedImages.push({
      url: req.files[0].location,
      alt: req.files[0].originalname,
      caption: ''
    });
    console.log('📋 Processed image:', processedImages);
  } else {
    console.log('📋 No file uploaded');
  }

  // Add any additional image from request body
  if (images && Array.isArray(images) && images.length > 0) {
    processedImages.push(images[0]);
  }

  // Validate that exactly one image is provided
  if (processedImages.length === 0) {
    console.log('❌ Image validation failed: No image provided');
    return res.status(400).json({
      success: false,
      message: 'One image is required for announcements'
    });
  }

  if (processedImages.length > 1) {
    console.log('❌ Image validation failed: Too many images provided');
    return res.status(400).json({
      success: false,
      message: 'Only one image is allowed per announcement'
    });
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
  let updatedImages = [];

  // Add new uploaded image (replaces existing)
  if (req.files && req.files.length > 0) {
    const newImage = {
      url: req.files[0].location,
      alt: req.files[0].originalname,
      caption: ''
    };
    updatedImages.push(newImage);
  }

  // Add existing image if no new image is uploaded
  if (req.body.existingImage && updatedImages.length === 0) {
    try {
      const existingImage = JSON.parse(req.body.existingImage);
      updatedImages.push(existingImage);
    } catch (error) {
      console.error('Error parsing existing image:', error);
    }
  }

  // Add any additional image from request body
  if (images && Array.isArray(images) && images.length > 0 && updatedImages.length === 0) {
    updatedImages.push(images[0]);
  }

  // Validate that exactly one image is provided
  if (updatedImages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'One image is required for announcements'
    });
  }

  if (updatedImages.length > 1) {
    return res.status(400).json({
      success: false,
      message: 'Only one image is allowed per announcement'
    });
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

// Get announcement statistics
const getAnnouncementStats = asyncHandler(async (req, res) => {
  const totalAnnouncements = await Announcement.countDocuments();
  const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
  const inactiveAnnouncements = await Announcement.countDocuments({ isActive: false });
  
  // Count expiring announcements (within 7 days)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const expiringAnnouncements = await Announcement.countDocuments({
    isActive: true,
    endDate: { $lte: sevenDaysFromNow, $gte: new Date() }
  });

  // Get total views and clicks
  const stats = await Announcement.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: '$views' },
        totalClicks: { $sum: '$clicks' },
        averageViews: { $avg: '$views' },
        averageClicks: { $avg: '$clicks' }
      }
    }
  ]);

  const result = stats[0] || { totalViews: 0, totalClicks: 0, averageViews: 0, averageClicks: 0 };

  res.status(200).json({
    success: true,
    data: {
      totalAnnouncements,
      activeAnnouncements,
      inactiveAnnouncements,
      expiringAnnouncements,
      totalViews: result.totalViews,
      totalClicks: result.totalClicks,
      averageViews: Math.round(result.averageViews),
      averageClicks: Math.round(result.averageClicks)
    }
  });
});

// Export announcements
const exportAnnouncements = asyncHandler(async (req, res) => {
  const { status, type, priority } = req.query;
  
  const filter = {};
  if (status && status !== 'all') {
    filter.isActive = status === 'active';
  }
  if (type && type !== 'all') {
    filter.type = type;
  }
  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  // Create Excel data
  const excelData = announcements.map(announcement => ({
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    isActive: announcement.isActive ? 'Yes' : 'No',
    startDate: new Date(announcement.startDate).toISOString(),
    endDate: new Date(announcement.endDate).toISOString(),
    targetAudience: announcement.targetAudience || 'All',
    displayLocation: announcement.displayLocation || 'All',
    views: announcement.views || 0,
    clicks: announcement.clicks || 0,
    createdBy: announcement.createdBy?.name || 'N/A',
    createdAt: new Date(announcement.createdAt).toISOString()
  }));

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // title
    { wch: 40 }, // content
    { wch: 15 }, // type
    { wch: 12 }, // priority
    { wch: 10 }, // isActive
    { wch: 20 }, // startDate
    { wch: 20 }, // endDate
    { wch: 15 }, // targetAudience
    { wch: 15 }, // displayLocation
    { wch: 8 },  // views
    { wch: 8 },  // clicks
    { wch: 20 }, // createdBy
    { wch: 20 }  // createdAt
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Announcements');

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  // Set headers for Excel download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=announcements-export-${new Date().toISOString().split('T')[0]}.xlsx`);

  // Send the Excel file
  res.send(excelBuffer);
});

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  bulkDeleteAnnouncements,
  toggleAnnouncementStatus,
  getActiveAnnouncements,
  getAnnouncementStats,
  exportAnnouncements
}; 