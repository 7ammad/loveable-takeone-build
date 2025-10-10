/**
 * LLM Self-Learning Service
 * Learns from missed calls and improves filtering patterns over time
 */

import { prisma } from '@packages/core-db';

export interface LearningPattern {
  id: string;
  pattern: string;
  type: 'talent_keyword' | 'project_keyword' | 'contact_keyword' | 'payment_keyword' | 'location_keyword';
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  examples: string[];
}

export interface MissedCallFeedback {
  originalText: string;
  wasMissed: boolean;
  correctClassification: boolean;
  extractedPatterns: string[];
  userFeedback?: 'correct' | 'incorrect';
  timestamp: Date;
}

class LlmLearningService {
  private learningCache: Map<string, LearningPattern[]> = new Map();
  private feedbackQueue: MissedCallFeedback[] = [];

  /**
   * Learn from a missed casting call
   */
  async learnFromMissedCall(
    originalText: string,
    wasMissed: boolean,
    correctClassification: boolean,
    userFeedback?: 'correct' | 'incorrect'
  ): Promise<void> {
    console.log(`🧠 Learning from ${wasMissed ? 'missed' : 'processed'} call...`);

    const feedback: MissedCallFeedback = {
      originalText,
      wasMissed,
      correctClassification,
      extractedPatterns: this.extractPatterns(originalText),
      userFeedback,
      timestamp: new Date()
    };

    this.feedbackQueue.push(feedback);

    // Process learning in background
    setImmediate(() => this.processLearningBatch());
  }

  /**
   * Extract patterns from text for learning
   */
  private extractPatterns(text: string): string[] {
    const patterns: string[] = [];

    // Talent patterns
    const talentPatterns = [
      'بنات', 'رجال', 'شباب', 'فتيات', 'اكسترا', 'مودل', 'شاب', 'بنت',
      'ممثلين', 'ممثل', 'ممثلة', 'ممثلات', 'actors', 'actress'
    ];

    // Project patterns
    const projectPatterns = [
      'تصوير', 'فيلم', 'مسلسل', 'إعلان', 'فيديو', 'استوديو', 'براند',
      'filming', 'film', 'series', 'commercial', 'video', 'studio', 'brand'
    ];

    // Contact patterns
    const contactPatterns = [
      'للتواصل', 'واتساب', 'ارسل', 'راسلنا', 'تابعو', 'رقم التواصل',
      'contact', 'whatsapp', 'send', 'message', 'follow', 'phone'
    ];

    // Payment patterns
    const paymentPatterns = [
      'الأجر', 'المبلغ', 'ريال', 'مدفوع', 'سعر', 'rate', 'paid',
      '200', '500', '1000', '1500', '2000'
    ];

    // Location patterns
    const locationPatterns = [
      'الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'الطائف',
      'riyadh', 'jeddah', 'dammam', 'mecca', 'medina'
    ];

    // Extract patterns
    [...talentPatterns, ...projectPatterns, ...contactPatterns, ...paymentPatterns, ...locationPatterns]
      .forEach(pattern => {
        if (text.toLowerCase().includes(pattern.toLowerCase())) {
          patterns.push(pattern);
        }
      });

    // Extract phone numbers
    const phoneMatches = text.match(/\+966\d{9}|\d{10,}/g);
    if (phoneMatches) {
      patterns.push(...phoneMatches.map(phone => `phone:${phone}`));
    }

    // Extract dates
    const dateMatches = text.match(/\d{1,2}\/\d{1,2}|\d{1,2}\s+(أكتوبر|نوفمبر|ديسمبر|يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر)/g);
    if (dateMatches) {
      patterns.push(...dateMatches.map(date => `date:${date}`));
    }

    return patterns;
  }

  /**
   * Process learning batch
   */
  private async processLearningBatch(): Promise<void> {
    if (this.feedbackQueue.length === 0) return;

    const batch = this.feedbackQueue.splice(0, 10); // Process 10 at a time
    
    try {
      for (const feedback of batch) {
        await this.updatePatternConfidence(feedback);
      }

      // Save updated patterns to database
      await this.persistLearningData();
      
      console.log(`🧠 Processed ${batch.length} learning examples`);
    } catch (error) {
      console.error('❌ Learning batch processing failed:', error);
      // Re-queue failed items
      this.feedbackQueue.unshift(...batch);
    }
  }

