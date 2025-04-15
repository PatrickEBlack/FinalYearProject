import { Injectable } from '@angular/core';
import { MongodbService } from './mongodb.service';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface Livestock {
  _id?: string;
  type: string;
  quantity: number;
  breed?: string;
  birthDate?: string;
  pasture?: string;
  dateAdded: Date;
  herdNumber?: string;
  tagNumber?: string;
  vaccinations?: Vaccination[];
  userId: string;
}

export interface Vaccination {
  name: string;
  date: Date | string;
  nextDue?: Date | string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LivestockService {
  constructor(
    private mongodbService: MongodbService,
    private storageService: StorageService
  ) { }

  // Methods that use MongoDB
  getLivestock(userId: string): Observable<Livestock[]> {
    return this.mongodbService.getAllLivestock(userId);
  }

  getLivestockById(id: string, userId: string): Observable<Livestock> {
    return this.mongodbService.getLivestockById(id, userId);
  }

  addLivestock(livestock: Livestock): Observable<Livestock> {
    // userId should already be included in the livestock object
    return this.mongodbService.createLivestock(livestock);
  }

  updateLivestock(id: string, livestock: Partial<Livestock>, userId: string): Observable<Livestock> {
    return this.mongodbService.updateLivestock(id, livestock, userId);
  }

  deleteLivestock(id: string, userId: string): Observable<any> {
    return this.mongodbService.deleteLivestock(id, userId);
  }

  addVaccination(livestockId: string, vaccination: Vaccination, userId: string): Observable<Livestock> {
    return this.mongodbService.addVaccination(livestockId, vaccination, userId);
  }

  // Backward compatibility methods with localStorage
  // These methods can be used during migration or as fallback
  
  getLivestockFromLocal(): any[] {
    return this.storageService.get('livestock') || [];
  }

  saveLivestockToLocal(livestock: any[]): void {
    this.storageService.set('livestock', livestock);
  }
}