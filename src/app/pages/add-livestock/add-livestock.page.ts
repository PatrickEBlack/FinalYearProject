import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonBackButton, 
  IonButtons,
  IonIcon,
  IonDatetime,
  IonSegment,
  IonSegmentButton,
  IonRadio,
  IonRadioGroup,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToggle,
  IonNote,
  IonChip,
  IonTextarea,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  chevronForwardOutline, 
  chevronBackOutline, 
  addOutline, 
  trashOutline 
} from 'ionicons/icons';
import { LivestockService } from '../../services/livestock.service';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';

// Local interfaces for form handling
interface LocalVaccination {
  name: string;
  date: Date | string;
  nextDue?: Date | string;
  notes?: string;
}

interface LocalLivestock {
  id?: string;
  type: string;
  quantity: number;
  breed?: string;
  birthDate?: string;
  gender?: string; // Added gender field
  dateAdded: Date;
  herdNumber?: string;
  tagNumber?: string;
  vaccinations?: LocalVaccination[];
  userId?: string;
}

@Component({
  selector: 'app-add-livestock',
  templateUrl: './add-livestock.page.html',
  styleUrls: ['./add-livestock.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonLabel, 
    IonInput, 
    IonSelect, 
    IonSelectOption, 
    IonButton,
    IonBackButton,
    IonButtons,
    IonIcon,
    IonDatetime,
    IonSegment,
    IonSegmentButton,
    IonRadio,
    IonRadioGroup,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonToggle,
    IonNote,
    IonChip,
    IonTextarea,
    IonSpinner
  ]
})
export class AddLivestockPage implements OnInit {
  livestockForm!: FormGroup;
  calendarVisible = false;
  vaccinationCalendarIndex = -1; // For tracking which vaccination field is showing a calendar
  vaccinationCalendarField = ''; // 'date' or 'nextDue'
  maxDate = new Date().toISOString();
  herdNumberPattern = "^[A-Za-z0-9-]{3,20}$"; // More lenient pattern for herd numbers
  typeSpecificVaccinations: { [key: string]: string[] } = {
    'cattle': ['Blackleg', 'BVD', 'IBR', 'Leptospirosis', 'Pasteurella'],
    'sheep': ['Clostridial', 'Footrot', 'Enzootic Abortion', 'Pasteurella'],
    'chicken': ['Newcastle Disease', 'Marek\'s Disease', 'Infectious Bronchitis'],
    'pig': ['Erysipelas', 'Parvovirus', 'PRRS', 'Mycoplasma'],
    'horse': ['Tetanus', 'Influenza', 'Herpes', 'West Nile'],
    'other': ['Basic Vaccination']
  };
  
  availableVaccinations: string[] = [];
  
  // Getter for easier access to vaccinations FormArray
  get vaccinationsArray() {
    return this.livestockForm.get('vaccinations') as FormArray;
  }

