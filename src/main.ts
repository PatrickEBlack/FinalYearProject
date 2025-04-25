import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { ConfigService } from './app/services/config.service';
import { FirebaseConfigService } from './app/services/firebase-config.service';
import { initializeApp as initializeAppConfig } from './app/app.initializer';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, browserLocalPersistence, setPersistence } from '@angular/fire/auth';
// import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
// import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// import { getDatabase, provideDatabase } from '@angular/fire/database';
// import { getFunctions, provideFunctions } from '@angular/fire/functions';
// import { getMessaging, provideMessaging } from '@angular/fire/messaging';
// import { getPerformance, providePerformance } from '@angular/fire/performance';
// import { getStorage, provideStorage } from '@angular/fire/storage';
// import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
// import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai-preview';

//used to initialize the Angular application with AppComponent as the root component
bootstrapApplication(AppComponent, {
  providers: [
    //tells Angular's router to use IonicRouteStrategy for the route reuse strategy instead of the default strategy
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    // Initialize ConfigService and FirebaseConfigService before app starts
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [ConfigService, FirebaseConfigService],
      multi: true
    },
    provideFirebaseApp(() => {
      // Default Firebase config (will be replaced by the async initialization)
      const firebaseConfig = {
        projectId: "fir-ionic-project-1849e",
        appId: "1:373997035978:web:dbbc0438a03d5879f4ef33",
        storageBucket: "fir-ionic-project-1849e.firebasestorage.app",
        apiKey: "AIzaSyBrGJvbjpqAgGYs8nHwU0K9uhZpcKhfE3U",
        authDomain: "fir-ionic-project-1849e.firebaseapp.com",
        messagingSenderId: "373997035978"
      };
      return initializeApp(firebaseConfig);
    }),
     provideAuth(() => {
      const auth = getAuth();
      // Set persistence to LOCAL (survives browser restart)
      setPersistence(auth, browserLocalPersistence)
        .then(() => console.log('Firebase persistence set to LOCAL in main.ts'))
        .catch(error => console.error('Error setting persistence:', error));
      return auth;
    }), 
     provideFirestore(() => getFirestore()), 
  ],
})
//   provideDatabase(() => getDatabase()), 
//   provideFunctions(() => getFunctions()), 
//   provideMessaging(() => getMessaging()), 
//   providePerformance(() => getPerformance()), 
//   provideStorage(() => getStorage()), 
//   provideRemoteConfig(() => getRemoteConfig()), 
//   provideVertexAI(() => getVertexAI()),
//   ],
// });
