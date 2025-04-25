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
  IonList,
  IonItem,
  IonLabel,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  searchOutline,
  trashOutline,
  eyeOutline,
  createOutline,
  checkmarkCircleOutline,
  pawOutline,
  leafOutline,
  expandOutline,
  ellipseOutline,
  sunnyOutline,
  partlySunny,
  chevronForwardOutline,
  listOutline,
  documentTextOutline,
  analyticsOutline,
  medicalOutline,
  warningOutline
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { LivestockService, Livestock } from '../../services/livestock.service';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';

interface LivestockSummary {
  type: string;
  count: number;
}

// Pasture interface removed

@Component({
  selector: 'app-manage-livestock',
  templateUrl: './manage-livestock.page.html',
  styleUrls: ['./manage-livestock.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonIcon,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    CommonModule, 
    FormsModule,
    RouterLink
  ]
})
export class ManageLivestockPage implements OnInit {
  livestockCount: number = 0;
  monitoredCount: number = 0;
  
  livestockTypes: LivestockSummary[] = [];

  userId: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private themeService: ThemeService,
    private livestockService: LivestockService,
    private loaderService: LoaderService,
    private authService: AuthService
  ) {
    // Register the Ionicons we need
    addIcons({
      'add-outline': addOutline,
      'search-outline': searchOutline,
      'search': searchOutline,
      'trash-outline': trashOutline,
      'eye-outline': eyeOutline,
      'create-outline': createOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'paw-outline': pawOutline,
      'leaf-outline': leafOutline,
      'expand-outline': expandOutline,
      'ellipse-outline': ellipseOutline,
      'paw': pawOutline,
      'leaf': leafOutline,
      'sunny-outline': sunnyOutline,
      'partly-sunny': partlySunny,
      'chevron-forward-outline': chevronForwardOutline,
      'add-circle': addOutline,
      'list': listOutline,
      'document-text': documentTextOutline,
      'analytics': analyticsOutline,
      'medical': medicalOutline,
      'warning': warningOutline
    });
  }

  ngOnInit() {
    // Get the current user ID from auth service
    const user = this.authService.fetchActiveUser();
    if (user) {
      this.userId = user.uid;
      this.fetchLivestockData();
      this.getMonitoredCount();
    } else {
      this.error = 'User not authenticated';
      console.error('User not authenticated');
    }
  }
  
  // Refresh data when page becomes active
  ionViewWillEnter() {
    // This will refresh the monitored count each time the page becomes visible
    this.getMonitoredCount();
  }
  
  // Get the count of animals currently being monitored
  getMonitoredCount() {
    // Get the current user
    const user = this.authService.fetchActiveUser();
    if (!user) {
      console.error('No user logged in');
      this.monitoredCount = 0;
      return;
    }
    
    // Use user-specific key for localStorage
    const userKey = `monitoredLivestock_${user.uid}`;
    
    // Get monitored animals from localStorage using user-specific key
    const monitored = localStorage.getItem(userKey);
    if (monitored) {
      try {
        const monitoredAnimals = JSON.parse(monitored);
        this.monitoredCount = monitoredAnimals.length;
      } catch (e) {
        console.error('Error parsing monitored livestock data:', e);
        this.monitoredCount = 0;
      }
    } else {
      this.monitoredCount = 0;
    }
  }

  async fetchLivestockData() {
    console.log('Fetching livestock data from MongoDB...');
    if (!this.userId) {
      console.error('User ID not available');
      return;
    }

    try {
      this.isLoading = true;
      await this.loaderService.show('Loading livestock...');
      
      // First try to get data from MongoDB
      this.livestockService.getLivestock(this.userId).subscribe({
        next: (livestock: Livestock[]) => {
          console.log('Livestock data received:', livestock);
          
          // Calculate total livestock count
          this.livestockCount = livestock.reduce((sum, item) => sum + item.quantity, 0);
          
          // Group by type and count
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
          
          // Convert to array of livestock summaries
          this.livestockTypes = Array.from(typeMap.entries()).map(([type, count]) => ({
            type,
            count
          }));
          
          this.isLoading = false;
          this.loaderService.hide();
        },
        error: (error: any) => {
          console.error('Error fetching from MongoDB, falling back to localStorage:', error);
          this.fallbackToLocalStorage();
          this.isLoading = false;
          this.loaderService.hide();
        }
      });
    } catch (error: any) {
      console.error('Error in fetchLivestockData:', error);
      this.fallbackToLocalStorage();
      this.isLoading = false;
      this.loaderService.hide();
    }
  }
  
  private fallbackToLocalStorage() {
    console.log('Falling back to localStorage data...');
    // Get data from localStorage
    const data = localStorage.getItem('livestock');
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        
        // Calculate total livestock count
        this.livestockCount = parsedData.reduce((sum: number, item: any) => sum + item.quantity, 0);
        
        // Group by type and count
        const typeMap = new Map<string, number>();
        
        parsedData.forEach((item: any) => {
          const type = item.type;
          const count = item.quantity || 1;
          
          if (typeMap.has(type)) {
            typeMap.set(type, typeMap.get(type)! + count);
          } else {
            typeMap.set(type, count);
          }
        });
        
        // Convert to array of livestock summaries
        this.livestockTypes = Array.from(typeMap.entries()).map(([type, count]) => ({
          type,
          count
        }));
        
      } catch (e) {
        console.error('Error parsing livestock data:', e);
        this.livestockCount = 0;
        this.livestockTypes = [];
      }
    } else {
      this.livestockCount = 0;
      this.livestockTypes = [];
    }
  }
  
  // Pasture functionality removed
}