  userId: string | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private livestockService: LivestockService,
    private loaderService: LoaderService,
    private authService: AuthService
  ) {
    addIcons({
      'calendar-outline': calendarOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'chevron-back-outline': chevronBackOutline,
      'add-outline': addOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.initForm();
    
    // Get the current user ID
    const user = this.authService.fetchActiveUser();
    if (user) {
      this.userId = user.uid;
    } else {
      this.error = 'User not authenticated';
      console.error('User not authenticated');
    }
  }

  initForm() {
    this.livestockForm = this.fb.group({
      type: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      breed: [''],
      birthDate: [''],
      gender: [''], // Add gender field
      herdNumber: ['', Validators.pattern(this.herdNumberPattern)],
      tagNumber: [''],
      vaccinations: this.fb.array([])
    });
    
    // Listen for type changes to update vaccination options
    this.livestockForm.get('type')?.valueChanges.subscribe(type => {
      if (type && this.typeSpecificVaccinations[type]) {
        this.availableVaccinations = this.typeSpecificVaccinations[type];
      } else {
        this.availableVaccinations = [];
      }
    });
  }
  
  // Creates a new vaccination form group
  createVaccinationFormGroup() {
    return this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      nextDue: [''],
      notes: ['']
    });
  }
  
  // Add a new vaccination record
  addVaccination() {
    this.vaccinationsArray.push(this.createVaccinationFormGroup());
  }
  
  // Remove a vaccination record
  removeVaccination(index: number) {
    this.vaccinationsArray.removeAt(index);
  }
  
  // Toggle calendar for vaccination date fields
  toggleVaccinationCalendar(index: number, field: string) {
    if (this.vaccinationCalendarIndex === index && this.vaccinationCalendarField === field) {
      // Toggle off if already showing for this field
      this.vaccinationCalendarIndex = -1;
      this.vaccinationCalendarField = '';
    } else {
      // Show calendar for the selected field
      this.vaccinationCalendarIndex = index;
      this.vaccinationCalendarField = field;
    }
  }
  
  // Handle vaccination date selection
  onVaccinationDateChange(event: any, index: number, field: string) {
    if (field && index >= 0) {
      const formGroup = this.vaccinationsArray.at(index) as FormGroup;
      formGroup.get(field)?.setValue(event.detail.value);
      
      // Close calendar after selection
      this.vaccinationCalendarIndex = -1;
      this.vaccinationCalendarField = '';
    }
  }
  
  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;
  }
  
  onDateChange(event: any) {
    this.livestockForm.get('birthDate')?.setValue(event.detail.value);
    this.calendarVisible = false;
  }

  async onSubmit() {
    if (this.livestockForm.valid && this.userId) {
      try {
        this.isLoading = true;
        await this.loaderService.show('Adding livestock...');
        
        // Create a livestock object for MongoDB
        const newLivestock = {
          ...this.livestockForm.value,
          dateAdded: new Date(),
          userId: this.userId
        };
        
        // Save to MongoDB
        this.livestockService.addLivestock(newLivestock).subscribe({
          next: async (result) => {
            console.log('Livestock added to MongoDB:', result);
            
            // Also save to localStorage as backup
            this.saveToLocalStorage(newLivestock);
            
            this.isLoading = false;
            await this.loaderService.hide();
            
            // Show success toast
            const toast = await this.toastController.create({
              message: 'Livestock added successfully!',
              duration: 2000,
              position: 'bottom',
              color: 'success'
            });
            await toast.present();
            
            // Navigate back to the livestock list
            this.router.navigate(['/tabs/manage-livestock']);
          },
          error: async (error) => {
            console.error('Error adding livestock to MongoDB:', error);
            
            // Fall back to localStorage only
            this.saveToLocalStorage(newLivestock);
            
            this.isLoading = false;
            await this.loaderService.hide();
            
            // Show warning toast
            const toast = await this.toastController.create({
              message: 'Livestock saved locally. Will sync when connection is restored.',
              duration: 3000,
              position: 'bottom',
              color: 'warning'
            });
            await toast.present();
            
            // Navigate back to the livestock list
            this.router.navigate(['/tabs/manage-livestock']);
          }
        });
      } catch (error: any) {
        console.error('Error in onSubmit:', error);
        this.isLoading = false;
        await this.loaderService.hide();
      }
    } else if (!this.userId) {
      const toast = await this.toastController.create({
        message: 'You must be logged in to add livestock',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }
  
  private saveToLocalStorage(livestock: any) {
    // Create a local livestock object with a local ID
    const localLivestock = {
      ...livestock,
      localId: new Date().getTime().toString()
    };
    
    // Get existing livestock from localStorage
    const existingData = localStorage.getItem('livestock');
    const livestockData: LocalLivestock[] = existingData ? JSON.parse(existingData) : [];
    
    // Add new livestock to the array
    livestockData.push(localLivestock as LocalLivestock);
    
    // Save back to localStorage
    localStorage.setItem('livestock', JSON.stringify(livestockData));
  }
}