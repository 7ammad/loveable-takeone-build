/**
 * Workers Initialization
 * Starts BullMQ workers for processing scraped casting calls
 */

import { Worker } from 'bullmq';
import { prisma } from '@packages/core-db';
import { dlq, validationQueue } from '@packages/core-queue';
import { LlmCastingCallExtractionService } from '@packages/core-lib';
import { CastingCall } from '@packages/core-contracts';
import crypto from 'crypto';
import { logger } from '@packages/core-observability';

// Helper function to pre-filter content before expensive LLM calls
function isPotentiallyCastingCall(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // STRONG indicators - these alone are enough
  const strongCastingKeywords = [
    // English
    'casting call', 'casting now', 'now casting', 'open audition', 'open call',
    'seeking actors', 'seeking talent', 'talent needed', 'role available',
    'looking for actors', 'looking for talent', 'audition', 
    'actor needed', 'actress needed', 'talent search',
    
    // Arabic - Strong indicators
    'كاستنج', 'كاستينج', 'اختيار ممثلين', 'تجارب أداء',
    'مطلوب ممثل', 'مطلوب ممثلة', 'مطلوب ممثلين', 'مطلوب ممثلات',
    'نبحث عن ممثل', 'نبحث عن ممثلة', 'نبحث عن ممثلين',
    'فرصة تمثيل', 'اختبار أداء',
  ];
  
  // Application/Submission indicators
  const applicationKeywords = [
    // English
    'submit', 'apply now', 'send materials', 'submit resume', 'apply by',
    'deadline', 'closes on', 'application',
    
    // Arabic
    'تقديم', 'للتقديم', 'التقديم مفتوح', 'قدم', 'تقدم',
    'أرسل', 'إرسال', 'سيرة ذاتية', 'بورتفوليو',
    'للتواصل', 'تواصل معنا', 'راسلنا',
    'آخر موعد', 'الموعد النهائي',
  ];
  
  // Reject if has these keywords
  const rejectKeywords = [
    // English rejection keywords
    'screening', 'premiere', 'just finished', 'wrapped', 'congratulations',
    'workshop', 'course', 'training', 'film festival', 'won', 'award',
    'behind the scenes', 'bts', 'throwback', 'tbt', 'currently filming',
    'released', 'premiere night', 'red carpet', 'now in cinemas', 'in theaters',
    'hit every cinema', 'coming soon', 'available now',
    
    // Arabic rejection keywords - EXPANDED
    // Release/availability
    'الآن في', 'في جميع', 'في صالات', 'بينزل', 'انطلق', 'قريباً',
    
    // Workshops/Training
    'ورشة', 'ورش', 'دورة', 'دورات', 'تدريب', 'تدريبية', 'كورس',
    
    // Screenings/Events
    'عرض', 'عروض', 'مهرجان', 'مهرجانات', 'حفل', 'احتفال',
    'افتتاح', 'ختام', 'عرض خاص', 'عرض أول',
    
    // Past tense/Completed
    'انتهى', 'انتهى التصوير', 'اكتمل', 'تم', 'تم التصوير',
    'أنهينا', 'خلصنا', 'انتهينا', 'سعدنا باختيار', 'اخترنا',
    
    // Behind the scenes
    'خلف الكواليس', 'كواليس', 'بالكواليس', 'التحضير لشخصية',
    
    // Congratulations/Awards
    'مبروك', 'تهانينا', 'تهنئة', 'جائزة', 'جوائز', 'فوز', 'فاز', 'فخورين',
    
    // Personal updates/announcements
    'مشروعي', 'فيلمي', 'مسلسلي', 'عملي الجديد', 'أعلن', 'نفخر', 'سجل عندك'
  ];
  
  // Check for rejection keywords first
  const hasReject = rejectKeywords.some(kw => lowerContent.includes(kw));
  if (hasReject) {
    return false; // Immediate rejection
  }
  
  // Check for strong casting keywords
  const hasStrongCasting = strongCastingKeywords.some(kw => lowerContent.includes(kw));
  
  // Check for application keywords
  const hasApplication = applicationKeywords.some(kw => lowerContent.includes(kw));
  
  // PASS if: (strong casting keyword) OR (has both مطلوب AND application keyword) OR (نحتاج + ممثلين)
  const hasMatlub = lowerContent.includes('مطلوب');
  const hasNahtaj = lowerContent.includes('نحتاج') || lowerContent.includes('ونحتاج');
  const hasMomathel = lowerContent.includes('ممثل'); // ممثل, ممثلين, ممثلة, etc.
  
  return hasStrongCasting || (hasMatlub && hasApplication) || (hasNahtaj && hasMomathel && hasApplication);
}

// Redis connection config
const getRedisConnection = () => {
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    };
  }
  return { host: 'localhost', port: 6379 };
};

// LLM service instance
const llmService = new LlmCastingCallExtractionService();

// Scraped Role Worker
let scrapedRoleWorker: Worker | null = null;
let validationWorker: Worker | null = null;

