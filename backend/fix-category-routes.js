const fs = require('fs');
const path = require('path');

const fixCategoryRoutes = () => {
  try {
    const adminRoutesPath = path.join(__dirname, 'routes', 'admin.js');
    let content = fs.readFileSync(adminRoutesPath, 'utf8');

    // Check if category controller import exists
    if (!content.includes('require(\'../controllers/categoryController\')')) {
      console.log('🔧 Adding category controller import...');
      
      // Find the offer controller import and add category controller after it
      const offerControllerPattern = /\/\/ Import existing offer controller[\s\S]*?} = require\('\.\.\/controllers\/offerController'\);/;
      const categoryControllerImport = `
// Import category controller
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');`;

      content = content.replace(offerControllerPattern, (match) => {
        return match + categoryControllerImport;
      });

      // Add category routes after product routes
      const productRoutesPattern = /\/\/ Product Management Routes[\s\S]*?router\.patch\('\/products\/:id\/stock', updateProductStock\);/;
      const categoryRoutes = `
// Category Management Routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', uploadSingle('categories'), createCategory);
router.put('/categories/:id', uploadSingle('categories'), updateCategory);
router.delete('/categories/:id', deleteCategory);`;

      content = content.replace(productRoutesPattern, (match) => {
        return match + categoryRoutes;
      });

      fs.writeFileSync(adminRoutesPath, content);
      console.log('✅ Category routes added successfully!');
    } else {
      console.log('✅ Category routes already exist!');
    }

    console.log('\n🎉 Category routes fix completed!');
  } catch (error) {
    console.error('❌ Error fixing category routes:', error);
  }
};

fixCategoryRoutes(); 