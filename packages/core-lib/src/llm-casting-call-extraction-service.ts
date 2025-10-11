import { CastingCall, CastingCallSchema } from '@packages/core-contracts';
import { llmLearningService } from './llm-learning-service';
import { llmCache } from '@/lib/llm-cache';

// LLM Client with Anthropic (primary) and OpenAI (fallback)
class LlmClient {
  private provider: 'anthropic' | 'openai';
  private apiKey: string;
  private baseUrl: string;
  private isEnabled: boolean;
  private model: string;

  constructor() {
    // Check for Anthropic first (preferred)
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';
    
    if (anthropicKey) {
      this.provider = 'anthropic';
      this.apiKey = anthropicKey;
      this.baseUrl = process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com/v1';
      this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      this.isEnabled = true;
      console.log('✅ Using Anthropic Claude for LLM processing');
    } else if (openaiKey) {
      this.provider = 'openai';
      this.apiKey = openaiKey;
      this.baseUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
      this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      this.isEnabled = true;
      console.log('✅ Using OpenAI GPT for LLM processing');
    } else {
      this.provider = 'openai';
      this.apiKey = '';
      this.baseUrl = 'https://api.openai.com/v1';
      this.model = 'gpt-4o-mini';
      this.isEnabled = false;
      console.warn('⚠️  No LLM API key found (ANTHROPIC_API_KEY or OPENAI_API_KEY) - using mock responses');
    }
  }

