import { CastingCall, CastingCallSchema } from '@packages/core-contracts';

// This is a placeholder for a real LLM provider client (e.g., OpenAI, Anthropic)
const llmClient = {
  // A mock function that simulates calling an LLM API
  async generateJson(prompt: string, schema: any): Promise<any> {
    console.log('--- LLM PROMPT (Casting Call) ---');
    console.log(prompt);
    console.log('--- END LLM PROMPT ---');

    // Mock object that matches the CastingCall schema
    return {
      title: 'Lead Actor for Historical Drama',
      description: 'Seeking a talented male actor to portray a historical figure in an upcoming major TV production. Must have strong dramatic skills.',
      company: 'Riyadh Central Studios',
      location: 'Riyadh, Saudi Arabia',
      compensation: 'Competitive, based on experience',
      requirements: 'Male, 30-40 years old, fluent in Classical Arabic, prior experience in historical dramas preferred.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      contactInfo: 'Please send headshots and resume to casting@riyadhstudios.com',
    };
  }
};

export class LlmCastingCallExtractionService {
  async extractCastingCallFromText(text: string): Promise<{ success: boolean; data?: CastingCall; error?: string }> {
    const prompt = this.createPrompt(text);

    try {
      const extractedJson = await llmClient.generateJson(prompt, CastingCallSchema._def);
      const validationResult = CastingCallSchema.safeParse(extractedJson);

      if (validationResult.success) {
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

  private createPrompt(text: string): string {
    return `
      You are an expert data extraction assistant for the entertainment industry.
      Your task is to parse the following text, which could be from a website or a WhatsApp message,
      and extract the key information for a casting call into a structured JSON object.

      The JSON object must conform to the following schema:
      ${JSON.stringify(CastingCallSchema._def, null, 2)}

      Pay close attention to details:
      - The 'deadline' must be a valid ISO 8601 datetime string.
      - If a piece of information is not present, omit the corresponding key.
      - Accurately capture all requirements, contact information, and compensation details.

      Text to analyze:
      ---
      ${text}
      ---
    `;
  }
}
