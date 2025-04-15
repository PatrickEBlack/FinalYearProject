import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { TextSizeService } from './services/text-size.service';

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
    private textSizeService: TextSizeService
  ) {}

  ngOnInit() {
    // Initialize auth state early
    this.authService.getAuthState().subscribe(user => {
      console.log('App component detected auth state change:', user ? 'logged in' : 'logged out');
    });
    
    // Initialize text size from saved preference
    this.textSizeService.textSize$.subscribe(size => {
      // This will apply the text size when it changes
      document.documentElement.style.fontSize = `${size}%`;
    });
    
    // Handle any attempts to navigate to the old news page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Redirect from news to ai-helper
      if (event.url === '/tabs/news') {
        this.router.navigateByUrl('/tabs/ai-helper');
      }
    });
  }
}
