import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationExtras } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonChip,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkDoneOutline,
  clipboardOutline,
  createOutline,
  trashOutline,
  timeOutline,
  todayOutline,
  calendarOutline,
  filterOutline,
  searchOutline,
  addOutline,
  ellipsisHorizontalOutline,
  chevronDownOutline,
  pawOutline,
  informationCircleOutline,
  closeOutline,
  // Icons for tasks
  restaurantOutline,
  bedOutline,
  medicalOutline,
  heartOutline,
  flowerOutline,
  waterOutline,
  sunnyOutline,
  leafOutline,
  timeOutline as timeIconOutline,
  calendarOutline as calendarIconOutline,
  nutritionOutline,
  thermometerOutline,
  bagOutline,
  checkmarkCircleOutline,
  cartOutline,
  cloudOutline
} from 'ionicons/icons';

interface LoggedTask {
  id: number;
  name: string;
  icon: string;
  color: string;
  date: Date;
  note?: string;
  animalType?: string;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonNote,
    IonSearchbar,
    IonCard,
    IonCardContent,
    IonChip,
    IonBackButton,
    IonButtons,
    IonRefresher,
    IonRefresherContent,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
  ]
})
export class TasksPage implements OnInit {
  loggedTasks: LoggedTask[] = [];
  showingTaskDetails: number | null = null;
  searchText = '';
  
  // Sample animal types for demo
  animalTypes = [
    { id: 1, name: 'Cattle', icon: 'paw', count: 12 },
    { id: 2, name: 'Sheep', icon: 'paw', count: 24 },
    { id: 3, name: 'Goats', icon: 'paw', count: 8 },
    { id: 4, name: 'Pigs', icon: 'paw', count: 6 },
    { id: 5, name: 'Chickens', icon: 'paw', count: 30 }
  ];

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {
    // Register the Ionicons
    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'clipboard-outline': clipboardOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'time-outline': timeOutline,
      'today-outline': todayOutline,
      'calendar-outline': calendarOutline,
      'filter-outline': filterOutline,
      'search-outline': searchOutline,
      'add-outline': addOutline,
      'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
      'chevron-down-outline': chevronDownOutline,
      'paw-outline': pawOutline,
      'information-circle-outline': informationCircleOutline,
      'close-outline': closeOutline,
      // Task icons
      'restaurant': restaurantOutline,
      'bed': bedOutline,
      'medical': medicalOutline,
      'heart': heartOutline,
      'flower': flowerOutline,
      'water': waterOutline,
      'sunny': sunnyOutline,
      'leaf': leafOutline,
      'time': timeIconOutline,
      'calendar': calendarIconOutline,
      'nutrition': nutritionOutline,
      'thermometer': thermometerOutline,
      'bag': bagOutline,
      'checkmark-circle': checkmarkCircleOutline,
      'cart': cartOutline,
      'cloud': cloudOutline
    });

    // Load sample data for demo
    this.loadSampleTasks();
  }

  ngOnInit() {
    // Load tasks from localStorage
    this.loadTasks();
  }

  loadSampleTasks() {
    // Only load sample tasks if no real tasks exist
    if (!localStorage.getItem('loggedTasks')) {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const sampleTasks: LoggedTask[] = [
        {
          id: 1,
          name: 'Feeding',
          icon: 'restaurant',
          color: '#4CAF50',
          date: now,
          note: 'Fed all cattle in the morning',
          animalType: 'Cattle'
        },
        {
          id: 2,
          name: 'Bedding',
          icon: 'bed',
          color: '#2196F3',
          date: yesterday,
          note: 'Changed bedding in all pens',
          animalType: 'All animals'
        },
        {
          id: 3,
          name: 'Vaccination',
          icon: 'medical',
          color: '#9C27B0',
          date: yesterday,
          note: 'Annual vaccinations for the flock',
          animalType: 'Sheep'
        }
      ];
      
      localStorage.setItem('loggedTasks', JSON.stringify(sampleTasks));
    }
  }

  loadTasks() {
    const storedTasks = localStorage.getItem('loggedTasks');
    if (storedTasks) {
      this.loggedTasks = JSON.parse(storedTasks).map((task: any) => ({
        ...task,
        date: new Date(task.date)
      }));
      
      // Sort tasks by date, newest first
      this.loggedTasks.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }

  saveTasks() {
    localStorage.setItem('loggedTasks', JSON.stringify(this.loggedTasks));
  }

  refreshTasks(event: any) {
    setTimeout(() => {
      this.loadTasks();
      event.target.complete();
    }, 1000);
  }

  toggleTaskDetails(taskId: number) {
    if (this.showingTaskDetails === taskId) {
      this.showingTaskDetails = null;
    } else {
      this.showingTaskDetails = taskId;
    }
  }

  getFormattedDate(date: Date): string {
    // Check if today
    const today = new Date();
    const taskDate = new Date(date);
    
    if (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today at ' + taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Check if yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (
      taskDate.getDate() === yesterday.getDate() &&
      taskDate.getMonth() === yesterday.getMonth() &&
      taskDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday at ' + taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise format as date
    return taskDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: taskDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    }) + ' at ' + taskDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async editTaskNote(task: LoggedTask) {
    const alert = await this.alertController.create({
      header: 'Edit Note',
      inputs: [
        {
          name: 'note',
          type: 'textarea',
          placeholder: 'Enter note',
          value: task.note || ''
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
            task.note = data.note;
            this.saveTasks();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmDeleteTask(taskId: number) {
    // Find the task
    const task = this.loggedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const taskDate = new Date(task.date);
    const formattedDate = this.getFormattedDate(taskDate);
    
    const alert = await this.alertController.create({
      header: 'Delete Task',
      cssClass: 'ios-alert',
      subHeader: `Are you sure you want to delete "${task.name}" logged on ${formattedDate}?`,
      message: 'This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'delete-alert-button',
          handler: () => {
            this.deleteTask(taskId);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteTask(taskId: number) {
    const index = this.loggedTasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.loggedTasks.splice(index, 1);
      this.saveTasks();
    }
  }

  get filteredTasks() {
    if (!this.searchText) return this.loggedTasks;
    
    return this.loggedTasks.filter(task => 
      task.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
      task.animalType?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      task.note?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
  
  navigateToQuickLog() {
    // Create navigation extras with query params
    const navigationExtras: NavigationExtras = {
      queryParams: { from: '/tabs/tasks' }
    };
    
    // Navigate to quick log with the source page info
    this.router.navigate(['/tabs/quick-log'], navigationExtras);
  }
}