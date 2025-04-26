import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class BackButtonComponent {
  shouldShow = false;
  private previousUrl: string = '';
  private currentUrl: string = '';
  
  // Map of pages to their default back URLs
  private pageBackRoutes: { [key: string]: string } = {
    '/tabs/profile': '/tabs/home',
    '/tabs/view-livestock': '/tabs/manage-livestock',
    '/tabs/add-livestock': '/tabs/manage-livestock',
    '/tabs/monitor': '/tabs/manage-livestock',
    '/tabs/health-check': '/tabs/home',
    '/tabs/weather': '/tabs/home'
  };
  
  constructor(private location: Location, private router: Router) {
    addIcons({
      'arrow-back-outline': arrowBackOutline
    });
    
    // Track navigation to determine when to show back button
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (this.currentUrl) {
        this.previousUrl = this.currentUrl;
      }
      this.currentUrl = event.url;
      
      // Only show back button if not on home or tabs root
      this.shouldShow = !this.isRootPage(this.currentUrl);
    });
  }
  
  isRootPage(url: string): boolean {
    // Only hide back button on root pages
    const rootPages = ['/tabs/home', '/login', '/'];
    return rootPages.some(path => url === path);
  }
  
  goBack(): void {
    // Check if we have a specific route defined for this page
    if (this.currentUrl && this.pageBackRoutes[this.currentUrl]) {
      this.router.navigateByUrl(this.pageBackRoutes[this.currentUrl]);
    } else {
      // Default to browser history
      this.location.back();
    }
  }
}