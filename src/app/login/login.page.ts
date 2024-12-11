// src/app/login/login.page.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IonicModule } from '@ionic/angular';
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
    IonicModule
  ],
})
// Export Login Page for external use
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  //Hide the Password
  isPasswordVisible = false;

  userAuthForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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

  async handleRegistration() {
    if (this.userAuthForm.valid) {
      await this.auth.registerUser(this.userAuthForm.getRawValue());
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  async handleAuthentication() {
    if (this.userAuthForm.valid) {
      await this.auth.authenticateUser(this.userAuthForm.getRawValue());
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }

  async handlePasswordReset() {


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