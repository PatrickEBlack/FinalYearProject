import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';
import { ConfigService } from './config.service';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  iconCode: string;
  high: number;
  low: number;
  feelsLike: number;
  forecast: ForecastDay[];
  lastUpdated: Date;
}

export interface ForecastDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  iconCode: string;
  precipChance: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_URL = 'https://api.openweathermap.org/data/2.5/';
  
  private currentLocation = new BehaviorSubject<string>('County Meath, Ireland');
  currentLocation$ = this.currentLocation.asObservable();
  
  private favoriteLocations = new BehaviorSubject<string[]>([]);
  favoriteLocations$ = this.favoriteLocations.asObservable();
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private configService: ConfigService
  ) {
    // Load saved location from storage
    this.loadSavedData();
  }
  
  private get API_KEY(): string {
    return this.configService.getOpenWeatherApiKey() || environment.openWeatherApiKey || '';
  }
  
  private loadSavedData() {
    const savedLocation = this.storageService.get('weatherLocation');
    if (savedLocation) {
      this.currentLocation.next(savedLocation);
    }
    
    const savedFavorites = this.storageService.get('favoriteLocations');
    if (savedFavorites) {
      try {
        const favorites = Array.isArray(savedFavorites) ? savedFavorites : JSON.parse(savedFavorites);
        this.favoriteLocations.next(Array.isArray(favorites) ? favorites : []);
      } catch (e) {
        this.favoriteLocations.next([]);
      }
    }
  }

  setLocation(location: string) {
    this.currentLocation.next(location);
    this.storageService.set('weatherLocation', location);
  }
  
  addFavoriteLocation(location: string) {
    const currentFavorites = this.favoriteLocations.value;
    if (!currentFavorites.includes(location)) {
      const newFavorites = [...currentFavorites, location];
      this.favoriteLocations.next(newFavorites);
      this.storageService.set('favoriteLocations', newFavorites);
    }
  }
  
  removeFavoriteLocation(location: string) {
    const currentFavorites = this.favoriteLocations.value;
    const newFavorites = currentFavorites.filter(loc => loc !== location);
    this.favoriteLocations.next(newFavorites);
    this.storageService.set('favoriteLocations', newFavorites);
  }
  
  searchLocations(query: string): Observable<any> {
    if (!query || query.trim() === '') {
      return of([]);
    }
    
    return this.http.get(`${this.API_URL}/find`, {
      params: {
        q: query,
        type: 'like',
        sort: 'population',
        cnt: 10,
        appid: this.API_KEY
      }
    }).pipe(
      catchError(error => {
        console.error('Error searching locations', error);
        return throwError(() => new Error('Failed to search locations. Please try again.'));
      })
    );
  }
  
  getWeather(location: string): Observable<WeatherData> {
    if (!location || location.trim() === '') {
      location = 'County Meath, Ireland';
    }
    
    console.log('Fetching real weather data for location:', location);
    return this.http.get(`${this.API_URL}weather`, {
      params: {
        q: location,
        units: 'imperial',
        appid: this.API_KEY
      }
    }).pipe(
      map((data: any) => this.transformWeatherData(data)),
      catchError(error => {
        console.error('Error fetching weather data', error);
        // Return mock data as fallback
        return of(this.getMockWeatherData(location));
      })
    );
  }
  
  getForecast(location: string): Observable<ForecastDay[]> {
    if (!location || location.trim() === '') {
      location = 'County Meath, Ireland';
    }
    
    console.log('Fetching real forecast data for location:', location);
    return this.http.get(`${this.API_URL}forecast`, {
      params: {
        q: location,
        units: 'imperial',
        appid: this.API_KEY
      }
    }).pipe(
      map((data: any) => this.transformForecastData(data)),
      catchError(error => {
        console.error('Error fetching forecast data', error);
        // Return mock data as fallback
        return of(this.getMockWeatherData(location).forecast);
      })
    );
  }
  
  private transformWeatherData(data: any): WeatherData {
    const iconCode = this.getIconCode(data.weather[0].id);
    
    return {
      location: `${data.name}, ${data.sys.country}`,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      condition: data.weather[0].main,
      iconCode: iconCode,
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
      feelsLike: Math.round(data.main.feels_like),
      lastUpdated: new Date(),
      forecast: [] // Will be filled by getForecast
    };
  }
  
  private transformForecastData(data: any): ForecastDay[] {
    // Group by day
    const dailyData: {[key: string]: any[]} = {};
    
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyData[day]) {
        dailyData[day] = [];
      }
      
      dailyData[day].push(item);
    });
    
    // Create a forecast for each day
    return Object.keys(dailyData).map(day => {
      const dayData = dailyData[day];
      const temps = dayData.map(item => item.main.temp);
      const high = Math.round(Math.max(...temps));
      const low = Math.round(Math.min(...temps));
      
      // Use the mid-day forecast for the condition
      const midDayForecast = dayData[Math.floor(dayData.length / 2)];
      const condition = midDayForecast.weather[0].main;
      const iconCode = this.getIconCode(midDayForecast.weather[0].id);
      
      // Calculate precipitation chance
      const precipValues = dayData.map(item => item.pop || 0);
      const precipChance = Math.round(Math.max(...precipValues) * 100);
      
      return {
        day: day,
        condition: condition,
        high: high,
        low: low,
        iconCode: iconCode,
        precipChance: precipChance
      };
    }).slice(0, 6); // Limit to 6 days
  }
  
  private getIconCode(weatherId: number): string {
    // Map OpenWeatherMap condition codes to our icon names
    if (weatherId >= 200 && weatherId < 300) {
      return 'thunderstorm';
    } else if (weatherId >= 300 && weatherId < 400) {
      return 'rainy';
    } else if (weatherId >= 500 && weatherId < 600) {
      return 'rainy';
    } else if (weatherId >= 600 && weatherId < 700) {
      return 'snow';
    } else if (weatherId >= 700 && weatherId < 800) {
      return 'cloudy';
    } else if (weatherId === 800) {
      return 'sunny';
    } else if (weatherId > 800) {
      return 'partly-sunny';
    }
    
    return 'sunny'; // Default
  }
  
  private getMockWeatherData(location: string): WeatherData {
    // Default to County Meath if not specified
    if (!location || location.trim() === '') {
      location = 'County Meath, Ireland';
    }
    
    // Create a fallback weather object with a clear message that data is unavailable
    return {
      location: location,
      temperature: 60,
      humidity: 50,
      windSpeed: 10,
      condition: '[API Unavailable] Weather data unavailable',
      iconCode: 'partly-sunny',
      high: 65,
      low: 55,
      feelsLike: 60,
      lastUpdated: new Date(),
      forecast: [
        { day: 'Today', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 },
        { day: 'Mon', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 },
        { day: 'Tue', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 },
        { day: 'Wed', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 },
        { day: 'Thu', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 },
        { day: 'Fri', condition: 'Data Unavailable', high: 65, low: 55, iconCode: 'partly-sunny', precipChance: 0 }
      ]
    };
  }
}