  /**
   * Update pattern confidence based on feedback
   */
  private async updatePatternConfidence(feedback: MissedCallFeedback): Promise<void> {
    for (const pattern of feedback.extractedPatterns) {
      const patternType = this.classifyPatternType(pattern);
      
      // Get or create pattern
      let learningPattern = await this.getPattern(pattern, patternType);
      if (!learningPattern) {
        learningPattern = {
          id: this.generatePatternId(pattern, patternType),
          pattern,
          type: patternType,
          confidence: 0.5,
          occurrences: 0,
          lastSeen: new Date(),
          examples: []
        };
      }

      // Update confidence based on feedback
      const confidenceAdjustment = this.calculateConfidenceAdjustment(feedback);
      learningPattern.confidence = Math.max(0, Math.min(1, 
        learningPattern.confidence + confidenceAdjustment
      ));
      
      learningPattern.occurrences++;
      learningPattern.lastSeen = new Date();
      
      // Keep examples (max 5)
      if (learningPattern.examples.length < 5) {
        learningPattern.examples.push(feedback.originalText.substring(0, 200));
      }

      // Update cache
      const cacheKey = `${patternType}_${pattern}`;
      this.learningCache.set(cacheKey, [learningPattern]);
    }
  }

  /**
   * Classify pattern type
   */
  private classifyPatternType(pattern: string): LearningPattern['type'] {
    if (pattern.startsWith('phone:')) return 'contact_keyword';
    if (pattern.startsWith('date:')) return 'contact_keyword'; // Dates are contact-related
    
    const talentKeywords = ['بنات', 'رجال', 'شباب', 'فتيات', 'اكسترا', 'مودل', 'شاب', 'بنت', 'ممثلين', 'ممثل', 'ممثلة'];
    const projectKeywords = ['تصوير', 'فيلم', 'مسلسل', 'إعلان', 'فيديو', 'استوديو', 'براند'];
    const contactKeywords = ['للتواصل', 'واتساب', 'ارسل', 'راسلنا', 'تابعو', 'رقم التواصل'];
    const paymentKeywords = ['الأجر', 'المبلغ', 'ريال', 'مدفوع', 'سعر', '200', '500', '1000', '1500', '2000'];
    const locationKeywords = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'الطائف'];

    if (talentKeywords.includes(pattern)) return 'talent_keyword';
    if (projectKeywords.includes(pattern)) return 'project_keyword';
    if (contactKeywords.includes(pattern)) return 'contact_keyword';
    if (paymentKeywords.includes(pattern)) return 'payment_keyword';
    if (locationKeywords.includes(pattern)) return 'location_keyword';

