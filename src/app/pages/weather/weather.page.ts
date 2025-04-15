import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  sunnyOutline, 
  cloudyOutline, 
  rainyOutline, 
  partlySunnyOutline,
  thermometerOutline,
  waterOutline,
  speedometerOutline,
  refreshOutline,
  searchOutline,
  locationOutline,
  timeOutline,
  arrowDownOutline,
  arrowUpOutline,
  thunderstormOutline,
  checkmarkCircleOutline,
  calendarOutline,
  addOutline,
  bookmarkOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { WeatherApiService, WeatherResponse } from '../../services/weather-api.service';
import { ThemeService } from '../../services/theme.service';
import { RouterLink } from '@angular/router';

interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  icon: string;
  precipChance: number;
}

interface SavedLocation {
  fullName: string;
  displayName: string;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.html',
  styleUrls: ['./weather.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonBackButton,
    IonButtons,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonCardHeader,
    RouterLink
  ]
})
export class WeatherPage implements OnInit, OnDestroy {
  weatherData: WeatherResponse | null = null;
  forecast: ForecastDay[] = [];
  isLoading = true;
  searchTerm = '';
  currentLocation = 'Kells, Meath, Ireland';
  farmingAdvice: string[] = [];
  savedLocations: SavedLocation[] = [];
  
  constructor(
    private weatherApiService: WeatherApiService,
    private themeService: ThemeService,
    private alertController: AlertController
  ) {
    // Register the Ionicons we need
    addIcons({
      'sunny-outline': sunnyOutline,
      'cloudy-outline': cloudyOutline,
      'rainy-outline': rainyOutline,
      'partly-sunny-outline': partlySunnyOutline,
      'thermometer-outline': thermometerOutline,
      'water-outline': waterOutline,
      'speedometer-outline': speedometerOutline,
      'refresh-outline': refreshOutline,
      'search-outline': searchOutline,
      'location-outline': locationOutline,
      'time-outline': timeOutline,
      'arrow-down-outline': arrowDownOutline,
      'arrow-up-outline': arrowUpOutline,
      'thunderstorm-outline': thunderstormOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'calendar-outline': calendarOutline,
      'add-outline': addOutline,
      'bookmark-outline': bookmarkOutline,
      'close-circle-outline': closeCircleOutline
    });
    
    // Load saved locations from storage
    this.loadSavedLocations();
  }

  private subscription: any;

  ngOnInit() {
    // Subscribe to the current location from the service
    this.subscription = this.weatherApiService.currentLocation$.subscribe(location => {
      this.currentLocation = location;
      this.loadWeatherData(location);
    });
  }
  
  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  loadSavedLocations() {
    const savedLocations = this.themeService.getStorageService().get('weatherSavedLocations');
    if (savedLocations) {
      try {
        this.savedLocations = Array.isArray(savedLocations) ? savedLocations : JSON.parse(savedLocations);
      } catch (error) {
        this.savedLocations = [];
      }
    } else {
      // Add default location if no saved locations
      this.savedLocations = [
        {
          fullName: 'Kells, Meath, Ireland',
          displayName: 'Kells'
        }
      ];
      this.saveSavedLocations();
    }
  }
  
  saveSavedLocations() {
    this.themeService.getStorageService().set('weatherSavedLocations', this.savedLocations);
  }
  
  loadWeatherData(location: string) {
    this.isLoading = true;
    
    // Load weather data from the Weather API service
    this.weatherApiService.getCurrentWeather(location).subscribe(data => {
      this.weatherData = data;
      this.generateForecast(data);
      this.farmingAdvice = this.weatherApiService.getFarmingAdvice(data);
      this.isLoading = false;
    });
  }
  
