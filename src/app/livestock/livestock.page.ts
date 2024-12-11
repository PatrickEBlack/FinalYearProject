import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-livestock',
  templateUrl: './livestock.page.html',
  styleUrls: ['./livestock.page.scss'],
  standalone: true,
  imports: [RouterLink, IonicModule],
})
export class LivestockPage {

  constructor(private router: Router) {} // Router must be injected in the constructor

  ngOnInit() {
  }

}
