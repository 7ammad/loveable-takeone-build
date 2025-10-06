import { emailQueue } from '@/packages/core-queue/src/queues';
import { emailTemplates } from './templates/emails';

type Language = 'en' | 'ar';
type EmailTemplateName = keyof typeof emailTemplates;

export interface SendEmailParams {
  to: string;
  template?: EmailTemplateName;
  language?: Language;
  context?: Record<string, any>;
  subject?: string;
  html?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const { to, template, language, context, subject: rawSubject, html: rawHtml } = params;

  let subject: string;
  let body: string;

  if (template && language && context) {
    // Use template-based email
    const templateContent = emailTemplates[template][language];
    subject = templateContent.subject.replace(/{{(.*?)}}/g, (_, key) => context[key.trim()] || '');
    body = templateContent.body.replace(/{{(.*?)}}/g, (_, key) => context[key.trim()] || '');
  } else if (rawSubject && rawHtml) {
    // Use raw subject and HTML
    subject = rawSubject;
    body = rawHtml;
  } else {
    throw new Error('Either (template, language, context) or (subject, html) must be provided');
  }

  await emailQueue.add('send-email', {
    to,
    subject,
    body,
  });
}
