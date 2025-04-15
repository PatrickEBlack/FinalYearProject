import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline,
  pawOutline,
  leafOutline,
  cloudyOutline,
  calendarOutline,
  arrowForwardOutline,
  notificationsOutline,
  clipboardOutline,
  thermometerOutline,
  medicalOutline,
  chatboxEllipsesOutline,
  sunnyOutline
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    RouterLink
  ]
})
export class HomePage implements OnInit {
  currentDate = new Date();
  weatherCondition = 'Sunny';
  currentTemp = 95;
  tasks = [
    { title: 'Move cattle to East pasture', due: 'Today', priority: 'high' },
    { title: 'Order feed supplies', due: 'Tomorrow', priority: 'medium' },
    { title: 'Vet appointment for ewes', due: 'Feb 28', priority: 'normal' }
  ];
  
  constructor(
    private router: Router,
    private themeService: ThemeService,
    private weatherService: WeatherService
  ) { 
    addIcons({
      'home-outline': homeOutline,
      'paw-outline': pawOutline,
      'leaf-outline': leafOutline,
      'cloudy-outline': cloudyOutline,
      'calendar-outline': calendarOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'notifications-outline': notificationsOutline,
      'clipboard-outline': clipboardOutline,
      'thermometer-outline': thermometerOutline,
      'medical-outline': medicalOutline,
      'chatbox-ellipses-outline': chatboxEllipsesOutline,
      'sunny-outline': sunnyOutline
    });
  }

  ngOnInit() {
    // Get weather data for current location
    this.weatherService.getWeather('Las Vegas, Nevada').subscribe(data => {
      this.weatherCondition = data.condition;
      this.currentTemp = data.temperature;
    });
  }

  navigateToLogin() {
    this.router.navigate(['tabs/login']);
  }
  
  navigateToLivestock() {
    this.router.navigate(['tabs/manage-livestock']);
  }
  
  // Weather navigation removed
}