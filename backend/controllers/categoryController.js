const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { isActive, parentCategory } = req.query;

    const query = {};
    
    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }
    
    if (parentCategory) {
      query.parentCategory = parentCategory;
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, sortOrder } = req.body;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if category with same slug exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentCategory,
      sortOrder
    });

    const populatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category: populatedCategory }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Generate new slug if name changed
    if (name && name !== category.name) {
      const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Check if new slug exists
      const existingCategory = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
      
      category.slug = newSlug;
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (typeof isActive === 'boolean') category.isActive = isActive;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updatedCategory }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: category._id });
    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 });

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => 
          parentId === null 
            ? !item.parentCategory 
            : item.parentCategory.toString() === parentId.toString()
        )
        .map(item => ({
          ...item.toObject(),
          children: buildTree(items, item._id)
        }));
    };

    const categoryTree = buildTree(categories);

    res.status(200).json({
      success: true,
      data: { categories: categoryTree }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
}; 