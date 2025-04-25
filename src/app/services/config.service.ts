import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface AppConfig {
  openWeatherApiKey: string;
  weatherApiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private appConfig: AppConfig | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Load application configuration from the server
   * This should be called during app initialization
   */
  async loadConfig(): Promise<AppConfig> {
    if (this.appConfig) {
      return this.appConfig;
    }

    try {
      const config = await firstValueFrom(
        this.http.get<AppConfig>(`${environment.apiUrl}/settings/env`)
      );
      
      // Store the config
      this.appConfig = config;
      
      // Also update the environment values
      environment.openWeatherApiKey = config.openWeatherApiKey;
      environment.weatherApiKey = config.weatherApiKey;
      
      return config;
    } catch (error) {
      console.error('Failed to load application configuration', error);
      return {
        openWeatherApiKey: '',
        weatherApiKey: ''
      };
    }
  }

  getOpenWeatherApiKey(): string {
    return this.appConfig?.openWeatherApiKey || environment.openWeatherApiKey;
  }

  getWeatherApiKey(): string {
    return this.appConfig?.weatherApiKey || environment.weatherApiKey;
  }
}