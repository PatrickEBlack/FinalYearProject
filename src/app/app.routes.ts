// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard], // Protect all child routes
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.page').then(m => m.ContactPage),
      },
      {
        path: 'livestock',
        loadComponent: () => import('./pages/livestock/livestock.page').then(m => m.LivestockPage)
      },
      {
        path: 'manage-livestock',
        loadComponent: () => import('./pages/manage-livestock/manage-livestock.page').then(m => m.ManageLivestockPage)
      },
      {
        path: 'view-livestock',
        loadComponent: () => import('./pages/view-livestock/view-livestock.page').then(m => m.ViewLivestockPage)
      },
      {
        path: 'add-livestock',
        loadComponent: () => import('./pages/add-livestock/add-livestock.page').then(m => m.AddLivestockPage)
      },
      {
        path: 'remove-livestock',
        loadComponent: () => import('./pages/remove-livestock/remove-livestock.page').then(m => m.RemoveLivestockPage)
      },
      // Pasture routes removed
      {
        path: 'weather',
        loadComponent: () => import('./pages/weather/weather.page').then(m => m.WeatherPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'monitor',
        loadComponent: () => import('./pages/monitor/monitor.page').then(m => m.MonitorPage)
      },
      {
        path: 'health-check',
        loadComponent: () => import('./pages/health-check/health-check.page').then(m => m.HealthCheckPage)
      },
      {
        //if the path is empty, redirect to home
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  // Default route redirects to login if not authenticated
  { path: '', redirectTo: '/login', pathMatch: 'full' },

];