import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  pawOutline,
  clipboardOutline,
  settingsOutline,
  menuOutline,
  closeOutline,
  chatboxEllipsesOutline,
  personOutline,
  partlySunnyOutline,
  medicalOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon]
})
export class SideMenuComponent {
  menuOpen = false;
  
  constructor(private router: Router) {
    addIcons({
      'home-outline': homeOutline,
      'paw-outline': pawOutline,
      'clipboard-outline': clipboardOutline,
      'settings-outline': settingsOutline,
      'menu-outline': menuOutline,
      'close-outline': closeOutline,
      'chatbox-ellipses-outline': chatboxEllipsesOutline,
      'person-outline': personOutline,
      'partly-sunny-outline': partlySunnyOutline,
      'medical-outline': medicalOutline
    });
  }
  
  toggleMenu(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.menuOpen = !this.menuOpen;
  }
  
  closeMenu() {
    this.menuOpen = false;
  }
  
  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuElement = document.getElementById('side-menu');
    const toggleButton = document.getElementById('menu-toggle');
    
    if (this.menuOpen && menuElement && toggleButton) {
      if (!menuElement.contains(event.target as Node) && 
          !toggleButton.contains(event.target as Node)) {
        this.closeMenu();
      }
    }
  }
  
  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeMenu();
  }
}