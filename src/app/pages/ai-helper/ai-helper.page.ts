import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Animation, AnimationController } from '@ionic/angular';
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButton, 
  IonIcon, 
  IonInput, 
  IonFooter,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent
} from '@ionic/angular/standalone';
import { AiHelperService, ChatMessage } from '../../services/ai-helper.service';
import { addIcons } from 'ionicons';
import { 
  sendOutline, 
  trashOutline, 
  chatboxEllipsesOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-ai-helper',
  templateUrl: './ai-helper.page.html',
  styleUrls: ['./ai-helper.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonInput,
    IonFooter,
    IonSpinner,
    IonCard,
    IonCardContent,
    IonRefresher,
    IonRefresherContent
  ]
})
export class AiHelperPage implements OnInit {
  @ViewChild('content') content!: IonContent;
  @ViewChild('chatInput') chatInput!: ElementRef;
  
  userMessage = '';
  chatHistory: ChatMessage[] = [];
  isLoading = false;
  
  suggestedQuestions = [
    'Tell me about crop rotation',
    'How can I improve soil health?',
    'What are sustainable farming practices?',
    'Best practices for livestock management',
    'How to prepare for upcoming weather changes?'
  ];

  constructor(
    private aiHelperService: AiHelperService,
    private animationCtrl: AnimationController
  ) {
    addIcons({
      'send-outline': sendOutline,
      'trash-outline': trashOutline,
      'chatbox-ellipses-outline': chatboxEllipsesOutline
    });
  }

  ngOnInit() {
    this.chatHistory = this.aiHelperService.getChatHistory();
    
    // If chat history is empty, show a welcome message
    if (this.chatHistory.length === 0) {
      this.aiHelperService.addUserMessage('Hello');
      this.isLoading = true;
      
      this.aiHelperService.generateAiResponse('Hello').subscribe({
        next: () => {
          this.chatHistory = this.aiHelperService.getChatHistory();
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error generating AI response', err);
          this.isLoading = false;
        }
      });
    }
  }

  ionViewDidEnter() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.userMessage.trim()) {
      return;
    }
    
    const message = this.userMessage.trim();
    this.userMessage = '';
    
    this.aiHelperService.addUserMessage(message);
    this.chatHistory = this.aiHelperService.getChatHistory();
    this.scrollToBottom();
    
    this.isLoading = true;
    
    // Get AI response
    this.aiHelperService.generateAiResponse(message).subscribe({
      next: () => {
        this.chatHistory = this.aiHelperService.getChatHistory();
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error generating AI response', err);
        this.isLoading = false;
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content.scrollToBottom(300);
    }, 100);
  }

  clearChat() {
    this.aiHelperService.clearChatHistory();
    this.chatHistory = [];
    // Show welcome message again
    this.aiHelperService.addUserMessage('Hello');
    this.isLoading = true;
    
    this.aiHelperService.generateAiResponse('Hello').subscribe({
      next: () => {
        this.chatHistory = this.aiHelperService.getChatHistory();
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error generating AI response', err);
        this.isLoading = false;
      }
    });
  }

  askSuggestedQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  doRefresh(event: any) {
    // Simulate API call
    setTimeout(() => {
      this.clearChat();
      event.target.complete();
    }, 1000);
  }

  getMessageClasses(message: ChatMessage) {
    return {
      'user-message': message.role === 'user',
      'assistant-message': message.role === 'assistant'
    };
  }

  // Format timestamp to show only hours and minutes
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}