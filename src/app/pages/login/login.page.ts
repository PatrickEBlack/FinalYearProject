// src/app/login/login.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { 
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  logInOutline,
  personAddOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonRow,
    IonTitle,
    IonToolbar
  ],
})
// Export Login Page for external use
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  returnUrl: string = '/tabs/home';

  //Hide the Password
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;
  isRegistrationMode = false;
  verificationMode = false;
  verificationCode = '';
  expectedVerificationCode = '';
  registrationEmail = '';

  // Create a password match validator that returns a ValidatorFn
  createPasswordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // The abstract control here is the form group
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      
      // Only validate if in registration mode and both fields have values
      if (!confirmPassword) {
        return null;
      }
      
      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  userAuthForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: [''],
    verificationCode: ['']
  }, { validators: this.createPasswordMatchValidator() });

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logInOutline,
      personAddOutline
    });
  }

  ngOnInit() {
    // Get the returnUrl parameter from the URL if present
    this.route.queryParams.subscribe(params => {
      // First check localStorage for a saved return URL
      const savedReturnUrl = localStorage.getItem('returnUrl');
      
      if (savedReturnUrl) {
        console.log('Found saved return URL in localStorage:', savedReturnUrl);
        this.returnUrl = savedReturnUrl;
        // Clear it once we've retrieved it
        localStorage.removeItem('returnUrl');
      } else {
        // Fall back to query param or default
        this.returnUrl = params['returnUrl'] || '/tabs/home';
      }
      
      console.log('Login page will redirect to:', this.returnUrl);
    });
    
    // Check if user is already authenticated
    this.auth.getCurrentUser().then(user => {
      if (user) {
        console.log('User already authenticated on login page load, redirecting to:', this.returnUrl);
        this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      }
    });
  }
  
  // Toggle between login and registration modes
  toggleRegistrationMode() {
    this.isRegistrationMode = !this.isRegistrationMode;
    this.verificationMode = false;
    
    if (this.isRegistrationMode) {
      this.userAuthForm.get('confirmPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.userAuthForm.get('confirmPassword')?.clearValidators();
      this.userAuthForm.get('confirmPassword')?.setValue('');
      this.userAuthForm.get('verificationCode')?.setValue('');
    }
    
    this.userAuthForm.get('confirmPassword')?.updateValueAndValidity();
  }

  async startVerification() {
    const email = this.userAuthForm.get('email')?.value;
    const password = this.userAuthForm.get('password')?.value;
    const confirmPassword = this.userAuthForm.get('confirmPassword')?.value;
    
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      // Save email for registration
      this.registrationEmail = email;
      
      // Generate a verification code with email parameter
      this.expectedVerificationCode = this.auth.generateVerificationCode(email);
      
      // Send verification email (simulated in this implementation)
      await this.auth.sendVerificationEmail(email, this.expectedVerificationCode);
      
      // Show verification input
      this.verificationMode = true;
      
      alert(`A verification code has been sent to ${email}. Please check your email and enter the code to complete registration.`);
    } catch (error: any) {
      alert(`Failed to send verification code: ${error.message}`);
      console.error('Verification error:', error);
    }
  }
  
  async handleRegistration() {
    if (this.userAuthForm.valid) {
      try {
        const email = this.userAuthForm.get('email')?.value;
        const password = this.userAuthForm.get('password')?.value;
        const confirmPassword = this.userAuthForm.get('confirmPassword')?.value;
        
        // Ensure all fields are present
        if (!email || !password || !confirmPassword) {
          alert('Please fill in all required fields');
          return;
        }
        
        // Ensure passwords match
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        // Register the user (Firebase will send verification email)
        await this.auth.registerUser({
          email: email,
          password: password
        });
        
        alert('Registration successful! A verification email has been sent to your email address. Please verify your email before logging in.');
        
        // Reset form to login mode
        this.isRegistrationMode = false;
        this.userAuthForm.get('confirmPassword')?.clearValidators();
        this.userAuthForm.get('confirmPassword')?.setValue('');
        this.userAuthForm.get('confirmPassword')?.updateValueAndValidity();
        
      } catch (error: any) {
        alert(`Registration failed: ${error.message}`);
        console.error('Registration error:', error);
      }
    }
  }

  async handleAuthentication() {
    if (this.userAuthForm.valid) {
      try {
        const email = this.userAuthForm.get('email')?.value;
        const password = this.userAuthForm.get('password')?.value;
        
        // Ensure email and password are not undefined
        if (!email || !password) {
          alert('Email and password are required');
          return;
        }
        
        // Authenticate user
        const userCredential = await this.auth.authenticateUser({
          email: email,
          password: password
        });
        
        console.log('User logged in:', userCredential.user);
        
        // Check if email is verified
        if (!this.auth.isEmailVerified()) {
          const confirmResend = confirm(
            'Your email is not verified. Please check your inbox for the verification email. ' +
            'Would you like us to resend the verification email?'
          );
          
          if (confirmResend) {
            await this.auth.resendVerificationEmail();
            alert('Verification email has been resent. Please check your inbox.');
          }
          
          // Sign out the user since email isn't verified
          await this.auth.signOutUser();
          return;
        }
        
        // Email is verified, proceed with login
        console.log('Navigating to:', this.returnUrl);
        
        // Small delay to allow auth state to propagate
        setTimeout(() => {
          this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
        }, 300);
      } catch (error: any) {
        alert(`Login failed: ${error.message}`);
        console.error('Authentication error:', error);
      }
    }
  }

  async handlePasswordReset() {
    const email = this.userAuthForm.get('email')?.value;
    
    if (!email) {
      alert('Please enter your email address to reset your password');
      return;
    }
    
    try {
      await this.auth.resetPassword(email as string);
      alert('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      alert(`Failed to send password reset email: ${error.message}`);
    }
  }
}

// THIS WAS THE ORIGINAL CODE BEFORE FIREBASE IMPLEMENTATION //
// // src/app/login/login.page.ts
// import { Component } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';
// import { IonicModule } from '@ionic/angular';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.page.html',
//   standalone: true,
//   imports: [ IonicModule ],
// })
// export class LoginPage {
//   constructor(private authService: AuthService, private router: Router) {}

//   //login method
//   login() {
//     this.authService.login();
//     this.router.navigate(['/tabs/contact']);
//   }
// }
// ORIGINAL CODE ENDS HERE //