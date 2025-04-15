import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonDatetime,
  AlertController,
  IonRadioGroup,
  IonRadio,
  LoadingController
} from '@ionic/angular/standalone';
import { LivestockService, Livestock } from '../../services/livestock.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  warningOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  addOutline,
  calendarOutline,
  timeOutline,
  closeOutline,
  saveOutline,
  clipboardOutline
} from 'ionicons/icons';

// Define interfaces for the data structures
interface MonitoringTask {
  task: string;
  checked: boolean;
}

interface MonitoredAnimal {
  id: string | number;
  name: string;
  tag: string | number;
  herdNumber: string;
  type: string;
  breed: string;
  status: string;
  notes: string;
  lastChecked: string;
  monitorUntil: string;
  temperature: string;
  weight: string;
  reasonForMonitoring: string;
  monitoringTasks: MonitoringTask[];
}

interface LivestockItem {
  id: string | number;
  name: string;
  type: string;
  tag: string | number;
  herdNumber?: string;
}

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.page.html',
  styleUrls: ['./monitor.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonRadioGroup,
    IonRadio
  ]
})
export class MonitorPage implements OnInit {
  // Will be populated from the database
  allLivestock: LivestockItem[] = [];

  // Will be populated from localStorage or database in the future
  monitoredLivestock: MonitoredAnimal[] = [];
  
  // Monitoring statuses
  monitoringStatuses: {id: string, name: string, icon: string, color: string}[] = [
    { id: 'critical', name: 'Needs Vet Attention', icon: 'alert-circle-outline', color: 'danger' },
    { id: 'warning', name: 'Monitoring Required', icon: 'warning-outline', color: 'warning' },
    { id: 'stable', name: 'Recovering', icon: 'checkmark-circle-outline', color: 'success' }
  ];
  
  // New animal monitoring form
  newMonitor: {
    animalId: string | number | null;
    status: string;
    notes: string;
    monitorUntil: string;
    reasonForMonitoring: string;
    monitoringChecks: string;
  } = {
    animalId: null,
    status: 'warning',
    notes: '',
    monitorUntil: '',
    reasonForMonitoring: '',
    monitoringChecks: ''
  };

