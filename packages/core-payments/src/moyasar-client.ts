import axios from 'axios';

const MOYASAR_API_KEY = process.env.MOYASAR_API_KEY!;
const MOYASAR_API_URL = 'https://api.moyasar.com/v1';

const moyasarClient = axios.create({
  baseURL: MOYASAR_API_URL,
  headers: {
    'Authorization': `Basic ${Buffer.from(`${MOYASAR_API_KEY}:`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
});

export interface CreatePaymentIntentParams {
  amount: number; // in the smallest currency unit (e.g., halalas for SAR)
  currency: string;
  description: string;
  metadata?: Record<string, any>;
}

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  try {
    const response = await moyasarClient.post('/payments', params);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Moyasar API Error:', error.response?.data || error.message);
    } else {
      console.error('Moyasar API Error:', String(error));
    }
    throw new Error('Failed to create Moyasar payment intent');
  }
}

// Add other Moyasar client functions here as needed (e.g., fetchPayment, createSubscription)
