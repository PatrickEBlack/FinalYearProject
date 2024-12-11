import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  standalone: true,
  imports: [IonicModule]
})
export class ContactPage {
  constructor(private authService: AuthService, private router: Router) {}

  // logout() {
  //   this.authService.logout();
  //   this.router.navigate(['/tabs/home']);
  // }
}