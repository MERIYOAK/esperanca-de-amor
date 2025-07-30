const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Function to upload image to S3
const uploadImageToS3 = async (imageUrl, productName) => {
  try {
    // Download image from URL
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${productName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.jpg`;
    
    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `products/${filename}`,
      Body: Buffer.from(buffer),
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    };

    const result = await s3.upload(uploadParams).promise();
    console.log(`📤 Uploaded ${productName} image to S3: ${result.Location}`);
    
    return {
      url: result.Location,
      alt: productName,
      isPrimary: true
    };
  } catch (error) {
    console.error(`❌ Error uploading ${productName} image:`, error);
    // Fallback to original URL if S3 upload fails
    return {
      url: imageUrl,
      alt: productName,
      isPrimary: true
    };
  }
};

const seedProducts = async () => {
  try {
    // First, create categories if they don't exist
    const categories = [
      { name: 'Fresh Fruits', slug: 'fresh-fruits', description: 'Fresh and organic fruits' },
      { name: 'Beverages', slug: 'beverages', description: 'Hot and cold beverages' },
      { name: 'Organic', slug: 'organic', description: 'Organic and natural products' },
      { name: 'Seafood', slug: 'seafood', description: 'Fresh seafood products' },
      { name: 'Cooking Oils', slug: 'cooking-oils', description: 'Various cooking oils' },
      { name: 'Alcoholic Beverages', slug: 'alcoholic-beverages', description: 'Premium alcoholic beverages' },
      { name: 'Dairy', slug: 'dairy', description: 'Dairy products and cheese' }
    ];

    const createdCategories = {};
    for (const categoryData of categories) {
      let category = await Category.findOne({ slug: categoryData.slug });
      if (!category) {
        category = await Category.create(categoryData);
        console.log(`✅ Created category: ${category.name}`);
      }
      createdCategories[categoryData.name] = category._id;
    }

    // Create demo products that match the frontend demo data exactly
    const demoProducts = [
      {
        name: 'Fresh Avocados',
        slug: 'fresh-avocados',
        description: 'Premium fresh avocados sourced from local farms. These avocados are perfectly ripe and ready to eat. Rich in healthy fats and nutrients, perfect for salads, smoothies, or as a healthy snack.',
        shortDescription: 'Premium fresh avocados sourced from local farms',
        price: 2500,
        originalPrice: 3000,
        category: createdCategories['Fresh Fruits'],
        stock: 50,
        isOnSale: true,
        discount: 17,
        rating: 4.8,
        reviewCount: 124,
        tags: ['Organic', 'Fresh', 'Local'],
        weight: 0.2,
        dimensions: { length: 8, width: 6, height: 4 },
        sku: 'AVO-001',
        featured: true
      },
      {
        name: 'Premium Coffee Beans',
        slug: 'premium-coffee-beans',
        description: 'Premium coffee beans from high-altitude regions. These beans are carefully selected and roasted to perfection, delivering a rich, aromatic coffee experience. Perfect for coffee enthusiasts who appreciate quality.',
        shortDescription: 'Premium coffee beans from high-altitude regions',
        price: 8500,
        category: createdCategories['Beverages'],
        stock: 30,
        isOnSale: false,
        rating: 4.9,
        reviewCount: 89,
        tags: ['Premium', 'Organic', 'Single Origin'],
        weight: 0.5,
        dimensions: { length: 15, width: 10, height: 8 },
        sku: 'COF-001',
        featured: true
      },
      {
        name: 'Organic Honey',
        slug: 'organic-honey',
        description: 'Pure organic honey harvested from local beehives. This natural sweetener is rich in antioxidants and has numerous health benefits. Perfect for tea, baking, or as a natural sweetener.',
        shortDescription: 'Pure organic honey harvested from local beehives',
        price: 4200,
        category: createdCategories['Organic'],
        stock: 75,
        isOnSale: false,
        rating: 4.7,
        reviewCount: 156,
        tags: ['Organic', 'Natural', 'Local'],
        weight: 0.5,
        dimensions: { length: 12, width: 8, height: 6 },
        sku: 'HON-001',
        featured: false
      },
      {
        name: 'Fresh Fish Selection',
        slug: 'fresh-fish-selection',
        description: 'Fresh fish selection caught daily from local waters. These fish are sustainably caught and delivered fresh to ensure the best quality and taste. Perfect for healthy meals.',
        shortDescription: 'Fresh fish selection caught daily from local waters',
        price: 6800,
        originalPrice: 7500,
        category: createdCategories['Seafood'],
        stock: 25,
        isOnSale: true,
        discount: 9,
        rating: 4.6,
        reviewCount: 92,
        tags: ['Fresh', 'Sustainable', 'Local'],
        weight: 1.0,
        dimensions: { length: 25, width: 15, height: 8 },
        sku: 'FIS-001',
        featured: true
      },
      {
        name: 'Local Palm Oil',
        slug: 'local-palm-oil',
        description: 'Traditional local palm oil produced using traditional methods. This oil is rich in nutrients and perfect for cooking traditional dishes. Supports local farmers and traditional production methods.',
        shortDescription: 'Traditional local palm oil produced using traditional methods',
        price: 3500,
        category: createdCategories['Cooking Oils'],
        stock: 40,
        isOnSale: false,
        rating: 4.8,
        reviewCount: 67,
        tags: ['Traditional', 'Local', 'Natural'],
        weight: 1.0,
        dimensions: { length: 18, width: 12, height: 10 },
        sku: 'OIL-001',
        featured: false
      },
      {
        name: 'Imported Wine',
        slug: 'imported-wine',
        description: 'Premium imported wine from renowned vineyards. This wine offers a sophisticated taste profile with rich flavors and aromas. Perfect for special occasions and wine enthusiasts.',
        shortDescription: 'Premium imported wine from renowned vineyards',
        price: 12000,
        originalPrice: 15000,
        category: createdCategories['Alcoholic Beverages'],
        stock: 15,
        isOnSale: true,
        discount: 20,
        rating: 4.5,
        reviewCount: 45,
        tags: ['Premium', 'Imported', 'Wine'],
        weight: 0.75,
        dimensions: { length: 30, width: 8, height: 8 },
        sku: 'WIN-001',
        featured: true
      },
      {
        name: 'Fresh Pineapple',
        slug: 'fresh-pineapple',
        description: 'Sweet and juicy fresh pineapples grown in tropical regions. These pineapples are perfectly ripe and ready to eat. Rich in vitamin C and perfect for smoothies, desserts, or as a healthy snack.',
        shortDescription: 'Sweet and juicy fresh pineapples grown in tropical regions',
        price: 1800,
        category: createdCategories['Fresh Fruits'],
        stock: 60,
        isOnSale: false,
        rating: 4.7,
        reviewCount: 203,
        tags: ['Fresh', 'Tropical', 'Sweet'],
        weight: 1.5,
        dimensions: { length: 20, width: 15, height: 12 },
        sku: 'PIN-001',
        featured: false
      },
      {
        name: 'Imported Cheese',
        slug: 'imported-cheese',
        description: 'Premium imported cheese with rich flavors and creamy texture. This cheese is aged to perfection and offers a sophisticated taste experience. Perfect for cheese boards, cooking, or as a gourmet ingredient.',
        shortDescription: 'Premium imported cheese with rich flavors and creamy texture',
        price: 5500,
        originalPrice: 6200,
        category: createdCategories['Dairy'],
        stock: 35,
        isOnSale: true,
        discount: 11,
        rating: 4.6,
        reviewCount: 78,
        tags: ['Premium', 'Imported', 'Aged'],
        weight: 0.25,
        dimensions: { length: 12, width: 8, height: 4 },
        sku: 'CHE-001',
        featured: true
      }
    ];

    // Image URLs for each product (matching frontend demo data)
    const productImages = [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544943910-4ca6073dd0b4?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop'
    ];

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Create products with S3 image uploads
    const createdProducts = [];
    for (let i = 0; i < demoProducts.length; i++) {
      const productData = demoProducts[i];
      const imageUrl = productImages[i];
      
      console.log(`📤 Uploading image for ${productData.name}...`);
      const uploadedImage = await uploadImageToS3(imageUrl, productData.name);
      
      const product = await Product.create({
        ...productData,
        images: [uploadedImage]
      });
      
      createdProducts.push(product);
      console.log(`✅ Created product: ${product.name} - ID: ${product._id}`);
    }

    console.log(`\n🎉 Successfully created ${createdProducts.length} products with S3 images!`);
    console.log('\n📋 Product Summary:');
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${(product.price / 100).toFixed(2)} - ID: ${product._id}`);
    });

    console.log('\n🚀 Database and S3 seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedProducts();
}); 