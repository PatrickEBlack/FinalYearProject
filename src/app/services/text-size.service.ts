import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TextSizeService {
  // Default size is 100% (normal)
  private textSizeSubject = new BehaviorSubject<number>(100);
  textSize$ = this.textSizeSubject.asObservable();
  
  private readonly STORAGE_KEY = 'textSizePercentage';
  private readonly MIN_SIZE = 80;  // 80% of normal
  private readonly MAX_SIZE = 150; // 150% of normal

  constructor(private storageService: StorageService) {
    this.loadSavedTextSize();
  }
  
  private loadSavedTextSize() {
    const savedSize = this.storageService.get(this.STORAGE_KEY);
    if (savedSize && !isNaN(Number(savedSize))) {
      this.setTextSize(Number(savedSize));
    }
  }
  
  getTextSize(): number {
    return this.textSizeSubject.value;
  }
  
  setTextSize(sizePercentage: number) {
    // Clamp the size to min and max values
    const clampedSize = Math.max(this.MIN_SIZE, Math.min(this.MAX_SIZE, sizePercentage));
    
    // Update the behavior subject
    this.textSizeSubject.next(clampedSize);
    
    // Save to storage
    this.storageService.set(this.STORAGE_KEY, clampedSize);
    
    // Apply the size to the document root
    this.applyTextSize(clampedSize);
  }
  
  private applyTextSize(sizePercentage: number) {
    // Set the font size on the root element (html)
    document.documentElement.style.fontSize = `${sizePercentage}%`;
  }
  
  // Utility method to get the minimum size
  getMinSize(): number {
    return this.MIN_SIZE;
  }
  
  // Utility method to get the maximum size
  getMaxSize(): number {
    return this.MAX_SIZE;
  }
}