  async generateJson(prompt: string, schema: any): Promise<any> {
    if (!this.isEnabled) {
      console.log('      ℹ️  Using mock LLM response (no API key)');
      // Return mock data if no API key
      return {
        title: 'Casting Call (Mock - No LLM)',
        description: 'This is a mock response. Add OPENAI_API_KEY to .env for real extraction.',
        company: 'Unknown Company',
        location: 'Saudi Arabia',
        compensation: 'TBD',
        requirements: 'See original source',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        contactInfo: 'Contact through original source',
      };
    }

    // Simple retry with backoff for transient errors
    const maxAttempts = 3;
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let requestBody: any;
        let endpoint: string;

        if (this.provider === 'anthropic') {
          endpoint = `${this.baseUrl}/messages`;
          requestBody = {
            model: this.model,
            max_tokens: Number(process.env.ANTHROPIC_MAX_TOKENS || 1200),
            temperature: Number(process.env.ANTHROPIC_TEMPERATURE || 0.2),
            system: 'You are a Saudi Arabian casting call extraction expert. Be INCLUSIVE - extract any legitimate talent opportunity, even if terminology is informal. Prioritize catching real opportunities over perfect classification.',
            messages: [
              { role: 'user', content: prompt }
            ]
          };
        } else {
          endpoint = `${this.baseUrl}/chat/completions`;
          requestBody = {
            model: this.model,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'You are a Saudi Arabian casting call extraction expert. Be INCLUSIVE - extract any legitimate talent opportunity, even if terminology is informal. Prioritize catching real opportunities over perfect classification.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
            max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 1200),
          };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.provider === 'anthropic' && { 'anthropic-version': '2023-06-01' }),
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          // Retry on 429/5xx
          if (response.status === 429 || response.status >= 500) {
            throw new Error(`Transient ${this.provider} error ${response.status}: ${errorText}`);
          }
          throw new Error(`${this.provider} API ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        let content: string;
        if (this.provider === 'anthropic') {
          content = data.content?.[0]?.text;
        } else {
          content = data.choices?.[0]?.message?.content;
        }
        
        if (!content) {
          throw new Error(`No content in ${this.provider} response`);
        }

        // Basic cost/logging hooks
        const promptChars = prompt.length;
        console.log(`      LLM success (provider=${this.provider}, model=${this.model}, promptChars=${promptChars})`);
        return JSON.parse(content);

      } catch (error) {
        lastError = error;
        console.warn(`      LLM attempt ${attempt}/${maxAttempts} failed: ${(error as Error).message}`);
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, attempt * 500));
          continue;
        }
      }
    }
    console.error('      ❌ LLM API error (giving up):', (lastError as Error)?.message);
    throw lastError;
  }
}

const llmClient = new LlmClient();

export class LlmCastingCallExtractionService {
  async extractCastingCallFromText(text: string): Promise<{ success: boolean; data?: CastingCall; error?: string }> {
    // Pre-filter: Basic heuristic check before calling LLM
    const preFilterResult = this.preFilterContent(text);
    if (!preFilterResult.pass) {
      console.log(`      ⏭️  Pre-filter rejected: ${preFilterResult.reason}`);
      return { success: false, error: `Pre-filter rejected: ${preFilterResult.reason}` };
    }

    // Get learned patterns to enhance the prompt
    const learnedPatterns = await llmLearningService.getLearnedPatterns();
    const prompt = this.createPrompt(text, learnedPatterns);

    try {
      // Check cache first
      const cachedResponse = await llmCache.get(prompt, 'casting-extraction');
      if (cachedResponse) {
        console.log(`      ✅ Using cached LLM response`);
        
        // Check if LLM rejected it as not a casting call
        if (cachedResponse.isCastingCall === false) {
          const reason = cachedResponse.reason || 'Not a legitimate casting call';
          return { success: false, error: `Not a casting call: ${reason}` };
        }
        
        const validationResult = CastingCallSchema.safeParse(cachedResponse);
        if (validationResult.success) {
          return { success: true, data: validationResult.data };
        }
      }

      const extractedJson = await llmClient.generateJson(prompt, CastingCallSchema._def);
      
      // Cache the response (7 days TTL)
      await llmCache.set(prompt, 'casting-extraction', extractedJson, 7 * 24 * 60 * 60);
      
      // Check if LLM rejected it as not a casting call
      if (extractedJson.isCastingCall === false) {
        const reason = extractedJson.reason || 'Not a legitimate casting call';
        console.log(`      ⏭️  LLM rejected: ${reason}`);
        
        // Learn from this rejection (in case it's a false negative)
        await llmLearningService.learnFromMissedCall(
          text,
          true, // wasMissed
          false, // correctClassification (we'll update this based on user feedback)
          undefined // userFeedback (to be provided later)
        );
        
        return { success: false, error: `Not a casting call: ${reason}` };
      }
      
      const validationResult = CastingCallSchema.safeParse(extractedJson);

      if (validationResult.success) {
        // Learn from successful extraction
        await llmLearningService.learnFromMissedCall(
          text,
          false, // wasMissed
          true, // correctClassification
          'correct' // userFeedback
        );
        
        return { success: true, data: validationResult.data };
      } else {
        console.error('LLM output validation failed for Casting Call:', validationResult.error);
        return { success: false, error: validationResult.error.toString() };
      }
    } catch (error) {
      console.error('Failed to extract casting call data using LLM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private preFilterContent(text: string): { pass: boolean; reason?: string } {
    const textLower = text.toLowerCase();
    const textAr = text;

    // Strong rejection patterns (IMMEDIATE SKIP)
    const rejectPatterns = [
      /ورش[ةه]/i, // workshop
      /دور[ةه]/i, // course
      /تدريب/i, // training
      /كورس/i, // course
      /عرض.*فيلم/i, // film screening
      /افتتاح/i, // opening
      /مهرجان/i, // festival
      /كواليس/i, // behind the scenes
      /سعدنا باختيار/i, // happy to select (past tense)
      /اخترنا/i, // we chose (past)
      /الآن في صالات/i, // now in theaters
      /بينزل/i, // coming out
      /مبروك/i, // congratulations
      /تهانينا/i, // congratulations
      /جائزة/i, // award
      /وظائف/i, // jobs (general)
      /وظيفة/i, // job (general)
    ];

    for (const pattern of rejectPatterns) {
      if (pattern.test(textAr)) {
        return { pass: false, reason: `Contains rejection keyword: ${pattern.source}` };
      }
    }

    // Positive signals (AT LEAST ONE must be present)
    const talentKeywords = [
      /احتاج|نحتاج|نبحث/i, // need/looking for
      /مطلوب/i, // required
      /كاست[ني]نج/i, // casting
      /اختيار/i, // selection
      /التيست/i, // test
      /بنات|رجال|شباب|فتيات/i, // girls/boys/young people
      /اكسترا/i, // extras
      /مودل/i, // model
      /ممثل/i, // actor
    ];

    const projectKeywords = [
      /تصوير/i, // filming
      /فيلم/i, // film
      /مسلسل/i, // series
      /إعلان/i, // commercial
      /فيديو/i, // video
      /استوديو/i, // studio
      /براند/i, // brand
    ];

    const contactKeywords = [
      /للتواصل/i, // for contact
      /واتساب/i, // WhatsApp
      /ارسل|راسل/i, // send/message
      /\+966/i, // Saudi phone
      /رقم/i, // number
    ];

    const compensationKeywords = [
      /أجر|مبلغ|ريال|مدفوع/i, // payment
      /سعر/i, // price
      /\d{3,}/i, // 3+ digits (payment amounts)
    ];

    const hasTalent = talentKeywords.some(k => k.test(textAr));
    const hasProject = projectKeywords.some(k => k.test(textAr));
    const hasContact = contactKeywords.some(k => k.test(textAr));
    const hasCompensation = compensationKeywords.some(k => k.test(textAr));

    // Pass if: (talent OR project) AND (contact OR compensation)
    const positiveSignals = (hasTalent || hasProject) && (hasContact || hasCompensation);

    if (!positiveSignals) {
      return { pass: false, reason: 'Missing key talent/project + contact/compensation indicators' };
    }

    return { pass: true };
  }

  private createPrompt(text: string, learnedPatterns?: any): string {
    return `You are a casting call validation expert for the Saudi Arabian market. Your job is to identify legitimate casting opportunities. Content is primarily in Arabic.

CRITICAL: Be INCLUSIVE, not restrictive. Saudi casting calls use diverse terminology and often don't use the word "ممثلين" (actors) explicitly.

VALID CASTING CALL INDICATORS - Content should have AT LEAST ONE of:

🎬 TALENT SEEKING PATTERNS:
✅ احتاج / نحتاج / نبحث عن (we need / looking for)
✅ مطلوب (needed/required)
✅ كاستنج / كاستينج (casting)
✅ اختيار / التيست (selection/testing)
✅ بنات / رجال / شباب / فتيات (girls/boys/young people)
✅ اكسترا / extras
✅ مودل / model

🎯 PROJECT INDICATORS:
✅ تصوير / filming
✅ فيلم / film
✅ مسلسل / series
✅ إعلان / commercial/advertisement
✅ فيديو / video
✅ استوديو / studio
✅ براند / brand

💰 COMPENSATION INDICATORS:
✅ الأجر / المبلغ / ريال / مدفوع (payment/salary/riyals/paid)
✅ سعر / rate
✅ 200 / 500 / 1500 (payment amounts)

📱 CONTACT/APPLICATION:
✅ للتواصل / contact
✅ واتساب / WhatsApp
✅ ارسل / send
✅ راسلنا / message us
✅ تابعو / follow
✅ رقم التواصل / contact number
✅ +966 (Saudi phone numbers)

🕒 TIMING INDICATORS:
✅ تاريخ / date
✅ مواعيد / schedules
✅ اكتوبر / نوفمبر / ديسمبر (October/November/December)
✅ يوم / اليوم (day/today)
✅ ساعة / hour

ACCEPT these patterns (EXPANDED LIST):
✅ "احتاج بنات اكسترا" (need female extras)
✅ "نحتاج رجال" (need men)
✅ "مودل بنت" (female model)
✅ "تصوير في الرياض" (filming in Riyadh)
✅ "فرصة تصوير" (filming opportunity)
✅ "كاستنج" (casting)
✅ "التيست" (test/audition)
✅ "نحتاج فيه ممثلين" (we need actors)
✅ Messages with payment + contact + location
✅ Messages with specific dates + talent requirements

IMMEDIATE REJECTION - Return {"isCastingCall": false, "reason": "..."} ONLY if:
❌ Film screenings/premieres (عرض, افتتاح, مهرجان)
❌ Workshops/courses (ورشة, دورة, تدريب, كورس)
❌ Behind-the-scenes content (خلف الكواليس, كواليس)
❌ Past/completed projects (سعدنا باختيار, اخترنا, already selected)
❌ Film release announcements (الآن في صالات, بينزل)
❌ Congratulations/awards (مبروك, تهانينا, جائزة)
❌ General job listings (وظائف, وظيفة)
❌ Company announcements (بيان, إعلان الشركة)

VALIDATION PROCESS (MORE INCLUSIVE):
Step 1: Look for ANY talent-seeking keywords (احتاج, نحتاج, نبحث, مطلوب)
Step 2: Look for ANY project indicators (تصوير, فيلم, إعلان, فيديو)
Step 3: Look for contact info OR payment info OR specific dates
Step 4: If rejection indicators found → reject
Step 5: If talent-seeking + (project OR contact OR payment OR dates) → EXTRACT
Step 6: If uncertain → EXTRACT (better to include than miss)

${learnedPatterns ? `LEARNED PATTERNS (High Confidence):
🎬 TALENT: ${learnedPatterns.highConfidenceTalent.join(', ')}
🎯 PROJECT: ${learnedPatterns.highConfidenceProject.join(', ')}
📱 CONTACT: ${learnedPatterns.highConfidenceContact.join(', ')}
💰 PAYMENT: ${learnedPatterns.highConfidencePayment.join(', ')}
📍 LOCATION: ${learnedPatterns.highConfidenceLocation.join(', ')}

These patterns have been learned from previous successful extractions and should be prioritized.` : ''}

Required JSON structure (only if legitimate casting call):
{
  "isCastingCall": true,
  "title": "string (required - the role or project name, preserve Arabic)",
  "description": "string (required - details about the opportunity, preserve Arabic)",
  "company": "string (required - production company name, preserve Arabic)",
  "location": "string (required - where audition/shoot will happen, e.g., Riyadh/الرياض)",
  "compensation": "string (optional - pay rate, مدفوع/unpaid)",
  "requirements": "string (optional - actor requirements, preserve Arabic)",
  "deadline": "ISO 8601 datetime (optional - convert Arabic dates)",
  "contactInfo": "string (optional - how to apply, preserve Arabic)",
  "projectType": "string (optional - Film/فيلم, TV Series/مسلسل, Commercial/إعلان)",
  "roles": "string (optional - character descriptions, preserve Arabic)"
}

Important rules:
- For Arabic dates (convert to ISO 8601): "حتى ١٥ نوفمبر" → calculate actual date
- Preserve ALL Arabic text in extracted fields
- If ANY required field is missing, return {"isCastingCall": false}
- Return ONLY valid JSON, no explanations

Content to analyze:
---
${text}
---

JSON output:`;
  }
}
