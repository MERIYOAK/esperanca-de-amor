const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Home improvement and garden supplies',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Books, movies, and digital media',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Health products and beauty supplies',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Toys, games, and entertainment',
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car parts and automotive accessories',
    isActive: true,
    sortOrder: 8
  },
  {
    name: 'Food & Beverages',
    slug: 'food-beverages',
    description: 'Food items and beverages',
    isActive: true,
    sortOrder: 9
  },
  {
    name: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    description: 'Jewelry and fashion accessories',
    isActive: true,
    sortOrder: 10
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories:`);

    createdCategories.forEach(category => {
      console.log(`  - ${category.name} (${category.slug})`);
    });

    console.log('\n🎉 Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories(); 