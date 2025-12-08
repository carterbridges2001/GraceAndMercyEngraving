const fs = require('fs');
const path = require('path');

// Files to update (all HTML files in your project)
const filesToUpdate = [
    'index.html',
    'about.html',
    'browse.html',
    'breeders.html',
    'contact.html',
    'faq.html',
    'login.html',
    'register.html',
    'listing.html',
    'listing-details.html',
    'my-listings.html',
    'payment-methods.html',
    'purchases.html',
    'saved-items.html',
    'styles.css',
    'app.js',
    'auth.js'
];

// Email to find and replace
const oldEmails = [
    'info@ruminaryexchange.com',
    'support@ruminary.com',
    'info@graceandmercyengraving.com'  // In case it was already updated
];

const newEmail = 'jackson@graceandmercyengraving.shop';

// Process each file
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        try {
            // Read file content
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            // Check and replace each old email
            oldEmails.forEach(oldEmail => {
                if (content.includes(oldEmail)) {
                    content = content.replace(new RegExp(oldEmail, 'g'), newEmail);
                    updated = true;
                    console.log(`✅ Replaced ${oldEmail} with ${newEmail} in ${file}`);
                }
            });
            
            // Write back if changes were made
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
            } else {
                console.log(`ℹ️  No email updates needed in ${file}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\nEmail update complete!');