    return 'contact_keyword'; // Default
  }

  /**
   * Calculate confidence adjustment based on feedback
   */
  private calculateConfidenceAdjustment(feedback: MissedCallFeedback): number {
    // Positive feedback increases confidence
    if (feedback.userFeedback === 'correct' || (!feedback.wasMissed && feedback.correctClassification)) {
      return 0.1;
    }
    
    // Negative feedback decreases confidence
    if (feedback.userFeedback === 'incorrect' || (feedback.wasMissed && feedback.correctClassification)) {
      return -0.1;
    }

    // Neutral adjustment for learning
    return 0.05;
  }

  /**
   * Get pattern from cache or database
   */
  private async getPattern(pattern: string, type: LearningPattern['type']): Promise<LearningPattern | null> {
    const cacheKey = `${type}_${pattern}`;
    const cached = this.learningCache.get(cacheKey);
    if (cached && cached.length > 0) {
      return cached[0];
    }

    // Try to load from database
    try {
      const stored = await prisma.llmLearningPattern.findFirst({
        where: { pattern, type }
      });

      if (stored) {
        const learningPattern: LearningPattern = {
          id: stored.id,
          pattern: stored.pattern,
          type: stored.type as LearningPattern['type'],
          confidence: stored.confidence,
          occurrences: stored.occurrences,
          lastSeen: stored.lastSeen,
          examples: stored.examples || []
        };

        this.learningCache.set(cacheKey, [learningPattern]);
        return learningPattern;
      }
    } catch (error) {
      console.error('Failed to load pattern from database:', error);
    }

    return null;
  }

  /**
   * Generate pattern ID
   */
  private generatePatternId(pattern: string, type: LearningPattern['type']): string {
    return `${type}_${pattern.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  }

  /**
   * Persist learning data to database
   */
  private async persistLearningData(): Promise<void> {
    try {
      const patternsToSave = Array.from(this.learningCache.values()).flat();

      for (const pattern of patternsToSave) {
        await prisma.llmLearningPattern.upsert({
          where: { id: pattern.id },
          update: {
            confidence: pattern.confidence,
            occurrences: pattern.occurrences,
            lastSeen: pattern.lastSeen,
            examples: pattern.examples
          },
          create: {
            id: pattern.id,
            pattern: pattern.pattern,
            type: pattern.type,
            confidence: pattern.confidence,
            occurrences: pattern.occurrences,
            lastSeen: pattern.lastSeen,
            examples: pattern.examples
          }
        });
      }

      console.log(`💾 Saved ${patternsToSave.length} learning patterns to database`);
    } catch (error) {
      console.error('❌ Failed to persist learning data:', error);
    }
  }

  /**
   * Get learned patterns for prompt enhancement
   */
  async getLearnedPatterns(): Promise<{
    highConfidenceTalent: string[];
    highConfidenceProject: string[];
    highConfidenceContact: string[];
    highConfidencePayment: string[];
    highConfidenceLocation: string[];
  }> {
    try {
      const patterns = await prisma.llmLearningPattern.findMany({
        where: {
          confidence: { gte: 0.7 } // High confidence patterns
        },
        orderBy: {
          confidence: 'desc'
        }
      });

      const result = {
        highConfidenceTalent: [] as string[],
        highConfidenceProject: [] as string[],
        highConfidenceContact: [] as string[],
        highConfidencePayment: [] as string[],
        highConfidenceLocation: [] as string[]
      };

      patterns.forEach(pattern => {
        switch (pattern.type) {
          case 'talent_keyword':
            result.highConfidenceTalent.push(pattern.pattern);
            break;
          case 'project_keyword':
            result.highConfidenceProject.push(pattern.pattern);
            break;
          case 'contact_keyword':
            result.highConfidenceContact.push(pattern.pattern);
            break;
          case 'payment_keyword':
            result.highConfidencePayment.push(pattern.pattern);
            break;
          case 'location_keyword':
            result.highConfidenceLocation.push(pattern.pattern);
            break;
        }
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to get learned patterns:', error);
      return {
        highConfidenceTalent: [],
        highConfidenceProject: [],
        highConfidenceContact: [],
        highConfidencePayment: [],
        highConfidenceLocation: []
      };
    }
  }

  /**
   * Get learning statistics
   */
  async getLearningStats(): Promise<{
    totalPatterns: number;
    averageConfidence: number;
    recentActivity: number;
    topPatterns: Array<{ pattern: string; confidence: number; occurrences: number }>;
  }> {
    try {
      const patterns = await prisma.llmLearningPattern.findMany();
      const recentActivity = await prisma.llmLearningPattern.count({
        where: {
          lastSeen: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      });

      const averageConfidence = patterns.length > 0 
        ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
        : 0;

      const topPatterns = patterns
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10)
        .map(p => ({
          pattern: p.pattern,
          confidence: p.confidence,
          occurrences: p.occurrences
        }));

      return {
        totalPatterns: patterns.length,
        averageConfidence,
        recentActivity,
        topPatterns
      };
    } catch (error) {
      console.error('❌ Failed to get learning stats:', error);
      return {
        totalPatterns: 0,
        averageConfidence: 0,
        recentActivity: 0,
        topPatterns: []
      };
    }
  }
}

export const llmLearningService = new LlmLearningService();