export function startWorkers() {
  try {
    const connection = getRedisConnection();

    // 1. Scraped Role Worker - Processes raw content with LLM
    scrapedRoleWorker = new Worker(
      'scraped-roles',
      async (job) => {
        const { sourceId, sourceUrl, rawMarkdown, scrapedAt } = job.data;
        const jobLogger = logger.child({ jobId: job.id, sourceUrl });

        try {
          jobLogger.info(`🤖 Processing scraped content`);

          // PRE-FILTER: Check if content is potentially a casting call
          if (!isPotentiallyCastingCall(rawMarkdown)) {
            jobLogger.info(`⏭️  Skipped (not casting content)`);
            return { status: 'skipped_not_casting', sourceId };
          }

          // Extract structured data using LLM
          const extractionResult = await llmService.extractCastingCallFromText(rawMarkdown);

          if (!extractionResult.success || !extractionResult.data) {
            throw new Error(`LLM extraction failed: ${extractionResult.error}`);
          }

          jobLogger.info(`✅ Extracted structured data`);
          
          // Push to validation queue
          await validationQueue.add('validate-casting-call', {
            sourceId,
            sourceUrl,
            castingCallData: extractionResult.data,
          });
          
          return { status: 'pushed_to_validation', sourceId };

        } catch (error) {
          jobLogger.error(`❌ Failed to process scraped content`, {
            error: error instanceof Error ? error.message : String(error),
          });

          await dlq.add('failed-scraped-role-extraction', {
            originalJob: job.data,
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString(),
          });

          throw error;
        }
      },
      {
        connection,
        concurrency: 2,
        limiter: { max: 10, duration: 1000 },
      }
    );

    // 2. Validation Worker - Validates and persists casting calls
    validationWorker = new Worker(
      'validation-queue',
      async (job) => {
        const { sourceId, sourceUrl, castingCallData } = job.data as {
          sourceId: string;
          sourceUrl: string;
          castingCallData: CastingCall;
        };
        const jobLogger = logger.child({ jobId: job.id, title: castingCallData.title });

        try {
          jobLogger.info(`🔍 Validating extracted casting call`);

          // Generate content hash for deduplication
          const contentString = `${castingCallData.title}|${castingCallData.description || ''}|${castingCallData.company || ''}|${castingCallData.location || ''}`;
          const contentHash = crypto.createHash('md5').update(contentString).digest('hex');

          // Check for duplicates
          const existingCall = await prisma.castingCall.findUnique({
            where: { contentHash },
          });

          if (existingCall) {
            jobLogger.warn(`⚠️  Duplicate detected, skipping`);
            return { status: 'duplicate', castingCallId: existingCall.id };
          }

          // Create new casting call (filter out undefined/extra fields)
          const { roles, projectType, ...coreData } = castingCallData as any;
          
          const newCastingCall = await prisma.castingCall.create({
            data: {
              title: coreData.title,
              description: coreData.description || null,
              company: coreData.company || null,
              location: coreData.location || null,
              compensation: coreData.compensation || null,
              requirements: roles ? `${coreData.requirements || ''}\n\nRoles: ${roles}`.trim() : coreData.requirements || null,
              // TODO: Uncomment after running: npx prisma migrate dev --name add_roles_field
              // roles: roles || null,
              deadline: coreData.deadline ? new Date(coreData.deadline) : null,
              contactInfo: coreData.contactInfo || null,
              projectType: projectType || null,
              contentHash,
              sourceUrl,
              status: 'pending_review',
              isAggregated: true,
            },
          });

          jobLogger.info(`✅ Created casting call: "${newCastingCall.title}"`);

          return { status: 'created', castingCallId: newCastingCall.id };

        } catch (error) {
          jobLogger.error(`❌ Validation failed`, {
            error: error instanceof Error ? error.message : String(error),
          });

          await dlq.add('failed-validation', {
            originalJob: job.data,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          throw error;
        }
      },
      {
        connection,
        concurrency: 10,
        limiter: { max: 50, duration: 1000 },
      }
    );

    // Event handlers
    scrapedRoleWorker.on('completed', (job) => {
      logger.info(`✓ Scraped role job ${job.id} completed`, { jobId: job.id });
    });

    scrapedRoleWorker.on('failed', (job, err) => {
      const jobId = typeof job === 'string' ? job : (job as any)?.id;
      logger.error(`✗ Scraped role job ${jobId} failed`, { jobId, error: err.message });
    });

    validationWorker.on('completed', (job, result: Record<string, unknown>) => {
      logger.info(`✓ Validation job ${job.id} completed: ${result.status}`, { 
        jobId: job.id, 
        status: result.status 
      });
    });

    validationWorker.on('failed', (job, err) => {
      logger.error(`✗ Validation job ${job?.id} failed`, { jobId: job?.id, error: err.message });
    });

    logger.info('🎬 BullMQ Workers started - listening for jobs');

  } catch (error) {
    logger.error('❌ Failed to start workers:', {
      error: error instanceof Error ? error.message : String(error),
    });
    logger.warn('   Digital Twin will continue but jobs won\'t be processed');
  }
}

export async function stopWorkers() {
  try {
    if (scrapedRoleWorker) {
      await scrapedRoleWorker.close();
      scrapedRoleWorker = null;
    }
    if (validationWorker) {
      await validationWorker.close();
      validationWorker = null;
    }
    await prisma.$disconnect();
    logger.info('🛑 Workers stopped');
  } catch (error) {
    logger.error('Error stopping workers:', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

