import type { Prompt } from '@workspace/shared';

export const licenceRenewalPrompt: Prompt = {
  id: 'licence-renewal',
  title: 'Driver Licence Renewal',
  description: 'Render a licence-renewal workflow with identity checks, medical review, and approval paths.',
  capabilities: ['Mermaid flowchart', 'Status model', 'WCAG notes', 'Secure data'],
  systemPrompt:
    'You are a frontend-focused systems analyst working on a government licensing portal. Generate an AI-style process document for online driver licence renewal. Include a Mermaid flowchart with identity verification, eligibility checks, medical-condition handling, payment, confirmation, and manual review branches. Include a status table, form validation notes, accessibility notes for errors and focus management, and security notes for personal data handling. Use concise labels in the Mermaid diagram.',
};
