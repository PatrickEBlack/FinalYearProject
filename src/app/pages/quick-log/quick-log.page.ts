import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonBackButton,
  IonButtons,
  IonInput,
  IonItem,
  IonLabel,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { LivestockService } from '../../services/livestock.service';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  closeOutline,
  createOutline,
  trashOutline,
  chevronBackOutline,
  saveOutline,
  restaurantOutline,
  bedOutline,
  medicalOutline,
  heartOutline,
  addCircleOutline,
  flowerOutline,
  waterOutline,
  sunnyOutline,
  leafOutline,
  timeOutline,
  calendarOutline,
  nutritionOutline,
  thermometerOutline,
  bagOutline,
  checkmarkCircleOutline,
  cartOutline,
  clipboardOutline,
  cloudOutline,
  pawOutline,
  appsOutline,
  checkmark
} from 'ionicons/icons';

interface TaskItem {
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-quick-log',
  templateUrl: './quick-log.page.html',
  styleUrls: ['./quick-log.page.scss'],
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
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonBackButton,
    IonButtons,
    IonInput,
    IonItem,
    IonLabel
  ]
})
export class QuickLogPage implements OnInit {
  tasks: TaskItem[] = [
    { name: 'Feeding', icon: 'restaurant', color: '#4CAF50' },
    { name: 'Bedding', icon: 'bed', color: '#2196F3' },
    { name: 'Vaccinations', icon: 'medical', color: '#9C27B0' },
    { name: 'Breeding', icon: 'heart', color: '#F44336' }
  ];

  isAddingTask = false;
  newTaskName = '';
  newTaskIcon = 'nutrition';
  newTaskColor = '';
  
  // For handling back navigation
  previousUrl: string = '/tabs/manage-livestock';

  iconOptions = [
    { name: 'Eating', value: 'restaurant' },
    { name: 'Bed', value: 'bed' },
    { name: 'Medical', value: 'medical' },
    { name: 'Heart', value: 'heart' },
    { name: 'Flower', value: 'flower' },
    { name: 'Water', value: 'water' },
    { name: 'Sun', value: 'sunny' },
    { name: 'Leaf', value: 'leaf' },
    { name: 'Timer', value: 'time' },
    { name: 'Calendar', value: 'calendar' },
    { name: 'Food', value: 'nutrition' },
    { name: 'Temperature', value: 'thermometer' },
    { name: 'Feed Bag', value: 'bag' },
    { name: 'Checkmark', value: 'checkmark-circle' },
    { name: 'Cart', value: 'cart' },
    { name: 'Notes', value: 'clipboard' },
    { name: 'Weather', value: 'cloud' },
    { name: 'Paw', value: 'paw' }
  ];

