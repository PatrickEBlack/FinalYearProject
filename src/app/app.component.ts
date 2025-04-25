import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { TextSizeService } from './services/text-size.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, SideMenuComponent, BackButtonComponent],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private textSizeService: TextSizeService,
    private configService: ConfigService
  ) {}

  async ngOnInit() {
    // Load API keys from server
    try {
      await this.configService.loadConfig();
      console.log('API configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load API configuration', error);
    }
    
    // Initialise auth state early
    this.authService.getAuthState().subscribe(user => {
      console.log('App component detected auth state change:', user ? 'logged in' : 'logged out');
    });
    
    // Initialise text size from saved preference
    this.textSizeService.textSize$.subscribe(size => {
      // This will apply the text size when it changes
      document.documentElement.style.fontSize = `${size}%`;
    });
    
    // Initialise routing monitoring
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // For future route handling if needed
    });
  }
}
