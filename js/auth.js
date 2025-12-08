// Use global auth and db references
const auth = window.auth;
const db = window.db;

// User state - use window.currentUser instead

// DOM Elements
const userProfile = document.getElementById('userProfile');
const userGreeting = document.getElementById('userGreeting');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// User profile management functions
async function createUserProfile(user, additionalData = {}) {
    if (!user) return;
    
    const userRef = db.collection('users').doc(user.uid);
    const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=4f46e5&color=fff`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        stats: {
            listingsCount: 0,
            totalViews: 0,
            memberSince: firebase.firestore.FieldValue.serverTimestamp()
        },
        ...additionalData
    };

    // Create or update user document
    await userRef.set(userData, { merge: true });
    
    return userRef.get();
}

async function updateUserStats(userId, updates) {
    if (!userId) return;
    
    const statsUpdate = {};
    Object.entries(updates).forEach(([key, value]) => {
        statsUpdate[`stats.${key}`] = typeof value === 'number' 
            ? firebase.firestore.FieldValue.increment(value)
            : value;
    });
    
    await db.collection('users').doc(userId).update(statsUpdate);
}

// Authentication state observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        
        // Update UI
        if (userProfile) userProfile.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        
        // Create or update user profile
        const userDoc = await createUserProfile(user);
        
        // Update greeting
        if (userGreeting) {
            const userData = userDoc?.data();
            userGreeting.textContent = userData?.displayName || user.email.split('@')[0];
        }
        
        // Update last login time
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
    } else {
        // User is signed out
        currentUser = null;
        if (userProfile) userProfile.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
    }
});

// Logout function
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

// Expose functions to window
window.authUtils = {
    getCurrentUser: () => currentUser,
    updateUserStats
};