  constructor(
    private alertCtrl: AlertController,
    private livestockService: LivestockService,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {
    // Register the Ionicons
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'warning-outline': warningOutline,
      'alert-circle-outline': alertCircleOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'chevron-back-outline': chevronBackOutline,
      'add-outline': addOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'close-outline': closeOutline,
      'save-outline': saveOutline,
      'clipboard-outline': clipboardOutline
    });
  }

  async ngOnInit() {
    // Format the current date for the default monitorUntil value
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7); // Default to 7 days from now
    
    // Format as YYYY-MM-DD
    const formattedDate = futureDate.toISOString().split('T')[0];
    this.newMonitor.monitorUntil = formattedDate;
    
    // Load livestock data
    await this.loadLivestockData();
    
    // Load monitored livestock from localStorage
    this.loadMonitoredLivestock();
    
    // Sort animals by status priority (critical first, then warning, then stable)
    this.sortAnimalsByPriority();
  }
  
  async loadLivestockData() {
    const user = this.authService.fetchActiveUser();
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    const loading = await this.loadingController.create({
      message: 'Loading livestock data...'
    });
    await loading.present();
    
    try {
      this.livestockService.getLivestock(user.uid).subscribe(livestock => {
        // Convert livestock data to the format needed for the monitor page
        this.allLivestock = livestock.map(item => ({
          id: item._id || '',  // Ensure it's always a string
          name: `${item.type} #${item.tagNumber || 'Unknown'}`,
          type: item.type,
          tag: item.tagNumber || 'Unknown',
          herdNumber: item.herdNumber || 'Unknown'
        }));
        
        loading.dismiss();
      }, error => {
        console.error('Error loading livestock:', error);
        loading.dismiss();
        // No placeholder data, just empty array
        this.allLivestock = [];
      });
    } catch (error) {
      console.error('Error in loadLivestockData:', error);
      loading.dismiss();
      this.allLivestock = [];
    }
  }
  
  loadMonitoredLivestock() {
    // Try to load from localStorage
    const saved = localStorage.getItem('monitoredLivestock');
    if (saved) {
      try {
        this.monitoredLivestock = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing monitored livestock data:', e);
        this.monitoredLivestock = [];
      }
    }
  }
  
  saveMonitoredLivestock() {
    // Save to localStorage
    localStorage.setItem('monitoredLivestock', JSON.stringify(this.monitoredLivestock));
  }
  
  // Sort animals by priority
  sortAnimalsByPriority() {
    const statusPriority: Record<string, number> = {
      'critical': 1,
      'warning': 2,
      'stable': 3
    };
    
    this.monitoredLivestock.sort((a, b) => {
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'stable': return 'success';
      default: return 'medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'critical': return 'alert-circle-outline';
      case 'warning': return 'warning-outline';
      case 'stable': return 'checkmark-circle-outline';
      default: return 'warning-outline';
    }
  }
  
  // Show the add animal dialog
  async showAddAnimalDialog() {
    // Reset form
    this.newMonitor = {
      animalId: null,
      status: 'warning',
      notes: '',
      monitorUntil: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      reasonForMonitoring: '',
      monitoringChecks: ''
    };
    
    // Get available livestock (those not already being monitored)
    const availableLivestock = this.allLivestock.filter((animal: LivestockItem) => 
      !this.monitoredLivestock.find((monitored: MonitoredAnimal) => monitored.id === animal.id)
    );
    
    if (availableLivestock.length === 0) {
      // No available animals to monitor
      const alert = await this.alertCtrl.create({
        header: 'No Animals Available',
        message: 'All animals are already being monitored.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
    // First, let user select an animal with a radio group
    const selectAnimalAlert = await this.alertCtrl.create({
      header: 'Select Animal',
      cssClass: 'select-animal-alert',
      inputs: availableLivestock.map(animal => ({
        name: 'animalId',
        type: 'radio',
        label: animal.name,
        value: animal.id.toString(),
        checked: animal.id === availableLivestock[0].id
      })),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Next',
          handler: (data) => {
            this.showMonitoringDetailsAlert(parseInt(data));
            return true;
          }
        }
      ]
    });
    
    await selectAnimalAlert.present();
  }
  
  // Show monitoring details after animal is selected
  async showMonitoringDetailsAlert(animalId: number | string) {
    const selectedAnimal = this.allLivestock.find(animal => animal.id === animalId);
    if (!selectedAnimal) return;
    
    const alert = await this.alertCtrl.create({
      header: `Monitor: ${selectedAnimal.name}`,
      cssClass: 'add-animal-alert',
      inputs: [
        {
          name: 'reasonForMonitoring',
          type: 'textarea',
          placeholder: 'Reason for monitoring',
          attributes: {
            maxlength: 100,
            rows: 2
          }
        },
        {
          name: 'monitoringChecks',
          type: 'textarea',
          placeholder: 'What should be monitored (e.g., Ensure animal is standing/eating/drinking)',
          attributes: {
            maxlength: 150,
            rows: 3
          }
        },
        {
          name: 'monitorUntil',
          type: 'date',
          min: new Date().toISOString().split('T')[0],
          value: this.newMonitor.monitorUntil,
          placeholder: 'Monitor until'
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Monitoring Required',
          value: 'warning',
          checked: true,
          handler: () => {
            this.newMonitor.status = 'warning';
          }
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Needs Vet Attention',
          value: 'critical',
          handler: () => {
            this.newMonitor.status = 'critical';
          }
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Recovering',
          value: 'stable',
          handler: () => {
            this.newMonitor.status = 'stable';
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            // Parse monitoring checks into individual tasks
            const monitoringTasks: MonitoringTask[] = data.monitoringChecks
              ? data.monitoringChecks.split(/\n|,/).filter(Boolean).map((task: string) => ({
                  task: task.trim(),
                  checked: false
                }))
              : [];
              
            // Create new monitoring entry
            const newMonitorEntry = {
              id: selectedAnimal.id,
              name: selectedAnimal.name,
              tag: selectedAnimal.tag || 0, // Convert to number or default to 0
              herdNumber: `${selectedAnimal.type?.substring(0,2).toUpperCase() || 'AN'}-${selectedAnimal.tag || '000'}-${Math.floor(1000 + Math.random() * 9000)}`,
              type: selectedAnimal.type || 'Animal',
              breed: 'Unknown',
              status: data.status || 'warning',
              notes: this.getStatusNoteFromId(data.status || 'warning'),
              lastChecked: 'Just now',
              monitorUntil: data.monitorUntil || this.newMonitor.monitorUntil,
              temperature: '38.5°C',
              weight: '0kg',
              reasonForMonitoring: data.reasonForMonitoring || 'General monitoring',
              monitoringTasks: monitoringTasks.length > 0 ? monitoringTasks : [
                { task: 'General health check', checked: false },
                { task: 'Standing', checked: false },
                { task: 'Eating', checked: false },
                { task: 'Drinking', checked: false },
                { task: 'Passing Stool', checked: false }
              ]
            };
            
            // Add to monitored list
            this.monitoredLivestock.push(newMonitorEntry);
            
            // Sort the list by priority
            this.sortAnimalsByPriority();
            
            // Save to localStorage
            this.saveMonitoredLivestock();
            
            return true;
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  // Get a default note based on status
  getStatusNoteFromId(statusId: string): string {
    switch (statusId) {
      case 'critical':
        return 'Needs veterinary attention';
      case 'warning':
        return 'Regular monitoring required';
      case 'stable':
        return 'Recovering, monitor progress';
      default:
        return 'General monitoring';
    }
  }
  
  // Get status color for badges
  getStatusColorClass(status: string): string {
    switch (status) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      case 'stable': return 'success';
      default: return 'medium';
    }
  }
  
  // Get readable status name
  getStatusName(status: string): string {
    switch (status) {
      case 'critical': return 'Needs Vet Attention';
      case 'warning': return 'Monitoring Required';
      case 'stable': return 'Recovering';
      default: return 'Unknown Status';
    }
  }
  
  // Mark animal as checked with a simple alert popup
  async checkAnimal(animalId: number | string) {
    const animal = this.monitoredLivestock.find(a => a.id === animalId);
    if (!animal) return;
    
    // Create the checklist HTML with task items
    const checklistHTML = animal.monitoringTasks.map((task: MonitoringTask, index: number) => 
      `<ion-item lines="none" style="--padding-start: 0; margin-bottom: 5px;">
         <ion-checkbox disabled slot="start" ${task.checked ? 'checked' : ''}></ion-checkbox>
         <ion-label>${task.task}</ion-label>
       </ion-item>`
    ).join('');
    
    // Build animal info header with key details
    const animalInfoHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; background: rgba(var(--ion-color-light-rgb), 0.5); padding: 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 15px;">${animal.type}: ${animal.name}</span>
          <span style="background-color: rgba(var(--ion-color-${this.getStatusColorClass(animal.status)}-rgb), 0.2); 
                       color: var(--ion-color-${this.getStatusColorClass(animal.status)}); 
                       padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
            ${this.getStatusName(animal.status)}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <div><strong>Tag/ID:</strong> ${animal.tag}</div>
          <div><strong>Herd #:</strong> ${animal.herdNumber}</div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <div><strong>Temp:</strong> ${animal.temperature}</div>
          <div><strong>Weight:</strong> ${animal.weight}</div>
        </div>
      </div>
      <div style="margin-bottom: 16px; padding: 10px; border-left: 3px solid var(--ion-color-warning); background-color: rgba(var(--ion-color-warning-rgb), 0.1);">
        <p style="margin: 0; font-style: italic; font-size: 14px;">${animal.reasonForMonitoring}</p>
      </div>
    `;
    
    // Create alert with the complete content
    const alert = await this.alertCtrl.create({
      header: `Check: ${animal.name}`,
      cssClass: 'check-animal-alert',
      message: `
        ${animalInfoHTML}
        <h5 style="margin-top: 16px; margin-bottom: 10px; font-size: 16px; display: flex; align-items: center;">
          <span style="display: inline-block; width: 4px; height: 16px; background-color: var(--ion-color-primary); 
                       margin-right: 8px; border-radius: 4px;"></span>
          Health Checklist
        </h5>
        <div style="margin-bottom: 16px;">
          ${checklistHTML}
        </div>
      `,
      inputs: [
        {
          name: 'observations',
          type: 'textarea',
          placeholder: 'Observations (symptoms, behavior, etc.)',
          value: animal.notes,
          attributes: {
            maxlength: 200,
            rows: 3
          }
        },
        {
          name: 'updateStatus',
          type: 'radio',
          label: 'Change Status:',
          value: 'nochange',
          checked: true
        },
        {
          name: 'updateStatus',
          type: 'radio',
          label: 'Needs Vet Attention',
          value: 'critical',
          checked: false
        },
        {
          name: 'updateStatus',
          type: 'radio',
          label: 'Monitoring Required',
          value: 'warning',
          checked: false
        },
        {
          name: 'updateStatus',
          type: 'radio',
          label: 'Recovering',
          value: 'stable',
          checked: false
        },
        {
          name: 'updateStatus',
          type: 'radio',
          label: 'Remove from Monitoring',
          value: 'remove',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            // Update the last checked time
            animal.lastChecked = 'Just now';
            
            // Update status if changed
            if (data.updateStatus && data.updateStatus !== 'nochange') {
              // Check if status is 'remove' to remove from monitoring
              if (data.updateStatus === 'remove') {
                this.monitoredLivestock = this.monitoredLivestock.filter(a => a.id !== animal.id);
                return true;
              }
              
              // Update the status
              animal.status = data.updateStatus;
              
              // Re-sort animals by priority
              this.sortAnimalsByPriority();
            }
            
            // Update notes if observations provided
            if (data.observations) {
              animal.notes = data.observations;
            }
            
            // Save changes to localStorage
            this.saveMonitoredLivestock();
            
            return true;
          }
        }
      ]
    });
    
    await alert.present();
  }
}