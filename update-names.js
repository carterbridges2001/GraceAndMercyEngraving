const fs = require('fs');
const path = require('path');

// Files to update (add all HTML files in your project)
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
    'saved-items.html'
];

// Replacement mappings
const replacements = [
    { from: 'Ruminary Exchange', to: 'Grace and Mercy Engraving' },
    { from: 'Ruminary', to: 'Grace and Mercy Engraving' },
    { from: 'info@ruminaryexchange.com', to: 'info@graceandmercyengraving.com' },
    { from: '123 Farm Road, Goatville, TX 78901', to: 'Your Business Address Here' },
    { from: '(555) 123-4567', to: '(Your Phone Number)' },
    { from: 'premier goat marketplace', to: 'premier Christian engraving service' },
    { from: 'goat', to: 'engraving', flags: 'gi' },
    { from: 'Goat', to: 'Engraving' },
    { from: 'livestock', to: 'custom engravings' },
    { from: 'breeder', to: 'artist', flags: 'gi' },
    { from: 'farm', to: 'studio', flags: 'gi' }
];

// Process each file
filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        try {
            // Read file content
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            // Apply all replacements
            replacements.forEach(replace => {
                const regex = new RegExp(replace.from, replace.flags || 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, replace.to);
                    updated = true;
                }
            });
            
            // Write back if changes were made
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated: ${file}`);
            } else {
                console.log(`ℹ️  No changes needed: ${file}`);
            }
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('\nUpdate complete!');
