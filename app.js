// Firebase configuration
const firebaseConfig = {
    // You'll need to replace this with your own Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const goatGrid = document.querySelector('.goat-grid');
const loginBtn = document.querySelector('.btn-outline');
const shopNowBtn = document.querySelector('.btn-primary');

// Sample goat data (will be replaced with Firestore data)
let goats = [];

// Check auth state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginBtn.textContent = 'My Account';
        loginBtn.href = 'account.html';
        shopNowBtn.textContent = 'Sell a Goat';
        shopNowBtn.href = 'sell.html';
        loadGoats();
    } else {
        // No user is signed in
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
        shopNowBtn.textContent = 'Shop Now';
        shopNowBtn.href = '#goats';
        loadGoats(); // Still load goats for non-logged in users
    }
});

// Load goats from Firestore
function loadGoats() {
    db.collection('goats').where('status', '==', 'available')
        .get()
        .then((querySnapshot) => {
            goatGrid.innerHTML = ''; // Clear existing content
            querySnapshot.forEach((doc) => {
                const goat = { id: doc.id, ...doc.data() };
                displayGoat(goat);
            });
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

// Display a single goat card
function displayGoat(goat) {
    const goatCard = document.createElement('div');
    goatCard.className = 'goat-card';
    
    goatCard.innerHTML = `
        <div class="goat-image" style="background-image: url('${goat.imageUrl || 'https://via.placeholder.com/300x200?text=Goat+Image'}')"></div>
        <div class="goat-info">
            <h3>${goat.name}</h3>
            <p class="price">$${goat.price.toLocaleString()}</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${goat.location}</p>
            <p class="description">${goat.description || 'Healthy and well-cared for goat.'}</p>
            <div class="goat-actions">
                <button onclick="viewGoatDetails('${goat.id}')" class="btn btn-primary">View Details</button>
                <button onclick="requestPurchase('${goat.id}')" class="btn btn-outline">Request to Buy</button>
            </div>
        </div>
    `;
    
    goatGrid.appendChild(goatCard);
}

// View goat details
function viewGoatDetails(goatId) {
    // Redirect to a details page or show a modal
    window.location.href = `goat-details.html?id=${goatId}`;
}

// Request to purchase a goat
function requestPurchase(goatId) {
    const user = auth.currentUser;
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    // Create a purchase request
    db.collection('purchaseRequests').add({
        goatId: goatId,
        userId: user.uid,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Your purchase request has been submitted. The seller will review it shortly.');
    })
    .catch((error) => {
        console.error("Error submitting purchase request: ", error);
        alert('There was an error submitting your request. Please try again.');
    });
}

// Initialize the app
function initApp() {
    // Add any initialization code here
}

// Load the app when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', initApp);
