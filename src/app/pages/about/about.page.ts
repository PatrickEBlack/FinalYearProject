// src/app/home/home.page.ts
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  standalone: true,
  //Anything that is being used by 'home' needs to be imported
  imports: [RouterLink, IonicModule],
  styleUrls: ['./about.page.scss']
})

export class AboutPage {
  constructor(private router: Router) {} // Router must be injected in the constructor
  
  // This method will be contacted through the home.page.html page
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}