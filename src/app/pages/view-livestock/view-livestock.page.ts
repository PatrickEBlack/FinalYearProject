import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-livestock',
  templateUrl: './view-livestock.page.html',
  styleUrls: ['./view-livestock.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ViewLivestockPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
