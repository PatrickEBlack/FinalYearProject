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
      {
        path: 'view-pasture',
        loadComponent: () => import('./pages/view-pasture/view-pasture.page').then(m => m.ViewPasturePage)
      },
      {
        path: 'add-to-pasture',
        loadComponent: () => import('./pages/add-to-pasture/add-to-pasture.page').then(m => m.AddToPasturePage)
      },
      {
        path: 'modify-pasture',
        loadComponent: () => import('./pages/modify-pasture/modify-pasture.page').then(m => m.ModifyPasturePage)
      },
      {
        path: 'weather',
        loadComponent: () => import('./pages/weather/weather.page').then(m => m.WeatherPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'quick-log',
        loadComponent: () => import('./pages/quick-log/quick-log.page').then(m => m.QuickLogPage)
      },
      {
        path: 'monitor',
        loadComponent: () => import('./pages/monitor/monitor.page').then(m => m.MonitorPage)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks.page').then(m => m.TasksPage)
      },
      {
        path: 'ai-helper',
        loadComponent: () => import('./pages/ai-helper/ai-helper.page').then(m => m.AiHelperPage)
      },
      {
        // Redirect old news route to new ai-helper
        path: 'news',
        redirectTo: 'ai-helper',
        pathMatch: 'full'
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