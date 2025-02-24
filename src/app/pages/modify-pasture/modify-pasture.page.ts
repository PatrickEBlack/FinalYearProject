import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-modify-pasture',
  templateUrl: './modify-pasture.page.html',
  styleUrls: ['./modify-pasture.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ModifyPasturePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
