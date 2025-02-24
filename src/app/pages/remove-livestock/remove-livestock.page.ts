import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-remove-livestock',
  templateUrl: './remove-livestock.page.html',
  styleUrls: ['./remove-livestock.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RemoveLivestockPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
