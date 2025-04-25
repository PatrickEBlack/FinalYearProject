import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  storageBucket: string;
  apiKey: string;
  authDomain: string;
  messagingSenderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  private firebaseConfig: FirebaseConfig | null = null;

  constructor(private http: HttpClient) { }

  async getFirebaseConfig(): Promise<FirebaseConfig> {
    if (this.firebaseConfig) {
      return this.firebaseConfig;
    }

    try {
      const config = await firstValueFrom(
        this.http.get<FirebaseConfig>(`${environment.apiUrl}/settings/firebase-config`)
      );
      
      this.firebaseConfig = config;
      return config;
    } catch (error) {
      console.error('Failed to load Firebase configuration', error);
      
      // Default config as fallback
      return {
        projectId: "fir-ionic-project-1849e",
        appId: "1:373997035978:web:dbbc0438a03d5879f4ef33",
        storageBucket: "fir-ionic-project-1849e.firebasestorage.app",
        apiKey: "AIzaSyBrGJvbjpqAgGYs8nHwU0K9uhZpcKhfE3U",
        authDomain: "fir-ionic-project-1849e.firebaseapp.com",
        messagingSenderId: "373997035978"
      };
    }
  }
}