  generateForecast(data: WeatherResponse) {
    // For now, we'll generate a simple forecast since the current API doesn't provide forecast data
    // In a real implementation, you would add a forecast API call
    this.forecast = [
      {
        day: 'Today',
        condition: data.current.condition.text,
        high: Math.round(data.current.temp_c) + 2,
        low: Math.round(data.current.temp_c) - 3,
        icon: this.getWeatherIcon(data.current.condition.text),
        precipChance: data.current.precip_mm > 0 ? 60 : 10
      }
    ];
    
    // Add some made-up forecasts for the coming days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    for (let i = 1; i < 6; i++) {
      const dayIndex = (today + i) % 7;
      const temp = Math.round(data.current.temp_c) + Math.floor(Math.random() * 6) - 3;
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Overcast'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      
      this.forecast.push({
        day: days[dayIndex],
        condition: condition,
        high: temp + Math.floor(Math.random() * 3),
        low: temp - Math.floor(Math.random() * 5),
        icon: this.getWeatherIcon(condition),
        precipChance: condition.includes('Rain') ? 70 : (condition.includes('Cloud') ? 30 : 10)
      });
    }
  }
  
  refreshWeather(event: any) {
    // Reload weather data on pull-to-refresh
    this.loadWeatherData(this.currentLocation);
    
    // Complete the refresh
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
  
  search() {
    const searchTerm = this.searchTerm.trim();
    if (searchTerm.length >= 2) {
      this.currentLocation = searchTerm;
      this.weatherApiService.setLocation(searchTerm);
      this.loadWeatherData(searchTerm);
      this.searchTerm = '';
    } else if (searchTerm !== '') {
      // Show feedback to user that search term is too short
      console.warn('Search term too short. Please enter at least 2 characters.');
      // You could add a toast notification here if desired
    }
  }
  
  async showAddLocationPrompt() {
    const alert = await this.alertController.create({
      header: 'Add Location',
      subHeader: 'Enter a town, city, or region (min 2 characters)',
      inputs: [
        {
          name: 'location',
          type: 'text',
          placeholder: 'e.g. Dublin, Ireland',
          attributes: {
            minlength: 2,
            autocomplete: 'off',
            autocorrect: 'off'
          }
        },
        {
          name: 'displayName',
          type: 'text',
          placeholder: 'Display name (e.g. Dublin)',
          attributes: {
            autocomplete: 'off',
            autocorrect: 'off'
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
            const location = data.location?.trim() || '';
            
            if (location.length < 2) {
              // Don't dismiss the alert on validation error
              return false;
            }
              
            const fullName = location;
            const displayName = data.displayName && data.displayName.trim() !== '' 
              ? data.displayName.trim() 
              : this.getShortLocationName(fullName);
            
            this.addSavedLocation(fullName, displayName);
            return true;
          }
        }
      ],
      cssClass: 'ios-alert'
    });

    await alert.present();
  }
  
  getShortLocationName(fullName: string): string {
    // Extract just the first part before comma as display name
    const parts = fullName.split(',');
    return parts[0].trim();
  }
  
  addSavedLocation(fullName: string, displayName: string) {
    // Validate input
    if (!fullName || fullName.trim().length < 2) {
      console.warn('Location name is too short (minimum 2 characters required)');
      return;
    }
    
    fullName = fullName.trim();
    displayName = displayName.trim() || this.getShortLocationName(fullName);
    
    // Check if location already exists
    const exists = this.savedLocations.some(loc => 
      loc.fullName.toLowerCase() === fullName.toLowerCase()
    );
    
    if (!exists) {
      this.savedLocations.push({
        fullName,
        displayName
      });
      
      this.saveSavedLocations();
      
      // Load the new location
      this.selectSavedLocation({fullName, displayName});
    }
  }
  
  selectSavedLocation(location: SavedLocation) {
    this.currentLocation = location.fullName;
    this.weatherApiService.setLocation(location.fullName);
    this.loadWeatherData(location.fullName);
  }
  
  // Get the appropriate weather icon based on condition
  getWeatherIcon(condition: string): string {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'sunny-outline';
    } else if (conditionLower.includes('partly cloudy')) {
      return 'partly-sunny-outline';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast') || conditionLower.includes('windy') || conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return 'cloudy-outline';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return 'rainy-outline';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'thunderstorm-outline';
    } else {
      return 'sunny-outline'; // Default to sunny instead of partly-sunny
    }
  }
  
  // Format the date for display
  formatDate(date: string): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}