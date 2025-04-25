import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonBackButton,
  IonButtons,
  AlertController,
  ModalController,
  LoadingController,
  IonInput,
  ToastController,
  IonRange,
  IonItemDivider,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  logOutOutline, 
  personOutline, 
  mailOutline, 
  keyOutline,
  settingsOutline,
  lockClosedOutline,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  eyeOutline,
  eyeOffOutline,
  textOutline,
  accessibilityOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { TextSizeService } from '../../services/text-size.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
    IonBackButton,
    IonButtons,
    IonInput,
    IonRange,
    IonItemDivider,
    IonNote
  ]
})
export class ProfilePage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private formBuilder = inject(FormBuilder);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private textSizeService = inject(TextSizeService);
  
  user: any = null;
  userEmail: string = '';
  
  // Text size settings
  textSize: number = 100;
  minTextSize: number = 80;
  maxTextSize: number = 150;
  
  // Password change form
  passwordForm: FormGroup;
  verificationForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  // Two-factor auth
  verificationCode: string = '';
  verificationEmailSent = false;
  verificationStep = false;
  expectedVerificationCode = '';
  
  constructor() {
    addIcons({
      'log-out-outline': logOutOutline,
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'key-outline': keyOutline,
      'settings-outline': settingsOutline,
      'lock-closed-outline': lockClosedOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'text-outline': textOutline,
      'accessibility-outline': accessibilityOutline
    });
    
    // Initialize forms
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validators: this.passwordMatchValidator });
    
    this.verificationForm = this.formBuilder.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    this.loadUserData();
    
    // Initialize text size from service
    this.textSize = this.textSizeService.getTextSize();
    this.minTextSize = this.textSizeService.getMinSize();
    this.maxTextSize = this.textSizeService.getMaxSize();
  }

  loadUserData() {
    const user = this.auth.fetchActiveUser();
    if (user) {
      this.user = user;
      this.userEmail = user.email || '';
    }
  }
  
  // Toggle password visibility
  togglePasswordVisibility(field: string) {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
  
  // Password match validator
  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Open change password modal
  async openChangePasswordModal() {
    // Reset forms
    this.passwordForm.reset();
    this.verificationForm.reset();
    this.verificationStep = false;
    
    // Show the password change form alert
    const alert = await this.alertController.create({
      header: 'Change Password',
      cssClass: 'password-change-alert',
      inputs: [
        {
          name: 'currentPassword',
          type: this.showCurrentPassword ? 'text' : 'password',
          placeholder: 'Current Password',
          cssClass: 'password-input',
          attributes: {
            autocomplete: 'current-password'
          }
        },
        {
          name: 'newPassword',
          type: this.showNewPassword ? 'text' : 'password',
          placeholder: 'New Password',
          cssClass: 'password-input',
          attributes: {
            autocomplete: 'new-password'
          }
        },
        {
          name: 'confirmPassword',
          type: this.showConfirmPassword ? 'text' : 'password',
          placeholder: 'Confirm New Password',
          cssClass: 'password-input',
          attributes: {
            autocomplete: 'new-password'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Next',
          handler: async (data) => {
            // Validate input
            if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
              this.showToast('Please fill in all fields');
              return false;
            }
            
            // Validate password length
            if (data.newPassword.length < 6) {
              this.showToast('Password must be at least 6 characters');
              return false;
            }
            
            // Check if passwords match
            if (data.newPassword !== data.confirmPassword) {
              this.showToast('Passwords do not match');
              return false;
            }
            
            // Update the password form values
            this.passwordForm.get('currentPassword')?.setValue(data.currentPassword);
            this.passwordForm.get('newPassword')?.setValue(data.newPassword);
            this.passwordForm.get('confirmPassword')?.setValue(data.confirmPassword);
            
            // Verify current password before proceeding
            const loading = await this.loadingController.create({
              message: 'Verifying current password...',
              spinner: 'circular'
            });
            await loading.present();
            
            try {
              // Verify the current password by attempting to reauthenticate
              if (!this.userEmail) {
                throw new Error('User email not available');
              }
              
              await this.auth.reauthenticateUser(this.userEmail, data.currentPassword);
              
              // If we get here, authentication was successful, proceed to verification step
              loading.dismiss();
              this.sendVerificationCode();
              
            } catch (error: any) {
              loading.dismiss();
              
              // Handle specific Firebase auth errors
              if (error.code === 'auth/wrong-password') {
                this.showToast('Current password is incorrect');
              } else if (error.code === 'auth/too-many-requests') {
                this.showToast('Too many unsuccessful attempts. Please try again later');
              } else {
                this.showToast(`Verification failed: ${error.message}`);
              }
              
              console.error('Password verification error:', error);
              return false;
            }
            
            return false;
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  // Send verification code
  async sendVerificationCode() {
    // Show loading
    const loading = await this.loadingController.create({
      message: 'Sending verification code...',
      spinner: 'circular'
    });
    await loading.present();
    
    try {
      // Validate user email exists
      if (!this.userEmail) {
        throw new Error('User email not available');
      }
      
      // Generate a secure random 6-digit code with the enhanced auth service method
      this.expectedVerificationCode = this.auth.generateVerificationCode(this.userEmail);
      
      // Send the code via email
      await this.auth.sendVerificationEmail(this.userEmail, this.expectedVerificationCode);
      
      // Update verification state
      this.verificationEmailSent = true;
      this.verificationStep = true;
      
      loading.dismiss();
      
      // Show verification code input alert
      this.showVerificationAlert();
      
    } catch (error: any) {
      loading.dismiss();
      this.showToast(`Failed to send verification code: ${error.message}`);
    }
  }
  
  // Show verification alert
  async showVerificationAlert() {
    const alert = await this.alertController.create({
      header: 'Two-Factor Authentication',
      message: `A verification code has been sent to ${this.userEmail}. 
                Please enter the 6-digit code to continue.
                This code will expire in 10 minutes.`,
      cssClass: 'verification-alert',
      inputs: [
        {
          name: 'verificationCode',
          type: 'text',
          placeholder: 'Enter 6-digit code',
          attributes: {
            maxlength: 6,
            minlength: 6,
            inputmode: 'numeric',
            pattern: '[0-9]*',
            autocomplete: 'one-time-code'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            // Reset verification state
            this.verificationEmailSent = false;
            this.verificationStep = false;
            this.expectedVerificationCode = '';
          }
        },
        {
          text: 'Resend Code',
          cssClass: 'secondary',
          handler: () => {
            // Keep the alert open
            this.sendVerificationCode();
            return false;
          }
        },
        {
          text: 'Verify',
          handler: async (data) => {
            // Validate code
            if (!data.verificationCode || data.verificationCode.length !== 6) {
              this.showToast('Please enter a valid 6-digit code');
              return false;
            }
            
            // Verify the code using the auth service's verification method
            if (this.auth.verifyCode(this.userEmail, data.verificationCode)) {
              // Code verified successfully, proceed with password change
              this.verificationForm.get('verificationCode')?.setValue(data.verificationCode);
              this.completePasswordChange();
              return true;
            } else {
              this.showToast('Invalid or expired verification code. Please try again or request a new code.');
              return false;
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  // Complete the password change
  async completePasswordChange() {
    // Show loading
    const loading = await this.loadingController.create({
      message: 'Changing password...',
      spinner: 'circular'
    });
    await loading.present();
    
    try {
      // Get new password from form
      const newPassword = this.passwordForm.get('newPassword')?.value;
      
      if (!newPassword) {
        throw new Error('Missing new password');
      }
      
      // Change password (we already authenticated in the previous step)
      await this.auth.updatePassword(newPassword);
      
      loading.dismiss();
      
      // Clear sensitive data
      this.passwordForm.reset();
      this.verificationForm.reset();
      this.expectedVerificationCode = '';
      this.verificationEmailSent = false;
      this.verificationStep = false;
      
      // Show success message
      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Your password has been changed successfully.',
        buttons: ['OK']
      });
      
      await alert.present();
      
    } catch (error: any) {
      loading.dismiss();
      
      let errorMessage = 'Failed to change password';
      
      // Provide more specific error messages based on common Firebase auth errors
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security reasons, please log out and log back in before changing your password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Error changing password:', error);
      
      // Show error message
      const alert = await this.alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK']
      });
      
      await alert.present();
    }
  }
  
  // Helper to show toasts
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    
    await toast.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: async () => {
            try {
              await this.auth.signOutUser();
              this.router.navigateByUrl('/login', { replaceUrl: true });
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onTextSizeChange(event: Event) {
    const ionRange = event.target as HTMLIonRangeElement;
    const newSize = ionRange.value as number;
    this.textSizeService.setTextSize(newSize);
  }

  async resetPassword() {
    if (this.userEmail) {
      try {
        await this.auth.resetPassword(this.userEmail);
        const alert = await this.alertController.create({
          header: 'Success',
          message: 'Password reset email sent. Please check your inbox.',
          buttons: ['OK']
        });
        await alert.present();
      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: `Failed to send password reset email: ${error.message}`,
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }
}