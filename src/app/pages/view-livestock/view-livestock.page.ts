import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonChip,
  IonModal,
  AlertController,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  pawOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { LivestockService, Livestock as LivestockType } from '../../services/livestock.service';
import { AuthService } from '../../services/auth.service';

interface Vaccination {
  name: string;
  date: Date;
  nextDue?: Date;
  notes?: string;
}

interface Livestock {
  id: string;
  type: string;
  quantity: number;
  breed?: string;
  age?: number;
  ageUnit?: string;
  birthDate?: string;
  gender?: string; // Added gender field
  pasture?: string;
  dateAdded: Date;
  herdNumber?: string;
  tagNumber?: string;
  vaccinations?: Vaccination[];
}

@Component({
  selector: 'app-view-livestock',
  templateUrl: './view-livestock.page.html',
  styleUrls: ['./view-livestock.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonChip,
    IonModal
  ]
})
export class ViewLivestockPage implements OnInit {
  livestock: Livestock[] = [];
  filteredLivestock: Livestock[] = [];
  selectedLivestock: Livestock | null = null;
  selectedType: string = '';
  isLoading: boolean = false;
  userId: string | null = null;
  error: string | null = null;
  
  // Available livestock types for filtering
  livestockTypes: string[] = ['Cattle', 'Sheep', 'Chicken', 'Pig', 'Horse', 'Other'];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private livestockService: LivestockService,
    private authService: AuthService
  ) {
    addIcons({
      'paw-outline': pawOutline,
      'chevron-forward-outline': chevronForwardOutline
    });
  }

  async ngOnInit() {
    // Get the current user's ID
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.userId = user.uid;
      this.loadLivestock();
    } else {
      this.error = 'User not authenticated';
      console.error('User not authenticated');
    }
  }

  ionViewWillEnter() {
    // Reload data whenever the page becomes active
    if (this.userId) {
      this.loadLivestock();
    }
  }
  
  async loadLivestock() {
    if (!this.userId) {
      this.error = 'User ID not available';
      return;
    }
    
    // Show loading
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Loading livestock...',
      spinner: 'circular'
    });
    await loading.present();
    
    try {
      // Load from MongoDB using the user's ID
      this.livestockService.getLivestock(this.userId).subscribe({
        next: (data) => {
          console.log('Livestock data loaded:', data);
          this.livestock = data.map((item: any) => {
            return {
              id: item._id,
              type: item.type,
              quantity: item.quantity,
              breed: item.breed,
              birthDate: item.birthDate,
              pasture: item.pasture,
              dateAdded: new Date(item.dateAdded),
              herdNumber: item.herdNumber,
              tagNumber: item.tagNumber,
              vaccinations: item.vaccinations ? item.vaccinations.map((vax: any) => ({
                ...vax,
                date: new Date(vax.date),
                nextDue: vax.nextDue ? new Date(vax.nextDue) : undefined
              })) : []
            };
          });
          
          // Apply any active filters
          this.applyFilters();
          this.isLoading = false;
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error loading livestock:', error);
          
          // Fallback to localStorage
          this.loadFromLocalStorage();
          
          this.isLoading = false;
          loading.dismiss();
          
          // Show error toast
          this.showToast('Error loading from server. Showing cached data.', 'warning');
        }
      });
    } catch (error) {
      console.error('Exception loading livestock:', error);
      this.loadFromLocalStorage();
      this.isLoading = false;
      loading.dismiss();
    }
  }
  
  // Fallback method to load from localStorage
  loadFromLocalStorage() {
    const data = localStorage.getItem('livestock');
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        
        // Filter to only include the current user's data
        const userLivestock = parsedData.filter((item: any) => 
          item.userId === this.userId
        );
        
        // Convert string dates back to Date objects
        this.livestock = userLivestock.map((item: any) => {
          const livestock = {
            ...item,
            dateAdded: new Date(item.dateAdded)
          };
          
          // Convert vaccination dates if present
          if (livestock.vaccinations && Array.isArray(livestock.vaccinations)) {
            livestock.vaccinations = livestock.vaccinations.map((vax: any) => ({
              ...vax,
              date: new Date(vax.date),
              nextDue: vax.nextDue ? new Date(vax.nextDue) : undefined
            }));
          }
          
          return livestock;
        });
        
        // Apply any active filters
        this.applyFilters();
      } catch (e) {
        console.error('Error parsing livestock data:', e);
        this.livestock = [];
        this.filteredLivestock = [];
      }
    } else {
      this.livestock = [];
      this.filteredLivestock = [];
    }
  }
  
  // Helper method to show toast messages
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
  
  // Filter livestock by type
  filterByType(type: string) {
    if (this.selectedType === type) {
      // If already selected, clear filter
      this.clearFilters();
    } else {
      this.selectedType = type;
      this.applyFilters();
    }
  }
  
  // Clear all filters
  clearFilters() {
    this.selectedType = '';
    this.applyFilters();
  }
  
  // Apply current filters to livestock list
  applyFilters() {
    let filtered = [...this.livestock];
    
    // Apply type filter if selected
    if (this.selectedType) {
      filtered = filtered.filter(item => 
        item.type.toLowerCase() === this.selectedType.toLowerCase()
      );
    }
    
    this.filteredLivestock = filtered;
  }
  
  // Show details for a livestock item
  showDetails(livestock: Livestock) {
    this.selectedLivestock = livestock;
  }
  
  // Close details modal
  closeDetails() {
    this.selectedLivestock = null;
  }
  
  // Pasture functionality removed
  
  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
  
  // Format birth date from string
  formatBirthDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString; // Return the original string if parsing fails
    }
  }
  
  // Show delete confirmation
  async confirmDelete(livestock: Livestock) {
    const alert = await this.alertController.create({
      header: 'Confirm Removal',
      message: `Are you sure you want to remove ${livestock.quantity} ${livestock.type}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Remove',
          role: 'destructive',
          handler: () => {
            this.deleteLivestock(livestock);
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  // Delete livestock and update storage
  async deleteLivestock(livestock: Livestock) {
    if (!this.userId) {
      this.showToast('User ID not available', 'danger');
      return;
    }
    
    // Show loading
    const loading = await this.loadingController.create({
      message: 'Deleting livestock...',
      spinner: 'circular'
    });
    await loading.present();
    
    try {
      // Delete from MongoDB
      this.livestockService.deleteLivestock(livestock.id, this.userId).subscribe({
        next: () => {
          console.log('Livestock deleted from MongoDB');
          
          // Update local array
          this.livestock = this.livestock.filter(item => item.id !== livestock.id);
          
          // Also update localStorage for offline access
          const data = localStorage.getItem('livestock');
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              const updatedData = parsedData.filter((item: any) => item.id !== livestock.id);
              localStorage.setItem('livestock', JSON.stringify(updatedData));
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          // Apply filters to update display
          this.applyFilters();
          
          // Close details modal
          this.closeDetails();
          
          loading.dismiss();
          this.showToast('Livestock removed successfully');
        },
        error: (error) => {
          console.error('Error deleting livestock:', error);
          
          // Fallback to just updating localStorage
          const data = localStorage.getItem('livestock');
          if (data) {
            try {
              const parsedData = JSON.parse(data);
              const updatedData = parsedData.filter((item: any) => item.id !== livestock.id);
              localStorage.setItem('livestock', JSON.stringify(updatedData));
            } catch (e) {
              console.error('Error updating localStorage:', e);
            }
          }
          
          // Update local array
          this.livestock = this.livestock.filter(item => item.id !== livestock.id);
          
          // Apply filters to update display
          this.applyFilters();
          
          // Close details modal
          this.closeDetails();
          
          loading.dismiss();
          this.showToast('Error connecting to server, but livestock removed locally', 'warning');
        }
      });
    } catch (error) {
      console.error('Exception deleting livestock:', error);
      loading.dismiss();
      this.showToast('An error occurred while deleting', 'danger');
    }
  }
}
