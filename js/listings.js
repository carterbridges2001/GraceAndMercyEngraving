// Use global db reference
const db = window.db;
const auth = window.auth;

// Listing operations
const listingService = {
    // Create a new listing
    async createListing(listingData) {
        if (!authUtils.getCurrentUser()) {
            throw new Error('User must be logged in to create a listing');
        }
        
        const userId = authUtils.getCurrentUser().uid;
        const listing = {
            ...listingData,
            userId,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            views: 0,
            isSponsored: listingData.isSponsored || false,
            // Ensure images is always an array
            images: Array.isArray(listingData.images) ? listingData.images : []
        };
        
        // Add to Firestore
        const docRef = await db.collection('listings').add(listing);
        
        // Update user's listing count
        await authUtils.updateUserStats(userId, { listingsCount: 1 });
        
        return { id: docRef.id, ...listing };
    },
    
    // Update an existing listing
    async updateListing(listingId, updates) {
        if (!authUtils.getCurrentUser()) {
            throw new Error('User must be logged in to update a listing');
        }
        
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();
        
        if (!listingDoc.exists) {
            throw new Error('Listing not found');
        }
        
        if (listingDoc.data().userId !== authUtils.getCurrentUser().uid) {
            throw new Error('Not authorized to update this listing');
        }
        
        await listingRef.update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        return this.getListing(listingId);
    },
    
    // Get a single listing by ID
    async getListing(listingId, incrementViews = true) {
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();
        
        if (!listingDoc.exists) {
            throw new Error('Listing not found');
        }
        
        // Increment view count if this is a view
        if (incrementViews) {
            await listingRef.update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            
            // Also update user's total views if this is not the owner viewing
            const listingData = listingDoc.data();
            if (authUtils.getCurrentUser()?.uid !== listingData.userId) {
                await authUtils.updateUserStats(listingData.userId, { totalViews: 1 });
            }
        }
        
        return { id: listingDoc.id, ...listingDoc.data() };
    },
    
    // Get listings with filters and pagination
    async getListings({ limit = 10, startAfter = null, filters = {} } = {}) {
        let query = db.collection('listings')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc');
            
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                query = query.where(key, '==', value);
            }
        });
        
        // Apply pagination
        if (startAfter) {
            const lastDoc = await db.collection('listings').doc(startAfter).get();
            query = query.startAfter(lastDoc);
        }
        
        query = query.limit(limit);
        
        const snapshot = await query.get();
        const listings = [];
        snapshot.forEach(doc => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        
        return {
            listings,
            lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
        };
    },
    
    // Get user's listings
    async getUserListings(userId, { limit = 10, startAfter = null } = {}) {
        let query = db.collection('listings')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');
            
        if (startAfter) {
            const lastDoc = await db.collection('listings').doc(startAfter).get();
            query = query.startAfter(lastDoc);
        }
        
        query = query.limit(limit);
        
        const snapshot = await query.get();
        const listings = [];
        snapshot.forEach(doc => {
            listings.push({ id: doc.id, ...doc.data() });
        });
        
        return {
            listings,
            lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
        };
    },
    
    // Delete a listing
    async deleteListing(listingId) {
        if (!authUtils.getCurrentUser()) {
            throw new Error('User must be logged in to delete a listing');
        }
        
        const listingRef = db.collection('listings').doc(listingId);
        const listingDoc = await listingRef.get();
        
        if (!listingDoc.exists) {
            throw new Error('Listing not found');
        }
        
        if (listingDoc.data().userId !== authUtils.getCurrentUser().uid) {
            throw new Error('Not authorized to delete this listing');
        }
        
        await listingRef.delete();
        
        // Update user's listing count
        await authUtils.updateUserStats(authUtils.getCurrentUser().uid, { listingsCount: -1 });
        
        return true;
    }
};

// Make available globally
window.listingService = listingService;
