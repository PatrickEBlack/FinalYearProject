import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AiHelperService {
  private chatHistory: ChatMessage[] = [];
  private farmingKnowledgeBase = [
    { query: 'crop rotation', response: 'Crop rotation is the practice of growing different types of crops in the same area across seasons. It helps in soil health, pest and disease control, and improves soil fertility and crop yield.' },
    { query: 'sustainable farming', response: 'Sustainable farming focuses on producing crops and livestock while ensuring economic profitability with minimal environmental impact. It emphasizes soil health, water conservation, and biodiversity.' },
    { query: 'soil health', response: 'Good soil health is essential for farm productivity. Regular testing, adding organic matter, practicing crop rotation, and using cover crops can help maintain and improve soil health.' },
    { query: 'irrigation methods', response: 'Common irrigation methods include drip irrigation, sprinkler systems, and flood irrigation. Drip irrigation is water-efficient and delivers water directly to plant roots.' },
    { query: 'livestock management', response: 'Effective livestock management involves proper nutrition, shelter, health monitoring, and ethical handling. Regular veterinary check-ups and clean living conditions are essential.' },
    { query: 'organic farming', response: 'Organic farming avoids synthetic pesticides and fertilizers, focusing instead on techniques like crop rotation, green manure, compost, and biological pest control.' },
    { query: 'weather patterns', response: 'Understanding local weather patterns helps in planning planting, harvesting, and other farm activities. Consider investing in a weather station or monitoring service for your farm.' }
  ];

  constructor() {
    // Clear any cached news data immediately to avoid console errors
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('news_cache');
      localStorage.removeItem('saved_articles');
    }
  }

  // Get the chat history
  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  // Add a new user message
  addUserMessage(content: string): void {
    this.chatHistory.push({
      role: 'user',
      content,
      timestamp: new Date()
    });
  }

  // Simple AI response generation (simulate API call)
  generateAiResponse(userQuery: string): Observable<ChatMessage> {
    // Check if query matches any knowledge base entries
    const lowerQuery = userQuery.toLowerCase();
    
    // Find matching knowledge base entries
    const matches = this.farmingKnowledgeBase.filter(item => 
      lowerQuery.includes(item.query)
    );
    
    let response: string;
    
    if (matches.length > 0) {
      // Use the first match (could be enhanced to use the best match)
      response = matches[0].response;
    } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
      response = "Hello! I'm your farm assistant. How can I help you today?";
    } else if (lowerQuery.includes('thank')) {
      response = "You're welcome! Let me know if you need any other farming advice.";
    } else if (lowerQuery.includes('weather')) {
      response = "For specific weather information, please check the Weather section of the app. I can provide general farming advice based on seasonal weather patterns.";
    } else if (lowerQuery.includes('livestock') || lowerQuery.includes('animal')) {
      response = "For specific livestock management, ensure proper nutrition, regular health checks, and comfortable housing. You can track your livestock in the Livestock section of the app.";
    } else {
      response = "I don't have specific information on that topic yet. Please try asking about crop rotation, soil health, irrigation methods, livestock management, or sustainable farming practices.";
    }
    
    const message: ChatMessage = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    
    // Add to chat history
    this.chatHistory.push(message);
    
    // Simulate network delay
    return of(message).pipe(delay(1000));
  }

  // Clear chat history
  clearChatHistory(): void {
    this.chatHistory = [];
  }
}