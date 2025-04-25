import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Livestock, Vaccination } from './livestock.service';

@Injectable({
  providedIn: 'root'
})
export class MongodbService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  // Note: Pasture routes were removed

  constructor(private http: HttpClient) { }

  // Livestock Methods
  getAllLivestock(userId: string): Observable<Livestock[]> {
    console.log(`Making request to: ${this.apiUrl}/livestock?userId=${userId}`);
    return this.http.get<Livestock[]>(`${this.apiUrl}/livestock?userId=${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching livestock from MongoDB:', error);
          // Return empty array on error
          return of([]);
        })
      );
  }

  getLivestockById(id: string, userId: string): Observable<Livestock> {
    return this.http.get<Livestock>(`${this.apiUrl}/livestock/${id}?userId=${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching livestock by ID from MongoDB:', error);
          // Throw error to be handled by caller
          throw error;
        })
      );
  }

  createLivestock(livestock: Livestock): Observable<Livestock> {
    // userId should already be included in the livestock object
    return this.http.post<Livestock>(`${this.apiUrl}/livestock`, livestock)
      .pipe(
        catchError(error => {
          console.error('Error creating livestock in MongoDB:', error);
          // Throw error to be handled by caller
          throw error;
        })
      );
  }

  updateLivestock(id: string, livestock: Partial<Livestock>, userId: string): Observable<Livestock> {
    // Ensure userId is always included in the update
    const updatedData = { ...livestock, userId };
    return this.http.put<Livestock>(`${this.apiUrl}/livestock/${id}?userId=${userId}`, updatedData)
      .pipe(
        catchError(error => {
          console.error('Error updating livestock in MongoDB:', error);
          throw error;
        })
      );
  }

  deleteLivestock(id: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/livestock/${id}?userId=${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting livestock from MongoDB:', error);
          throw error;
        })
      );
  }

  addVaccination(livestockId: string, vaccination: Vaccination, userId: string): Observable<Livestock> {
    return this.http.post<Livestock>(
      `${this.apiUrl}/livestock/${livestockId}/vaccinations?userId=${userId}`, 
      vaccination
    ).pipe(
      catchError(error => {
        console.error('Error adding vaccination in MongoDB:', error);
        throw error;
      })
    );
  }

  // Settings Methods
  getUserSettings(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching user settings from MongoDB:', error);
          // Return empty object on error
          return of({});
        })
      );
  }

  updateUserSettings(userId: string, settings: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings/${userId}`, settings)
      .pipe(
        catchError(error => {
          console.error('Error updating user settings in MongoDB:', error);
          throw error;
        })
      );
  }
}