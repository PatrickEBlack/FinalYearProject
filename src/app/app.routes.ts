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
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.page').then(m => m.ContactPage),
        //canActivate: [AuthGuard],
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
      },  
      {
        path: 'livestock',
        loadComponent: () => import('./pages/livestock/livestock.page').then( m => m.LivestockPage)
      },
      {
        path: 'manage-livestock',
        loadComponent: () => import('./pages/manage-livestock/manage-livestock.page').then( m => m.ManageLivestockPage)
      },
      {
        path: 'view-livestock',
        loadComponent: () => import('./pages/view-livestock/view-livestock.page').then( m => m.ViewLivestockPage)
      },
      {
        path: 'add-livestock',
        loadComponent: () => import('./pages/add-livestock/add-livestock.page').then( m => m.AddLivestockPage)
      },
      {
        path: 'remove-livestock',
        loadComponent: () => import('./pages/remove-livestock/remove-livestock.page').then( m => m.RemoveLivestockPage)
      },
      {
        path: 'view-pasture',
        loadComponent: () => import('./pages/view-pasture/view-pasture.page').then( m => m.ViewPasturePage)
      },
      {
        path: 'add-to-pasture',
        loadComponent: () => import('./pages/add-to-pasture/add-to-pasture.page').then( m => m.AddToPasturePage)
      },
      {
        path: 'modify-pasture',
        loadComponent: () => import('./pages/modify-pasture/modify-pasture.page').then( m => m.ModifyPasturePage)
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

];