  colorOptions = [
    { name: 'Green', value: '#4CAF50' },
    { name: 'Light Green', value: '#8BC34A' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Forest Green', value: '#2E7D32' },
    { name: 'Amber', value: '#FFC107' },
    { name: 'Red', value: '#F44336' },
    { name: 'Blue', value: '#2196F3' },
    { name: 'Purple', value: '#9C27B0' },
    { name: 'Pink', value: '#E91E63' },
    { name: 'Teal', value: '#009688' },
    { name: 'Brown', value: '#795548' },
    { name: 'Black', value: '#212121' }
  ];

  constructor(
    private alertController: AlertController,
    private router: Router,
    private route: ActivatedRoute,
    private livestockService: LivestockService,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {
    // Register the Ionicons
    addIcons({
      'add-outline': addOutline,
      'arrow-back-outline': arrowBackOutline,
      'close-outline': closeOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'chevron-back-outline': chevronBackOutline,
      'save-outline': saveOutline,
      'add-circle-outline': addCircleOutline,
      'restaurant': restaurantOutline,
      'bed': bedOutline,
      'medical': medicalOutline,
      'heart': heartOutline,
      'flower': flowerOutline,
      'water': waterOutline,
      'sunny': sunnyOutline,
      'leaf': leafOutline,
      'time': timeOutline,
      'calendar': calendarOutline,
      'nutrition': nutritionOutline,
      'thermometer': thermometerOutline,
      'bag': bagOutline,
      'checkmark-circle': checkmarkCircleOutline,
      'cart': cartOutline,
      'clipboard': clipboardOutline,
      'cloud': cloudOutline,
      'paw': pawOutline,
      'apps-outline': appsOutline,
      'checkmark': checkmark
    });

    // Load saved tasks from localStorage
    this.loadTasks();
  }

  async ngOnInit() {
    // Check if we have a 'from' query parameter
    this.route.queryParams.subscribe(params => {
      if (params['from']) {
        this.previousUrl = params['from'];
      }
    });
    
    // Load animal types from livestock data
    await this.loadAnimalTypes();
  }
  
  async loadAnimalTypes() {
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
        // Process livestock data to generate animal types with counts
        const typeMap = new Map<string, number>();
        
        livestock.forEach(item => {
          const type = item.type;
          const count = item.quantity || 1;
          
          if (typeMap.has(type)) {
            typeMap.set(type, typeMap.get(type)! + count);
          } else {
            typeMap.set(type, count);
          }
        });
        
        // Convert to animal types array
        this.animalTypes = Array.from(typeMap.entries())
          .map(([name, count], index) => ({
            id: index + 1,
            name,
            icon: 'paw',
            count
          }));
          
        loading.dismiss();
      }, error => {
        console.error('Error loading livestock:', error);
        loading.dismiss();
        // Fallback to empty array - no placeholder data
        this.animalTypes = [];
      });
    } catch (error) {
      console.error('Error in loadAnimalTypes:', error);
      loading.dismiss();
      this.animalTypes = [];
    }
  }

  loadTasks() {
    const savedTasks = localStorage.getItem('quickLogTasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  saveTasks() {
    localStorage.setItem('quickLogTasks', JSON.stringify(this.tasks));
  }

  toggleAddTask() {
    this.isAddingTask = !this.isAddingTask;
    this.newTaskName = '';
    this.newTaskIcon = 'flower';
    this.newTaskColor = 'primary';
  }

  async removeTask(index: number) {
    const alert = await this.alertController.create({
      header: 'Remove Task',
      message: `Are you sure you want to remove "${this.tasks[index].name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.tasks.splice(index, 1);
            this.saveTasks();
          }
        }
      ]
    });

    await alert.present();
  }

  // Generate a random hex color
  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  addTask() {
    if (this.newTaskName.trim()) {
      // If no color is selected, generate a random color
      const taskColor = this.newTaskColor || this.generateRandomColor();
      
      this.tasks.push({
        name: this.newTaskName,
        icon: this.newTaskIcon,
        color: taskColor
      });
      this.saveTasks();
      this.toggleAddTask();
    }
  }

  // Animal types
  animalTypes: { id: number, name: string, icon: string, count: number }[] = [];
  
  selectedAnimalType: number | null = null;
  taskNote: string = '';
  showLogPopup = false;
  currentTask: TaskItem | null = null;

  logTask(task: TaskItem) {
    this.currentTask = task;
    this.selectedAnimalType = null;
    this.taskNote = '';
    this.showLogPopup = true;
  }
  
  cancelLogTask() {
    this.showLogPopup = false;
    this.currentTask = null;
  }
  
  submitLogTask() {
    if (!this.currentTask) return;
    
    // Get animal type name
    const animalName = this.selectedAnimalType 
      ? this.animalTypes.find(a => a.id === this.selectedAnimalType)?.name 
      : 'All animals';
    
    // Create a task log entry
    const taskLog = {
      id: new Date().getTime(),  // Use timestamp as ID
      name: this.currentTask.name,
      icon: this.currentTask.icon,
      color: this.currentTask.color,
      date: new Date(),
      note: this.taskNote || undefined,
      animalType: animalName
    };
    
    // Save to localStorage
    const existingLogs = localStorage.getItem('loggedTasks');
    let loggedTasks = [];
    
    if (existingLogs) {
      loggedTasks = JSON.parse(existingLogs);
    }
    
    loggedTasks.push(taskLog);
    localStorage.setItem('loggedTasks', JSON.stringify(loggedTasks));
    
    // Show confirmation
    this.showConfirmation();
    
    // Reset and close popup
    this.showLogPopup = false;
    this.currentTask = null;
  }
  
  async showConfirmation() {
    const animalName = this.selectedAnimalType 
      ? this.animalTypes.find(a => a.id === this.selectedAnimalType)?.name 
      : 'All animals';
    
    const alert = await this.alertController.create({
      header: 'Activity Logged',
      cssClass: 'ios-alert',
      message: `${this.currentTask?.name} activity has been logged for ${animalName}.`,
      buttons: ['OK']
    });

    await alert.present();
  }
}