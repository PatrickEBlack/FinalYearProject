import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonTextarea,
  IonCheckbox,
  IonList,
  IonListHeader,
  IonPopover,
  ModalController,
  IonRadioGroup,
  IonRadio
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  warningOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  closeOutline,
  thermometerOutline,
  scaleOutline,
  calendarOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-check-animal-modal',
  templateUrl: './check-animal-modal.component.html',
  styleUrls: ['./check-animal-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonTextarea,
    IonCheckbox,
    IonList,
    IonListHeader,
    IonPopover,
    IonRadioGroup,
    IonRadio
  ]
})
export class CheckAnimalModalComponent implements OnInit {
  @Input() animal: any;
  
  statusOptions = [
    { id: 'critical', name: 'Needs Vet Attention', icon: 'alert-circle-outline', color: 'danger' },
    { id: 'warning', name: 'Monitoring Required', icon: 'warning-outline', color: 'warning' },
    { id: 'stable', name: 'Recovering', icon: 'checkmark-circle-outline', color: 'success' },
    { id: 'remove', name: 'Remove from Monitoring', icon: 'close-outline', color: 'medium' }
  ];
  
  observations: string = '';
  isPopoverOpen = false;
  selectedStatus: string = '';
  
  constructor(private modalCtrl: ModalController) {
    addIcons({
      'alert-circle-outline': alertCircleOutline,
      'warning-outline': warningOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'chevron-down-outline': chevronDownOutline,
      'close-outline': closeOutline,
      'thermometer-outline': thermometerOutline,
      'scale-outline': scaleOutline,
      'calendar-outline': calendarOutline
    });
  }
  
  ngOnInit() {
    if (this.animal) {
      // Set initial status
      this.selectedStatus = this.animal.status;
      
      // Set initial observations based on previous notes
      this.observations = this.animal.notes || '';
    }
  }
  
  getStatusIcon(statusId: string): string {
    const status = this.statusOptions.find(s => s.id === statusId);
    return status?.icon || 'warning-outline';
  }
  
  getStatusColor(statusId: string): string {
    const status = this.statusOptions.find(s => s.id === statusId);
    return status?.color || 'medium';
  }
  
  getStatusName(statusId: string): string {
    const status = this.statusOptions.find(s => s.id === statusId);
    return status?.name || 'Monitoring Required';
  }
  
  toggleCheckbox(task: any) {
    task.checked = !task.checked;
  }
  
  changeStatus(status: string) {
    this.selectedStatus = status;
    this.isPopoverOpen = false;
  }
  
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  
  save() {
    const data = {
      status: this.selectedStatus,
      observations: this.observations,
      tasks: this.animal.monitoringTasks
    };
    this.modalCtrl.dismiss(data, 'confirm');
  }
}