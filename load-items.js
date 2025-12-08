// load-items.js - Script to load items from Firebase
import { getDocs, collection, db } from './firebase-config.js';

async function loadItemsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        return items;
    } catch (error) {
        console.error("Error loading items: ", error);
        return [];
    }
}

// Function to update the featured items on index.html
async function updateFeaturedItems() {
    const itemsGrid = document.querySelector('.items-grid');
    if (!itemsGrid) return;
    
    const items = await loadItemsFromFirebase();
    
    if (items.length === 0) {
        itemsGrid.innerHTML = '<p>No items available at the moment.</p>';
        return;
    }
    
    // Display up to 4 items
    const displayItems = items.slice(0, 4);
    
    itemsGrid.innerHTML = displayItems.map(item => `
        <div class="item-card">
            <div class="item-image" style="background-image: url('${item.imageUrl || 'images/5294293766857341368.jpg.jpeg'}')"></div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span class="price">$${item.price}</span>
        </div>
    `).join('');
}

// Function to update the gallery page
async function updateGalleryItems() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    const items = await loadItemsFromFirebase();
    
    if (items.length === 0) {
        galleryGrid.innerHTML = '<p>No items available at the moment.</p>';
        return;
    }
    
    galleryGrid.innerHTML = items.map(item => `
        <div class="gallery-item">
            <img src="${item.imageUrl || 'images/5294293766857341368.jpg.jpeg'}" alt="${item.name}" class="gallery-img">
            <div class="gallery-info">
                <span class="gallery-category">${item.category}</span>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">$${item.price}</span>
            </div>
        </div>
    `).join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on index.html
    if (document.querySelector('.items-grid')) {
        updateFeaturedItems();
    }
    
    // Check if we're on gallery.html
    if (document.querySelector('.gallery-grid')) {
        updateGalleryItems();
    }
});

// Export functions for use in other scripts
window.loadItemsFromFirebase = loadItemsFromFirebase;
window.updateFeaturedItems = updateFeaturedItems;
window.updateGalleryItems = updateGalleryItems;
