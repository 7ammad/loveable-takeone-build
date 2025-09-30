/**
 * Whapi.cloud Service
 * Integrates with Whapi.cloud API to retrieve WhatsApp group messages
 */

interface WhatsAppMessage {
  id: string;
  from: string;
  text: string;
  timestamp: string;
  type: string;
}

export class WhapiService {
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.WHAPI_CLOUD_TOKEN!;
    this.baseUrl = 'https://gate.whapi.cloud';

    if (!this.apiToken) {
      throw new Error('WHAPI_CLOUD_TOKEN environment variable is required');
    }
  }

  async getRecentMessages(groupId: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    try {
      console.log(`📱 Fetching recent messages from WhatsApp group: ${groupId}`);

      // Whapi.cloud endpoint for getting messages
      const response = await fetch(`${this.baseUrl}/groups/${groupId}/messages?token=${this.apiToken}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Whapi.cloud API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.messages) {
        console.warn(`No messages found for group ${groupId}`);
        return [];
      }

      // Transform to our interface
      return data.messages.map((msg: any) => ({
        id: msg.id,
        from: msg.from,
        text: msg.text || '',
        timestamp: msg.timestamp,
        type: msg.type,
      }));

    } catch (error) {
      console.error(`Failed to fetch WhatsApp messages for group ${groupId}:`, error);
      throw error;
    }
  }

  async getGroupInfo(groupId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/groups/${groupId}?token=${this.apiToken}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Whapi.cloud API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error(`Failed to fetch WhatsApp group info for ${groupId}:`, error);
      throw error;
    }
  }
}
