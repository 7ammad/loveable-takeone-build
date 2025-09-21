import { emailQueue } from '@/packages/core-queue/src/queues';
import { emailTemplates } from './templates/emails';

type Language = 'en' | 'ar';
type EmailTemplateName = keyof typeof emailTemplates;

export interface SendEmailParams {
  to: string;
  template: EmailTemplateName;
  language: Language;
  context: Record<string, any>;
}

export async function sendEmail(params: SendEmailParams) {
  const { to, template, language, context } = params;

  // In a real application, you would have a more robust templating engine.
  // This is a simplified version for demonstration.
  const templateContent = emailTemplates[template][language];
  const subject = templateContent.subject.replace(/{{(.*?)}}/g, (_, key) => context[key.trim()] || '');
  const body = templateContent.body.replace(/{{(.*?)}}/g, (_, key) => context[key.trim()] || '');

  await emailQueue.add('send-email', {
    to,
    subject,
    body,
  });
}
