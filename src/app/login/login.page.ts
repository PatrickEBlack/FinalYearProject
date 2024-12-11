// src/app/login/login.page.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [ IonicModule ],
})
export class LoginPage {
  constructor(private authService: AuthService, private router: Router) {}

  //login method
  login() {
    this.authService.login();
    this.router.navigate(['/tabs/contact']);
  }
}