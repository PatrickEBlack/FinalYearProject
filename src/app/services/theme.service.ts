import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(private storageService: StorageService) {
    // Remove any existing dark mode class from body
    document.body.classList.remove('dark');
    
    // Clear any stored dark mode preference
    this.storageService.remove('darkMode');
  }
  
  // Stub method to prevent errors if it's called elsewhere
  toggleDarkMode() {
    // Does nothing - dark mode is removed
    console.log('Dark mode has been removed from the application');
  }
  
  // Stub method to prevent errors if it's called elsewhere
  setDarkMode(isDark: boolean) {
    // Does nothing - dark mode is removed
    console.log('Dark mode has been removed from the application');
  }
  
  getStorageService(): StorageService {
    return this.storageService;
  }
}