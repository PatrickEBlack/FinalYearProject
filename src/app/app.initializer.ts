import { ConfigService } from './services/config.service';
import { FirebaseConfigService } from './services/firebase-config.service';
import { getApp } from '@angular/fire/app';

export function initializeApp(configService: ConfigService, firebaseConfigService: FirebaseConfigService) {
  return async (): Promise<any> => {
    try {
      // Load API keys configuration
      await configService.loadConfig();
      
      // Load Firebase configuration
      const firebaseConfig = await firebaseConfigService.getFirebaseConfig();
      
      // Update Firebase configuration in the initialized app
      // This won't actually change the Firebase app config, but it's a good practice to try
      // to keep the config service state in sync with what was initially loaded
      console.log('Firebase configuration loaded successfully');
      
      return true;
    } catch (error) {
      console.error('Error during app initialization', error);
      return false;
    }
  };
}