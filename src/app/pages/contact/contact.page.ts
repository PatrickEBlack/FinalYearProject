import { ActivatedRoute, Router } from '@angular/router';
import { Component } from '@angular/core';
import { 
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel
  ]
})
export class ContactPage {
  constructor(private authService: AuthService, private router: Router) {}

  //Redirects the user to Login / Sign Up Page
  goToLogin() {
    this.router.navigate(['/tabs/login'])
  }
  // logout() {
  //   this.authService.logout();
  //   this.router.navigate(['/tabs/home']);
  // }
}