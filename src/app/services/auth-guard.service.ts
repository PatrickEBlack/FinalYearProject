import { Injectable, inject } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  Router, 
  RouterStateSnapshot, 
  UrlTree 
} from '@angular/router';
import { Observable, map, take, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private router = inject(Router);
  private authService = inject(AuthService);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    
    console.log('AuthGuard canActivate called for URL:', state.url);
    
    try {
      // Always wait for getCurrentUser to resolve, which checks local storage
      const user = await this.authService.getCurrentUser();
      console.log('AuthGuard getCurrentUser returned:', user);
      
      // If user is authenticated
      if (user) {
        console.log('User is authenticated, allowing access to:', state.url);
        
        // If trying to access login page when already logged in, redirect to home
        if (state.url.includes('/login')) {
          console.log('Already logged in, redirecting to home from login page');
          return this.router.createUrlTree(['/tabs/home']);
        }
        
        // Allow access to the requested page
        return true;
      } else {
        console.log('User is NOT authenticated, redirecting to login');
        
        // User is not authenticated, redirect to login
        if (!state.url.includes('/login')) {
          // Save the URL they were trying to access
          const url = state.url;
          console.log('Saving attempted URL for later:', url);
          localStorage.setItem('returnUrl', url);
          return this.router.createUrlTree(['/login']);
        }
        
        // If they're already heading to login page, allow it
        return true;
      }
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      
      // On error, redirect to login
      return this.router.createUrlTree(['/login']);
    }
  }
}