import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-to-pasture',
  templateUrl: './add-to-pasture.page.html',
  styleUrls: ['./add-to-pasture.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AddToPasturePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
