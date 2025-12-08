// Function to update UI based on authentication state
function updateUI(user) {
    const userProfile = document.getElementById('userProfile');
    const userGreeting = document.getElementById('userGreeting');
    const loginBtn = document.getElementById('loginBtn');
    
    if (user) {
        // User is signed in
        document.body.classList.add('logged-in');
        if (userProfile) userProfile.style.display = 'block';
        if (userGreeting) userGreeting.textContent = user.displayName || user.email.split('@')[0];
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        // User is signed out
        document.body.classList.remove('logged-in');
        if (userProfile) userProfile.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
    }
}

// Handle user registration
async function handleRegister(e) {
    console.log('Starting registration process...');
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const fullName = document.getElementById('fullName').value;
    
    console.log('Form values:', { email, password, confirmPassword, fullName });
    
    // Validation
    if (password !== confirmPassword) {
        const errorMsg = 'Passwords do not match';
        console.error('Validation error:', errorMsg);
        showError(errorMsg);
        return;
    }
    
    if (password.length < 6) {
        const errorMsg = 'Password must be at least 6 characters long';
        console.error('Validation error:', errorMsg);
        showError(errorMsg);
        return;
    }
    
    try {
        console.log('Attempting to create user with email/password...');
        
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('User created successfully:', userCredential.user.uid);
        
        // Update user profile with display name
        console.log('Updating user profile with display name...');
        await userCredential.user.updateProfile({
            displayName: fullName
        });
        
        // Create user document in Firestore
        console.log('Creating user document in Firestore...');
        const userData = {
            uid: userCredential.user.uid,
            displayName: fullName,
            email: email,
            emailVerified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'buyer' // Default role
        };
        
        await db.collection('users').doc(userCredential.user.uid).set(userData);
        console.log('User document created in Firestore');
        
        // Send email verification
        console.log('Sending email verification...');
        await userCredential.user.sendEmailVerification({
            url: window.location.origin
        });
        console.log('Email verification sent');
        
        // Show success message
        const successMsg = 'Account created successfully! Please check your email to verify your account.';
        console.log(successMsg);
        showSuccess(successMsg);
        
        // Redirect to home page after a short delay
        console.log('Will redirect to home page in 3 seconds...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        const errorMsg = `Registration error: ${error.message || 'Unknown error'}`;
        console.error(errorMsg, error);
        showError(getErrorMessage(error));
    }
}

// Handle email/password login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="remember"]')?.checked || false;
    
    try {
        // Set persistence based on remember me
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Update last login time in Firestore
        await db.collection('users').doc(userCredential.user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error));
    }
}

// Google Sign-In
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Sign in with popup
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if user is new
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        if (isNewUser) {
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'google.com',
                role: 'buyer',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login time
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError(getErrorMessage(error));
    }
}

// Facebook Sign-In
async function signInWithFacebook() {
    try {
        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('public_profile');
        provider.addScope('email');
        
        // Sign in with popup
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if user is new
        const isNewUser = result.additionalUserInfo.isNewUser;
        
        if (isNewUser) {
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'facebook.com',
                role: 'buyer',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login time
            await db.collection('users').doc(user.uid).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Redirect to home page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Facebook sign-in error:', error);
        showError(getErrorMessage(error));
    }
}

// Handle password reset
async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    try {
        await auth.sendPasswordResetEmail(email);
        showSuccess('Password reset email sent. Please check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        showError(getErrorMessage(error));
    }
}

// Handle user logout
function handleLogout() {
    auth.signOut().then(() => {
        // Sign-out successful
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        showError('Error signing out. Please try again.');
    });
}

// Helper function to show error messages (disabled)
function showError(message) {
    console.error('Error:', message); // Log to console instead of showing to user
    // Don't display any error messages to the user
}

// Helper function to show success messages (disabled)
function showSuccess(message) {
    console.log('Success:', message); // Log to console instead of showing to user
    // Don't display any success messages to the user
}

// Helper function to get user-friendly error messages
function getErrorMessage(error) {
    if (!error.code) return error.message || 'An error occurred. Please try again.';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/operation-not-allowed':
            return 'This operation is not allowed. Please contact support.';
        case 'auth/weak-password':
            return 'The password is too weak. Please choose a stronger password.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/popup-closed-by-user':
            return 'Sign in was cancelled.';
        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with the same email but different sign-in credentials.';
        case 'auth/auth-domain-config-required':
            return 'Authentication domain configuration is required.';
        case 'auth/cancelled-popup-request':
            return 'Only one popup request is allowed at a time.';
        case 'auth/operation-not-supported-in-this-environment':
            return 'This operation is not supported in this environment.';
        case 'auth/timeout':
            return 'The operation timed out. Please try again.';
        default:
            return error.message || 'An unknown error occurred.';
    }
}

// Initialize event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing event listeners');
    
    // Check if we're on the login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, adding submit handler');
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if we're on the registration page
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Register form found, adding submit handler');
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            handleRegister(e);
        });
    }

    // Check if we're on the forgot password page
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }

    // Social login buttons - Register page
    const googleRegisterBtn = document.getElementById('googleRegister');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', signInWithGoogle);
    }

    const facebookRegisterBtn = document.getElementById('facebookRegister');
    if (facebookRegisterBtn) {
        facebookRegisterBtn.addEventListener('click', signInWithFacebook);
    }

    // Social login buttons - Login page
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', signInWithGoogle);
    }

    const facebookLoginBtn = document.getElementById('facebookLogin');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', signInWithFacebook);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    updateUI(user);
});

// Export functions for use in other modules
window.authModule = {
    handleLogin,
    handleRegister,
    handleResetPassword,
    signInWithGoogle,
    signInWithFacebook,
    handleLogout,
    getErrorMessage
};
