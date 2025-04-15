import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localtime: string;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_mph: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  pressure_mb: number;
  pressure_in: number;
  precip_mm: number;
  precip_in: number;
  humidity: number;
  cloud: number;
  feelslike_c: number;
  feelslike_f: number;
  vis_km: number;
  vis_miles: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherApiService {
  private readonly API_KEY = environment.weatherApiKey || '7a8e434a4a9b4200b64183519252702';
  private readonly API_URL = 'http://api.weatherapi.com/v1';
  
  private currentLocation = new BehaviorSubject<string>('Kells, Meath, Ireland');
  currentLocation$ = this.currentLocation.asObservable();
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Load saved location from storage
    this.loadSavedLocation();
  }
  
  private loadSavedLocation() {
    const savedLocation = this.storageService.get('weatherApiLocation');
    if (savedLocation) {
      this.currentLocation.next(savedLocation);
    }
  }
  
  setLocation(location: string) {
    this.currentLocation.next(location);
    this.storageService.set('weatherApiLocation', location);
  }
  
  getCurrentWeather(location: string = 'Kells, Meath, Ireland'): Observable<WeatherResponse> {
    // Validate the location input to ensure it's substantial enough for an API call
    if (!location || location.trim().length < 2) {
      console.warn('Location query too short, using default location');
      location = 'Kells, Meath, Ireland';
    }
    
    const url = `${this.API_URL}/current.json?key=${this.API_KEY}&q=${encodeURIComponent(location)}&aqi=no`;
    
    return this.http.get<WeatherResponse>(url).pipe(
      tap(data => console.log('Weather data fetched:', data)),
      catchError(error => {
        console.error('Error fetching weather data:', error);
        return of({
          location: {
            name: location,
            region: 'Unknown',
            country: 'Unknown',
            lat: 0,
            lon: 0,
            localtime: new Date().toISOString()
          },
          current: {
            temp_c: 15,
            temp_f: 59,
            is_day: 1,
            condition: {
              text: 'Unknown',
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
              code: 1000
            },
            wind_mph: 5,
            wind_kph: 8,
            wind_degree: 0,
            wind_dir: 'N',
            pressure_mb: 1013,
            pressure_in: 29.9,
            precip_mm: 0,
            precip_in: 0,
            humidity: 70,
            cloud: 25,
            feelslike_c: 15,
            feelslike_f: 59,
            vis_km: 10,
            vis_miles: 6,
            uv: 4,
            gust_mph: 7,
            gust_kph: 11.2
          }
        } as WeatherResponse);
      })
    );
  }
  
  // Gets weather icon URL from code
  getWeatherIconUrl(code: number, isDay: boolean = true): string {
    const dayOrNight = isDay ? 'day' : 'night';
    return `//cdn.weatherapi.com/weather/64x64/${dayOrNight}/${code}.png`;
  }
  
  // Gets a description for the weather conditions based on the API response
  getWeatherDescription(data: WeatherResponse): string {
    const temp = Math.round(data.current.temp_c);
    const condition = data.current.condition.text;
    const windSpeed = Math.round(data.current.wind_kph);
    const windDir = data.current.wind_dir;
    
    let description = `${condition} with temperature of ${temp}°C`;
    
    if (windSpeed > 20) {
      description += ` and strong ${windDir} winds at ${windSpeed} km/h`;
    } else if (windSpeed > 10) {
      description += ` and moderate ${windDir} winds at ${windSpeed} km/h`;
    }
    
    return description;
  }
  
  // Gets farming advice based on weather conditions
  getFarmingAdvice(data: WeatherResponse): string[] {
    const advices: string[] = [];
    const temp = data.current.temp_c;
    const condition = data.current.condition.text.toLowerCase();
    const windSpeed = data.current.wind_kph;
    const humidity = data.current.humidity;
    
    // Temperature advice
    if (temp > 28) {
      advices.push('High temperature alert! Ensure livestock have plenty of shade and fresh water.');
      advices.push('Consider delaying field work until cooler hours of the day.');
    } else if (temp < 5) {
      advices.push('Cold temperature alert! Ensure vulnerable livestock have shelter.');
      advices.push('Check water sources to ensure they haven\'t frozen over.');
    }
    
    // Precipitation advice
    if (condition.includes('rain') || condition.includes('drizzle')) {
      advices.push('Precipitation may affect field operations. Check soil conditions before heavy machinery use.');
      
      if (condition.includes('heavy')) {
        advices.push('Heavy rain alert! Monitor low-lying areas for flooding issues.');
      }
    }
    
    // Wind advice
    if (windSpeed > 30) {
      advices.push('Strong winds! Secure loose items and structures around the farm.');
      advices.push('Consider sheltering livestock to avoid stress.');
    }
    
    // Humidity advice
    if (humidity > 85 && temp > 20) {
      advices.push('High humidity and temperature may cause heat stress in livestock.');
    }
    
    // Default advice if none of the above
    if (advices.length === 0) {
      advices.push('Weather conditions are favorable for most farming activities.');
      
      if (temp > 15 && temp < 25 && !condition.includes('rain')) {
        advices.push('Good conditions for fieldwork and livestock grazing.');
      }
    }
    
    return advices;
  }
}