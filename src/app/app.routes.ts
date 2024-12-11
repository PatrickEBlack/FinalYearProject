// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';
import { AuthGuard } from './services/auth-guard.service';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        //lazyloading home page
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about.page').then(m => m.AboutPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('./contact/contact.page').then(m => m.ContactPage),
        //canActivate: [AuthGuard],
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'livestock',
        loadComponent: () => import('./livestock/livestock.page').then( m => m.LivestockPage)
      },
      {
        //if the path is empty, redirect to home
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  //ensure the app always starts with the 'tabs' view
  { path: '', redirectTo: '/tabs', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },

];