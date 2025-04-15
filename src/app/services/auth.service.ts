// src/app/services/auth.service.ts
/**
 * Service responsible for handling authentication operations
 * including user registration, authentication, password reset, and sign out.
 */
import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  sendEmailVerification,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';


//Interface for authentication request data
interface UserAuthData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Firebase Authentication instance
  private readonly firebaseAuth = inject(Auth);
  
  // Authentication state
  private authState = new BehaviorSubject<User | null>(null);
  public authState$ = this.authState.asObservable();
  
  constructor() {
    // Set persistence to local (survive browser restart)
    setPersistence(this.firebaseAuth, browserLocalPersistence)
      .then(() => {
        console.log('Firebase persistence set to LOCAL');
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
    
    // Subscribe to auth state changes
    onAuthStateChanged(this.firebaseAuth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      this.authState.next(user);
    });
  }

  /**
   * Registers a new user with email and password and sends verification email
   * @param userAuthData - The user's email and password
   * @returns Promise resolving to UserCredential
   */
  async registerUser(userAuthData: UserAuthData): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      this.firebaseAuth,
      userAuthData.email,
      userAuthData.password
    );
    
    // Send verification email
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    
    return userCredential;
  }

  /**
   * Authenticates a user with email and password
   * @param userAuthData - The user's email and password
   * @returns Promise resolving to UserCredential
   */
  async authenticateUser(userAuthData: UserAuthData): Promise<UserCredential> {
    console.log('Authentication attempt for:', userAuthData.email);
    
    // Ensure persistence is set before login attempt
    try {
      await setPersistence(this.firebaseAuth, browserLocalPersistence);
      console.log('Firebase persistence confirmed as LOCAL before login');
    } catch (error) {
      console.error('Error setting persistence before login:', error);
    }
    
    const userCredential = await signInWithEmailAndPassword(
      this.firebaseAuth,
      userAuthData.email,
      userAuthData.password
    );
    
    // Save some user info to localStorage as additional fallback
    if (userCredential.user) {
      console.log('User authenticated successfully, UID:', userCredential.user.uid);
      localStorage.setItem('user_authenticated', 'true');
      localStorage.setItem('user_email', userCredential.user.email || '');
      localStorage.setItem('user_uid', userCredential.user.uid);
    }
    
    return userCredential;
  }

  /**
   * Gets the current authenticated user
   * @returns The current User or null
   */
  fetchActiveUser(): User | null {
    return this.firebaseAuth.currentUser;
  }

  /**
   * Initiates password reset process for a user
   * @param userEmail - The email address for password reset
   * @returns Promise resolving when email is sent
   */
  async resetPassword(userEmail: string): Promise<void> {
    return sendPasswordResetEmail(this.firebaseAuth, userEmail);
  }

  /**
   * Checks if user is currently authenticated
   * @returns boolean indicating if user is logged in
   */
  isAuthenticated(): boolean {
    return !!this.firebaseAuth.currentUser || !!this.authState.value;
  }
  
  /**
   * Gets the current auth state as an observable
   * @returns Observable of User or null
   */
  getAuthState(): Observable<User | null> {
    return this.authState$;
  }
  
  /**
   * Gets the current auth state value
   * @returns User or null
   */
  getAuthStateValue(): User | null {
    return this.authState.value;
  }
  
  /**
   * Checks if the current user's email is verified
   * @returns boolean indicating if email is verified
   */
  isEmailVerified(): boolean {
    // Check both current user and auth state
    const currentUser = this.firebaseAuth.currentUser;
    const stateUser = this.authState.value;
    
    return !!(currentUser?.emailVerified || stateUser?.emailVerified);
  }
  
  /**
   * Resends verification email to current user
   * @returns Promise resolving when email is sent
   */
  async resendVerificationEmail(): Promise<void> {
    const currentUser = this.firebaseAuth.currentUser;
    if (currentUser) {
      return sendEmailVerification(currentUser);
    }
    throw new Error('No user is currently signed in');
  }

  /**
   * Returns a promise with the current user
   * Useful for components that need to wait for auth state
   * @returns Promise resolving to the current user or null
   */
  async getCurrentUser(): Promise<User | null> {
    // First check if we have the user already
    if (this.firebaseAuth.currentUser) {
      console.log('getCurrentUser - user found immediately:', this.firebaseAuth.currentUser.uid);
      return this.firebaseAuth.currentUser;
    }
    
    // If not, check the auth state
    if (this.authState.value) {
      console.log('getCurrentUser - user found in authState:', this.authState.value.uid);
      return this.authState.value;
    }
    
    // Otherwise, wait for the auth state to be determined
    console.log('getCurrentUser - waiting for auth state to resolve...');
    return new Promise((resolve, reject) => {
      // Set a timeout to avoid hanging indefinitely
      const timeoutId = setTimeout(() => {
        console.log('getCurrentUser - timeout reached, no user found');
        unsubscribe();
        resolve(null);
      }, 5000); // 5 second timeout
      
      const unsubscribe = this.firebaseAuth.onAuthStateChanged(user => {
        clearTimeout(timeoutId);
        unsubscribe();
        console.log('getCurrentUser - auth state resolved:', user ? 'user found' : 'no user');
        resolve(user);
      }, error => {
        clearTimeout(timeoutId);
        console.error('getCurrentUser - error in auth state check:', error);
        reject(error);
      });
    });
  }
  
  // Store active verification codes
  private activeVerificationCodes: Map<string, { code: string, timestamp: number }> = new Map();
  
  /**
   * Generates a secure random 6-digit verification code and stores it with a timestamp
   * @param email Email address to associate with the code
   * @returns 6-digit numerical code as string
   */
  generateVerificationCode(email: string): string {
    // Use a cryptographically secure random number generator
    const secureCode = this.generateSecureRandomCode();
    
    // Store the code with current timestamp
    this.activeVerificationCodes.set(email, {
      code: secureCode,
      timestamp: Date.now()
    });
    
    return secureCode;
  }
  
  /**
   * Generates a cryptographically secure random 6-digit code
   * @returns 6-digit code as string
   */
  private generateSecureRandomCode(): string {
    // Generate a secure 6-digit code
    const min = 100000; // Smallest 6-digit number
    const max = 999999; // Largest 6-digit number
    
    // Create an array of 2 random bytes (16 bits)
    const randomBytes = new Uint8Array(2);
    
    // Fill with cryptographically secure random values
    // In a real app, use window.crypto.getRandomValues(randomBytes)
    // For this simulation, we'll use Math.random
    randomBytes[0] = Math.floor(Math.random() * 256);
    randomBytes[1] = Math.floor(Math.random() * 256);
    
    // Convert to a number between 0 and 65535
    const randomValue = (randomBytes[0] << 8) | randomBytes[1];
    
    // Scale to our desired range
    const scaledValue = min + Math.floor((randomValue / 65535) * (max - min + 1));
    
    // Return as a string, padded to 6 digits
    return scaledValue.toString().padStart(6, '0');
  }
  
  /**
   * Verifies if a code is valid for the given email and within the time limit
   * @param email Email address to check
   * @param code Code to verify
   * @returns boolean indicating if code is valid
   */
  verifyCode(email: string, code: string): boolean {
    // Get the stored code and timestamp
    const storedData = this.activeVerificationCodes.get(email);
    
    // If no code exists, verification fails
    if (!storedData) {
      console.log('No verification code found for', email);
      return false;
    }
    
    // Check if the code has expired (10 minutes = 600,000 ms)
    const now = Date.now();
    const TEN_MINUTES = 10 * 60 * 1000;
    
    if (now - storedData.timestamp > TEN_MINUTES) {
      console.log('Verification code expired for', email);
      // Invalidate the expired code
      this.activeVerificationCodes.delete(email);
      return false;
    }
    
    // Check if the code matches
    const isValid = storedData.code === code;
    
    // If valid, remove the used code
    if (isValid) {
      this.activeVerificationCodes.delete(email);
    }
    
    return isValid;
  }
  
  /**
   * Simulates sending an email verification code
   * In a production environment, this would use a real email service
   * @param email Email address to send verification to
   * @param code Verification code to send
   * @returns Promise that resolves when email is "sent"
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    // In a real implementation, this would connect to an email service
    console.log(`SIMULATED EMAIL to ${email} with code: ${code}`);
    console.log(`This code will expire in 10 minutes.`);
    
    // Check if we already have an active code for this email
    const existingCode = this.activeVerificationCodes.get(email);
    if (existingCode) {
      console.log('Previous code invalidated for', email);
    }
    
    // Simulate network delay
    return new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, you would use a service like Firebase Functions, SendGrid, etc.
    // return fetch('https://your-api-endpoint.com/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     email, 
    //     code,
    //     subject: 'Your Password Change Verification Code',
    //     message: `Your password change verification code is: ${code}\nThis code will expire in 10 minutes.`
    //   })
    // });
  }

  /**
   * Reauthenticates the user with their email and current password
   * Required before sensitive operations like password change
   * @param email User's email address
   * @param currentPassword User's current password
   * @returns Promise resolving to UserCredential
   */
  async reauthenticateUser(email: string, currentPassword: string): Promise<UserCredential> {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    console.log(`Reauthenticating user: ${email}`);
    const credential = EmailAuthProvider.credential(email, currentPassword);
    return reauthenticateWithCredential(user, credential);
  }
  
  /**
   * Updates the user's password after reauthentication
   * @param newPassword The new password to set
   * @returns Promise resolving when password is updated
   */
  async updatePassword(newPassword: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    console.log('Updating user password');
    return updatePassword(user, newPassword);
  }

  /**
   * Signs out the current user
   * @returns Promise resolving when sign out is complete
   */
  async signOutUser(): Promise<void> {
    console.log('Signing out user');
    
    // Clear our localStorage items
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_uid');
    localStorage.removeItem('returnUrl');
    
    // Sign out from Firebase
    return signOut(this.firebaseAuth);
  }
}

// THIS WAS THE CODE BEFORE FIREBASE IMPLEMENTATION
// // src/app/services/auth.service.ts
// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private loggedIn = false;

//   isLoggedIn(): boolean {
//     return this.loggedIn;
//   }

//   login() {
//     this.loggedIn = true;
//   }

//   logout() {
//     this.loggedIn = false;
//   }
// }
// ORIGINAL CODE ENDS HERE