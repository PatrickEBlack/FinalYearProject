import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Storage service for caching data and saved items
   * Provides an abstraction over localStorage with JSON serialization/deserialization
   */
  constructor() { }

  /**
   * Stores a value with the given key
   */
  set(key: string, value: any): void {
    try {
      const item = JSON.stringify({
        value,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, item);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }

  /**
   * Retrieves a value by key
   */
  get(key: string): any {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      return JSON.parse(item).value;
    } catch (error) {
      console.error('Error retrieving from localStorage', error);
      return null;
    }
  }

  /**
   * Retrieves a value with its timestamp
   */
  getWithTimestamp(key: string): { value: any, timestamp: string } | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      return JSON.parse(item);
    } catch (error) {
      console.error('Error retrieving from localStorage with timestamp', error);
      return null;
    }
  }

  /**
   * Checks if data is older than the specified time
   */
  isExpired(key: string, maxAgeMs: number): boolean {
    const data = this.getWithTimestamp(key);
    if (!data) return true;
    
    const timestamp = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    
    return (now - timestamp) > maxAgeMs;
  }

  /**
   * Removes a value by key
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all stored data
   */
  clear(): void {
    localStorage.clear();
  }

  /**
   * Gets all saved chat conversations
   */
  getSavedChats(): any[] {
    const savedChats = this.get('saved_chats');
    return savedChats || [];
  }

  /**
   * Saves a chat conversation
   */
  saveChat(chat: any): void {
    const savedChats = this.getSavedChats();
    
    // Add the new chat with a timestamp
    savedChats.push({
      ...chat,
      saved: true,
      savedAt: new Date().toISOString()
    });
    this.set('saved_chats', savedChats);
  }

  /**
   * Removes a chat from saved chats
   */
  removeChat(chatId: string): void {
    const savedChats = this.getSavedChats();
    const updatedChats = savedChats.filter(chat => chat.id !== chatId);
    this.set('saved_chats', updatedChats);
  }

  /**
   * Checks if a chat is saved
   */
  isChatSaved(chatId: string): boolean {
    const savedChats = this.getSavedChats();
    return savedChats.some(chat => chat.id === chatId);
  }
}