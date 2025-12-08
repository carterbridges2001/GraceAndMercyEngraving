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
    'gallery.html',
    'account.html',
    'account-settings.html'
];

// Update copyright year from 2023 to 2025
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        try {
            // Read file content
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            // Update copyright year
            const copyrightRegex = /©\s*2023\s*Grace and Mercy Engraving/g;
            if (copyrightRegex.test(content)) {
                content = content.replace(copyrightRegex, '© 2025 Grace and Mercy Engraving');
                updated = true;
            }
            
            // Also update other variations
            const otherCopyrightRegex = /©\s*2023\s*Ruminary/g;
            if (otherCopyrightRegex.test(content)) {
                content = content.replace(otherCopyrightRegex, '© 2025 Grace and Mercy Engraving');
                updated = true;
            }
            
            // Update "since 2023" text
            const sinceRegex = /since\s*2023/g;
            if (sinceRegex.test(content)) {
                content = content.replace(sinceRegex, 'since 2025');
                updated = true;
            }
            
            // Write back if changes were made
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated copyright in ${file}`);
            } else {
                console.log(`ℹ️  No copyright updates needed in ${file}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\nCopyright year update complete!');
