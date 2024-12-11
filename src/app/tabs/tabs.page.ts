// src/app/tabs/tabs.page.ts
import { Component } from '@angular/core';
import { IonBadge, IonicModule, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { RouterLink, RouterOutlet } from '@angular/router';
import { addIcons } from 'ionicons';
import { home, person, notifications } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  standalone: true,
  imports: [IonicModule, RouterLink, RouterOutlet],
})
export class TabsPage {
  notificationCount = 3; // This will be displayed in the badge
  
  constructor() {
    addIcons({ home, person, notifications });
  }
}