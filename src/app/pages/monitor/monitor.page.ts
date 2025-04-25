import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
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
  AlertOptions,
  IonRadioGroup,
  IonRadio,
  LoadingController,
  IonSpinner
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
  createOutline
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
    IonRadio,
    IonSpinner
  ]
})
export class MonitorPage implements OnInit {
  // Will be populated from the database
  allLivestock: LivestockItem[] = [];

  // Will be populated from localStorage or database in the future
  monitoredLivestock: MonitoredAnimal[] = [];
  
  // Properties for the animal selector UI
  showingAnimalSelector = false;
  availableLivestock: any[] = [];
  loadingLivestock = false;
  
  // Properties for the monitoring details UI
  showingMonitoringDetails = false;
  selectedAnimal: any = null;
  currentDate = new Date().toISOString().split('T')[0];
  editMode = false;
  editingMonitorId: string | number | null = null;
  
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
    private loadingController: LoadingController,
    private sanitizer: DomSanitizer
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
      'create-outline': createOutline
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
      // Show an alert to the user
      const alert = await this.alertCtrl.create({
        header: 'Authentication Error',
        message: 'You need to be logged in to access livestock data. Please log in and try again.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
    const loading = await this.loadingController.create({
      message: 'Loading livestock data...',
      spinner: 'circular'
    });
    await loading.present();
    
    try {
      // Use promise to make this awaitable
      return new Promise<void>((resolve) => {
        this.livestockService.getLivestock(user.uid).subscribe(
          livestock => {
            console.log(`Received ${livestock.length} livestock records from MongoDB`);
            
            // Convert livestock data to the format needed for the monitor page
            this.allLivestock = livestock.map(item => ({
              id: item._id || '',  // Ensure it's always a string
              name: `${item.type} #${item.tagNumber || 'Unknown'}`,
              type: item.type,
              tag: item.tagNumber || 'Unknown',
              herdNumber: item.herdNumber || 'Unknown'
            }));
            
            // Log the converted livestock for debugging
            console.log('Processed livestock for monitoring:', this.allLivestock);
            
            loading.dismiss();
            resolve();
          }, 
          error => {
            console.error('Error loading livestock from service:', error);
            loading.dismiss();
            // No placeholder data, just empty array
            this.allLivestock = [];
            
            // Show error to user
            this.showErrorAlert('Failed to load livestock data from the server. Please try again later.');
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('Error in loadLivestockData:', error);
      loading.dismiss();
      this.allLivestock = [];
      
      // Show error to user
      this.showErrorAlert('An unexpected error occurred while loading your livestock data.');
      return;
    }
  }
  
  // Helper method to show error alerts
  async showErrorAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  loadMonitoredLivestock() {
    // Get the current user
    const user = this.authService.fetchActiveUser();
    if (!user) {
      console.error('No user logged in');
      this.monitoredLivestock = [];
      return;
    }
    
    // Use user-specific key for localStorage
    const userKey = `monitoredLivestock_${user.uid}`;
    
    // Try to load from localStorage with user-specific key
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        this.monitoredLivestock = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing monitored livestock data:', e);
        this.monitoredLivestock = [];
      }
    } else {
      this.monitoredLivestock = [];
    }
  }
  
  saveMonitoredLivestock() {
    // Get the current user
    const user = this.authService.fetchActiveUser();
    if (!user) {
      console.error('No user logged in, cannot save monitored livestock');
      return;
    }
    
    // Use user-specific key for localStorage
    const userKey = `monitoredLivestock_${user.uid}`;
    
    // Save to localStorage with user-specific key
    localStorage.setItem(userKey, JSON.stringify(this.monitoredLivestock));
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
  
  // Show the animal selector overlay
  async showAnimalSelector() {
    // Reset form
    this.newMonitor = {
      animalId: null,
      status: 'warning',
      notes: '',
      monitorUntil: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      reasonForMonitoring: '',
      monitoringChecks: ''
    };
    
    // Show loading state
    this.loadingLivestock = true;
    this.showingAnimalSelector = true;
    
    try {
      // Get the current user
      const user = this.authService.fetchActiveUser();
      if (!user) {
        this.loadingLivestock = false;
        this.showErrorAlert('Authentication error. Please log in and try again.');
        return;
      }
      
      // Directly fetch detailed livestock data from the service
      this.livestockService.getLivestock(user.uid).subscribe(
        (livestock) => {
          console.log(`Received ${livestock.length} livestock records from MongoDB`);
          
          if (livestock.length === 0) {
            this.loadingLivestock = false;
            this.availableLivestock = [];
            return;
          }
          
          // Get available livestock (those not already being monitored)
          // Use strict string comparison to avoid type conversion issues
          this.availableLivestock = livestock.filter((animal) => 
            !this.monitoredLivestock.find((monitored) => 
              monitored.id.toString() === animal._id?.toString()
            )
          );
          
          this.loadingLivestock = false;
        },
        error => {
          console.error('Error loading livestock data:', error);
          this.loadingLivestock = false;
          this.availableLivestock = [];
          this.showErrorAlert('Failed to load livestock data. Please try again.');
        }
      );
    } catch (error) {
      console.error('Error in showAnimalSelector:', error);
      this.loadingLivestock = false;
      this.availableLivestock = [];
      this.showErrorAlert('An unexpected error occurred. Please try again.');
    }
  }
  
  // Hide the animal selector overlay
  hideAnimalSelector() {
    this.showingAnimalSelector = false;
  }
  
  // Handle animal selection
  selectAnimal(animal: any) {
    // Hide the selector
    this.hideAnimalSelector();
    
    // Save selected animal and show monitoring details
    this.selectedAnimal = animal;
    this.showMonitoringDetails();
  }
  
  // Show monitoring details overlay
  showMonitoringDetails() {
    // If not in edit mode, reset the form with defaults
    if (!this.editMode) {
      this.newMonitor = {
        animalId: this.selectedAnimal?._id || null,
        status: 'warning',
        notes: '',
        monitorUntil: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        reasonForMonitoring: '',
        monitoringChecks: ''
      };
    }
    
    // Show the overlay
    this.showingMonitoringDetails = true;
  }
  
  // Hide monitoring details overlay
  hideMonitoringDetails() {
    this.showingMonitoringDetails = false;
    this.selectedAnimal = null;
    this.editMode = false;
    this.editingMonitorId = null;
  }
  
  // Add animal to monitoring
  addAnimalToMonitoring() {
    if (!this.selectedAnimal || !this.newMonitor.reasonForMonitoring) {
      return;
    }
    
    // Parse monitoring checks into individual tasks
    const monitoringTasks: MonitoringTask[] = this.newMonitor.monitoringChecks
      ? this.newMonitor.monitoringChecks.split(/\n|,/).filter(Boolean).map((task: string) => ({
          task: task.trim(),
          checked: false
        }))
      : [];
      
    // Create new monitoring entry
    const newMonitorEntry = {
      id: this.selectedAnimal._id || '',
      name: `${this.selectedAnimal.quantity || 1} ${this.selectedAnimal.type || 'Unknown'}`,
      tag: this.selectedAnimal.tagNumber || 'N/A',
      herdNumber: `${this.selectedAnimal.type?.substring(0,2).toUpperCase() || 'AN'}-${this.selectedAnimal.tagNumber || '000'}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: this.selectedAnimal.type || 'Animal',
      breed: this.selectedAnimal.breed || 'Unknown',
      status: this.newMonitor.status,
      notes: this.getStatusNoteFromId(this.newMonitor.status),
      lastChecked: 'Just now',
      monitorUntil: this.newMonitor.monitorUntil,
      temperature: '38.5°C',
      weight: '0kg',
      reasonForMonitoring: this.newMonitor.reasonForMonitoring,
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
    
    // Hide overlay
    this.hideMonitoringDetails();
    
    // Show success message
    this.showSuccessAlert(`${newMonitorEntry.name} added to monitoring`);
  }
  
  // Edit an existing monitoring entry
  editMonitoring(animalId: string | number) {
    // Find the animal in the monitored list
    const monitoredAnimal = this.monitoredLivestock.find(animal => 
      animal.id.toString() === animalId.toString()
    );
    
    if (!monitoredAnimal) {
      console.error('Animal not found in monitoring list with ID:', animalId);
      this.showErrorAlert('Animal not found in monitoring list');
      return;
    }
    
    // Set edit mode
    this.editMode = true;
    this.editingMonitorId = animalId;
    
    // Convert the monitoring tasks back to string for editing
    const monitoringChecks = monitoredAnimal.monitoringTasks
      .map(task => task.task)
      .join('\n');
    
    // Populate the form with existing data
    this.newMonitor = {
      animalId: monitoredAnimal.id,
      status: monitoredAnimal.status,
      notes: monitoredAnimal.notes,
      monitorUntil: monitoredAnimal.monitorUntil,
      reasonForMonitoring: monitoredAnimal.reasonForMonitoring,
      monitoringChecks: monitoringChecks
    };
    
    // Fetch the animal data
    const user = this.authService.fetchActiveUser();
    if (user) {
      this.livestockService.getLivestockById(animalId.toString(), user.uid).subscribe(
        (livestock) => {
          if (livestock) {
            this.selectedAnimal = livestock;
            this.showMonitoringDetails();
          } else {
            // If livestock data is not available, use the monitored animal data
            this.selectedAnimal = {
              _id: monitoredAnimal.id,
              type: monitoredAnimal.type,
              tagNumber: monitoredAnimal.tag,
              breed: monitoredAnimal.breed,
              quantity: 1
            };
            this.showMonitoringDetails();
          }
        },
        (error) => {
          console.error('Error fetching livestock details:', error);
          // If there's an error, use the monitored animal data
          this.selectedAnimal = {
            _id: monitoredAnimal.id,
            type: monitoredAnimal.type,
            tagNumber: monitoredAnimal.tag,
            breed: monitoredAnimal.breed,
            quantity: 1
          };
          this.showMonitoringDetails();
        }
      );
    } else {
      // If no user is logged in, use the monitored animal data
      this.selectedAnimal = {
        _id: monitoredAnimal.id,
        type: monitoredAnimal.type,
        tagNumber: monitoredAnimal.tag,
        breed: monitoredAnimal.breed,
        quantity: 1
      };
      this.showMonitoringDetails();
    }
  }
  
  // Update an existing monitoring entry
  updateMonitoring() {
    if (!this.editingMonitorId || !this.newMonitor.reasonForMonitoring) {
      return;
    }
    
    // Find the animal in the monitored list
    const index = this.monitoredLivestock.findIndex(animal => {
      if (!animal.id || !this.editingMonitorId) return false;
      return animal.id.toString() === this.editingMonitorId.toString();
    });
    
    if (index === -1) {
      console.error('Animal not found in monitoring list for update with ID:', this.editingMonitorId);
      this.showErrorAlert('Animal not found in monitoring list');
      return;
    }
    
    // Parse monitoring checks into individual tasks
    const monitoringTasks: MonitoringTask[] = this.newMonitor.monitoringChecks
      ? this.newMonitor.monitoringChecks.split(/\n|,/).filter(Boolean).map((task: string) => ({
          task: task.trim(),
          checked: false
        }))
      : [];
    
    // Preserve existing task checked status if possible
    if (this.monitoredLivestock[index].monitoringTasks.length > 0) {
      // Create a map of existing tasks and their checked status
      const existingTaskMap = new Map(
        this.monitoredLivestock[index].monitoringTasks.map(task => [task.task, task.checked])
      );
      
      // Update the checked status if the task already exists
      monitoringTasks.forEach(task => {
        if (existingTaskMap.has(task.task)) {
          task.checked = existingTaskMap.get(task.task) || false;
        }
      });
    }
    
    // Update the monitoring entry
    this.monitoredLivestock[index] = {
      ...this.monitoredLivestock[index],
      status: this.newMonitor.status,
      notes: this.getStatusNoteFromId(this.newMonitor.status),
      monitorUntil: this.newMonitor.monitorUntil,
      reasonForMonitoring: this.newMonitor.reasonForMonitoring,
      monitoringTasks: monitoringTasks.length > 0 ? monitoringTasks : this.monitoredLivestock[index].monitoringTasks
    };
    
    // Sort the list by priority
    this.sortAnimalsByPriority();
    
    // Save to localStorage
    this.saveMonitoredLivestock();
    
    // Hide overlay
    this.hideMonitoringDetails();
    
    // Show success message
    this.showSuccessAlert(`${this.monitoredLivestock[index].name} monitoring updated`);
  }
  
  // Helper to show success alerts
  async showSuccessAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Success',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  // Format the birthdate to a readable format
  formatBirthDate(dateString?: string): string {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return the original string if it's not a valid date
      }
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'Unknown';
    }
  }
  
  // Show monitoring details after animal is selected
  async showMonitoringDetailsAlert(animalId: number | string, livestockData?: any) {
    // If we have the full livestock data passed directly, use it
    // Otherwise, try to find it in the allLivestock array
    let selectedAnimal: any;
    
    if (livestockData) {
      // Use the detailed livestock data directly
      selectedAnimal = {
        id: livestockData._id,
        name: `${livestockData.quantity || 1} ${livestockData.type || 'Unknown'}`,
        type: livestockData.type,
        tag: livestockData.tagNumber || 'Unknown',
        herdNumber: livestockData.herdNumber || 'Unknown',
        breed: livestockData.breed || 'Unknown',
        birthDate: livestockData.birthDate
      };
    } else {
      // Fall back to using the allLivestock array
      selectedAnimal = this.allLivestock.find(animal => 
        animal.id.toString() === animalId.toString()
      );
    }
    
    if (!selectedAnimal) {
      console.error('Selected animal not found with ID:', animalId);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Selected animal not found. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    
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
  
  // Removed checkAnimal method as it's no longer needed
}