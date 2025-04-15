import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonToggle,
  IonList,
  IonListHeader,
  IonIcon,
  IonItemDivider,
  IonNote,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  AlertController,
  IonRange
} from '@ionic/angular/standalone';
// Theme service import removed
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  moonOutline,
  sunnyOutline,
  settingsOutline,
  helpCircleOutline,
  personOutline,
  keyOutline,
  notificationsOutline,
  cloudOutline,
  languageOutline,
  shieldOutline,
  logOutOutline,
  cloudyOutline,
  textOutline,
  accessibilityOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { TextSizeService } from '../../services/text-size.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonToggle,
    IonList,
    IonListHeader,
    IonIcon,
    IonItemDivider,
    IonNote,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonRange,
    RouterLink
  ]
})
export class SettingsPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private textSizeService = inject(TextSizeService);
  
  textSize: number = 100;
  minTextSize: number = 80;
  maxTextSize: number = 150;

  constructor() {
    // Register the Ionicons we need
    addIcons({
      'moon-outline': moonOutline,
      'sunny-outline': sunnyOutline,
      'settings-outline': settingsOutline,
      'help-circle-outline': helpCircleOutline,
      'person-outline': personOutline,
      'key-outline': keyOutline,
      'notifications-outline': notificationsOutline,
      'cloud-outline': cloudOutline,
      'cloudy-outline': cloudyOutline,
      'language-outline': languageOutline,
      'shield-outline': shieldOutline,
      'log-out-outline': logOutOutline,
      'text-outline': textOutline,
      'accessibility-outline': accessibilityOutline
    });
  }

  ngOnInit() {
    // Initialize text size from service
    this.textSize = this.textSizeService.getTextSize();
    this.minTextSize = this.textSizeService.getMinSize();
    this.maxTextSize = this.textSizeService.getMaxSize();
  }
  
  onTextSizeChange(event: Event) {
    const ionRange = event.target as HTMLIonRangeElement;
    const newSize = ionRange.value as number;
    this.textSizeService.setTextSize(newSize);
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
}