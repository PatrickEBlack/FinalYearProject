import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  /**
   * Service for handling article sharing functionality
   * Uses the Web Share API when available, falls back to clipboard copy
   */
  constructor() { }

  /**
   * Shares content using the Web Share API if available,
   * otherwise copies the text to clipboard
   */
  async shareContent(content: { title: string, text: string, url?: string }): Promise<boolean> {
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: content.title,
          text: content.text,
          url: content.url
        });
        return true;
      } else {
        // Fall back to clipboard
        const textToShare = content.url || content.text;
        await this.copyToClipboard(textToShare);
        return true;
      }
    } catch (error) {
      console.error('Error sharing content', error);
      return false;
    }
  }

  /**
   * Copies text to clipboard
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard');
    } catch (error) {
      console.error('Failed to copy text to clipboard', error);
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback method for copying to clipboard
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
    return successful;
  }
}