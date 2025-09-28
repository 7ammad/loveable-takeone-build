import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { processScrapedRoleQueue, dlq } from '../queues.js';

const prisma = new PrismaClient();

interface WhatsappMessageJob {
  messageId: string;
  content: string;
  sourceName: string;
  groupChatId: string;
  timestamp: number;
  ingestedAt: string;
}

interface CastingCallData {
  title: string;
  description?: string;
  company?: string;
  location?: string;
  compensation?: string;
  requirements?: string;
  deadline?: string;
  contactInfo?: string;
}

// Create the worker
const whatsappMessageWorker = new Worker(
  'process-whatsapp-message',
  async (job) => {
    const data: WhatsappMessageJob = job.data;

    try {
      console.log(`💬 Processing WhatsApp message from ${data.sourceName}: "${data.content.substring(0, 50)}..."`);

      // Analyze message with OpenAI to determine if it's a casting call
      const isCastingCall = await analyzeMessageWithOpenAI(data.content);

      if (!isCastingCall) {
        console.log(`ℹ️  Message from ${data.sourceName} is not a casting call - skipping`);
        return { status: 'not_casting_call' };
      }

      // Extract casting call details
      const castingCallData = await extractCastingCallFromMessage(data.content, data.sourceName);

      if (!castingCallData || !castingCallData.title) {
        console.log(`⚠️  Could not extract casting call data from message - skipping`);
        return { status: 'extraction_failed' };
      }

      // Queue for processing (reuse the same scraped role worker)
      await processScrapedRoleQueue.add('process-scraped-role', {
        ...castingCallData,
        sourceUrl: `whatsapp://${data.groupChatId}`,
        sourceName: data.sourceName,
        ingestedAt: data.ingestedAt,
        whatsappMessageId: data.messageId,
      });

      console.log(`✅ Queued WhatsApp casting call: ${castingCallData.title}`);

      return {
        status: 'queued',
        title: castingCallData.title,
        messageId: data.messageId
      };

    } catch (error) {
      console.error(`❌ Failed to process WhatsApp message ${data.messageId}:`, error);

      // Send to dead letter queue for manual review
      await dlq.add('failed-whatsapp-message', {
        originalJob: data,
        error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date().toISOString(),
      });

      throw error;
    }
  },
  {
    connection: process.env.REDIS_URL ? {
      url: process.env.REDIS_URL,
    } : undefined,
    concurrency: 1, // Process one at a time to avoid rate limits
    limiter: {
      max: 5, // Maximum 5 jobs
      duration: 1000, // per 1 second
    },
  }
);

async function analyzeMessageWithOpenAI(messageContent: string): Promise<boolean> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not set - treating all messages as non-casting calls');
    return false;
  }

  try {
    const prompt = `
Analyze this WhatsApp message and determine if it contains a casting call or job opportunity for actors, models, or entertainment industry professionals.

Return only "YES" if it appears to be a legitimate casting call/opportunity, or "NO" if it's not.

Consider it a casting call if it mentions:
- Auditions, casting calls, or job opportunities
- Specific roles, characters, or projects
- Production companies or entertainment industry context
- Application deadlines or requirements
- Compensation or pay information

Ignore:
- General job postings
- Random conversations
- Spam or advertisements
- Personal messages

Message to analyze:
"${messageContent}"

Answer with only YES or NO:
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    const result = await response.json();
    const answer = result.choices?.[0]?.message?.content?.trim()?.toUpperCase();

    return answer === 'YES';

  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    return false; // Default to false on error
  }
}

async function extractCastingCallFromMessage(messageContent: string, sourceName: string): Promise<CastingCallData | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return null;
  }

  try {
    const prompt = `
Extract casting call information from this WhatsApp message.

Return a JSON object with these fields (use null for missing information):
- title: The job/role title
- description: Full description of the opportunity
- company: Production company or organization name
- location: Where the work will take place
- compensation: Pay rate or salary (if mentioned)
- requirements: Skills, experience, or qualifications needed
- deadline: Application deadline (if mentioned)
- contactInfo: How to apply or contact information

Be accurate and only extract information that's actually present. If something isn't mentioned, use null.

WhatsApp message from "${sourceName}":
"${messageContent}"

Return only valid JSON:
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content?.trim();

    if (!content) return null;

    try {
      const data = JSON.parse(content);
      return data && typeof data === 'object' && data.title ? data : null;
    } catch {
      console.error('Failed to parse extraction response as JSON');
      return null;
    }

  } catch (error) {
    console.error('OpenAI extraction failed:', error);
    return null;
  }
}

// Event handlers
whatsappMessageWorker.on('completed', (job) => {
  console.log(`✅ WhatsApp message job ${job.id} completed successfully`);
});

whatsappMessageWorker.on('failed', (job, err) => {
  console.error(`❌ WhatsApp message job ${job?.id} failed:`, err.message);
});

whatsappMessageWorker.on('stalled', (job) => {
  console.warn(`⚠️ WhatsApp message job ${job?.id} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down WhatsApp message worker...');
  await whatsappMessageWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down WhatsApp message worker...');
  await whatsappMessageWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('📱 WhatsApp Message Worker started - listening for message processing jobs');

export default whatsappMessageWorker;
