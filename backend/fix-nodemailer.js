const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing nodemailer function names...\n');

const newsletterControllerPath = path.join(__dirname, 'controllers', 'newsletterController.js');
const adminNewsletterControllerPath = path.join(__dirname, 'controllers', 'adminNewsletterController.js');
const testEmailConfigPath = path.join(__dirname, 'test-email-config.js');

// Read the files
let newsletterController = fs.readFileSync(newsletterControllerPath, 'utf8');
let adminNewsletterController = fs.readFileSync(adminNewsletterControllerPath, 'utf8');
let testEmailConfig = fs.readFileSync(testEmailConfigPath, 'utf8');

// Replace createTransporter with createTransport
newsletterController = newsletterController.replace(/createTransporter/g, 'createTransport');
adminNewsletterController = adminNewsletterController.replace(/createTransporter/g, 'createTransport');
testEmailConfig = testEmailConfig.replace(/createTransporter/g, 'createTransport');

// Write the files back
fs.writeFileSync(newsletterControllerPath, newsletterController);
fs.writeFileSync(adminNewsletterControllerPath, adminNewsletterController);
fs.writeFileSync(testEmailConfigPath, testEmailConfig);

console.log('✅ Fixed nodemailer function names in:');
console.log('  - controllers/newsletterController.js');
console.log('  - controllers/adminNewsletterController.js');
console.log('  - test-email-config.js');

console.log('\n📖 Now you can test the newsletter flow again.'); 