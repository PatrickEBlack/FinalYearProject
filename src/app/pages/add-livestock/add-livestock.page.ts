import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmark, 
  close, 
  chevronDownOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-add-livestock',
  templateUrl: './add-livestock.page.html',
  styleUrls: ['./add-livestock.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonIcon,
    CommonModule, 
    FormsModule,
    RouterLink,
  ]
})
export class AddLivestockPage implements OnInit {
  selectedLivestockType: string = '';
  selectedAmount: number | null = null;
  addDetailsNow: boolean | null = null;

  constructor() {
    // Register the Ionicons we need
    addIcons({
      'checkmark': checkmark,
      'close': close,
      'chevron-down-outline': chevronDownOutline
    });
  }

  ngOnInit() {
  }

  selectLivestockType(type: string) {
    this.selectedLivestockType = type;
  }

  selectAmount(amount: number) {
    this.selectedAmount = amount;
  }

  setAddDetails(value: boolean) {
    this.addDetailsNow = value;
  }
}