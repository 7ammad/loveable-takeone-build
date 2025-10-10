/**
 * Whapi.Cloud Service
 * API wrapper for WhatsApp Business integration
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '@packages/core-observability';

export interface WhapiGroup {
  id: string;
  name?: string;
  subject?: string;
  size?: number;
  creation?: number;
}

export interface WhapiMessage {
  id: string;
  type: string; // 'text', 'image', 'video', 'document', etc.
  timestamp: number; // Unix timestamp
  from: string; // Sender ID
  chat_id: string; // Group ID
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
  };
  video?: {
    caption?: string;
  };
  document?: {
    caption?: string;
    filename?: string;
  };
}

export class WhapiService {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiToken = process.env.WHAPI_CLOUD_TOKEN || process.env.WHAPI_API_TOKEN || '';
    this.apiUrl = (process.env.WHAPI_CLOUD_URL || process.env.WHAPI_API_URL || 'https://gate.whapi.cloud').replace(/\/$/, '');

    if (!this.apiToken) {
      throw new Error('WHAPI_CLOUD_TOKEN not configured in environment');
    }

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    logger.info('WhapiService initialized', { apiUrl: this.apiUrl });
  }

  /**
   * Get all WhatsApp groups the connected number is a member of
   */
  async getGroups(): Promise<WhapiGroup[]> {
    try {
      logger.debug('Fetching WhatsApp groups...');
      
      const response = await this.client.get('/groups');
      const groups = response.data.groups || [];

      logger.info(`Fetched ${groups.length} WhatsApp group(s)`);
      return groups;

    } catch (error) {
      this.handleError('Failed to fetch WhatsApp groups', error);
      throw error;
    }
  }

  /**
   * Get messages from a specific group
   * @param groupId - WhatsApp group ID (format: "1234567890@g.us")
   * @param limit - Number of messages to fetch (default: 100, max: 1000)
   */
  async getGroupMessages(groupId: string, limit = 100): Promise<WhapiMessage[]> {
    try {
      logger.debug('Fetching messages from group', { groupId, limit });

      const response = await this.client.get('/messages/list', {
        params: {
          chat_id: groupId,
          count: Math.min(limit, 1000), // Whapi max is 1000
          offset: 0
        }
      });

      const messages = response.data.messages || [];

      logger.info(`Fetched ${messages.length} message(s) from group`, { groupId });
      return messages;

    } catch (error) {
      this.handleError(`Failed to fetch messages from group ${groupId}`, error);
      throw error;
    }
  }

  /**
   * Send a text message to a group
   * ⚠️  DISABLED FOR SAFETY - We should NEVER send messages to WhatsApp groups
   * This is a READ-ONLY system for scraping casting calls
   */
  async sendMessage(groupId: string, text: string): Promise<void> {
    logger.error('🚨 BLOCKED: Attempted to send message to WhatsApp group', { 
      groupId, 
      textPreview: text.substring(0, 50)
    });
    
    throw new Error(
      'SAFETY BLOCK: Sending messages to WhatsApp groups is disabled. ' +
      'This is a read-only scraping system. If you need to send messages, ' +
      'please contact the system administrator.'
    );
  }

  /**
   * Extract text content from a WhatsApp message
   * Handles different message types (text, image with caption, etc.)
   */
  extractTextFromMessage(message: WhapiMessage): string {
    // Handle text messages
    if (message.text?.body && message.text.body.trim().length > 0) {
      return message.text.body.trim();
    }
    
    // Handle image with caption
    if (message.image?.caption && message.image.caption.trim().length > 0) {
      return message.image.caption.trim();
    }
    
    // Handle video with caption
    if (message.video?.caption && message.video.caption.trim().length > 0) {
      return message.video.caption.trim();
    }
    
    // Handle document with caption
    if (message.document?.caption && message.document.caption.trim().length > 0) {
      return message.document.caption.trim();
    }

    return '';
  }

  /**
   * Check if message is recent (within last N days)
   */
  isMessageRecent(message: WhapiMessage, maxDays = 7): boolean {
    const messageDate = new Date(message.timestamp * 1000);
    const now = new Date();
    const daysDiff = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff <= maxDays;
  }

  /**
   * Centralized error handling
   */
  private handleError(context: string, error: any): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      // Specific error handling
      if (status === 401) {
        logger.error(context, {
          status,
          message: data?.message || error.message,
          error: data?.error
        });
        logger.error('⚠️  Whapi authentication failed. Check WHAPI_CLOUD_TOKEN');
      } else if (status === 429) {
        logger.warn(context, {
          status,
          message: data?.message || error.message,
          error: data?.error
        });
        logger.warn('⚠️  Whapi rate limit exceeded. Slow down requests');
      } else if (status === 404) {
        // 404s are expected for inactive/deleted groups - log at debug level only
        logger.debug(context, {
          status,
          message: data?.message || error.message,
          error: data?.error
        });
      } else {
        // Other errors
        logger.error(context, {
          status,
          message: data?.message || error.message,
          error: data?.error
        });
      }
    } else {
      logger.error(context, { error: error.message || String(error) });
    }
  }
}

