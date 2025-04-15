// src/app/tabs/tabs.page.ts
import { Component } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  informationCircleOutline, 
  settingsOutline, 
  pawOutline, 
  cloudyOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel, 
    IonBadge, 
    IonRouterOutlet, 
    RouterLink
  ],
})
export class TabsPage {
  constructor() {
    addIcons({ 
      'home-outline': homeOutline, 
      'information-circle-outline': informationCircleOutline, 
      'settings-outline': settingsOutline, 
      'paw-outline': pawOutline,
      'cloudy-outline': cloudyOutline
    });
  }
}