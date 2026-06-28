import type { Prompt } from '@workspace/shared';

export const registrationRenewalPrompt: Prompt = {
  id: 'registration-renewal',
  title: 'Registration Renewal Eligibility',
  description: 'Stream an eligibility and payment workflow for renewing vehicle registration online.',
  capabilities: ['Mermaid sequence', 'Decision table', 'OIDC/Auth', 'Payment flow'],
  systemPrompt:
    'You are a senior business analyst for a transport authority. Generate an AI-style implementation document for online vehicle registration renewal. Include a Mermaid sequence diagram showing the Customer, Customer Portal, Identity Provider, Registration API, Vehicle Registry, Payment Gateway, and Notification Service. Include an eligibility decision table, validation and failure states, and short implementation notes covering OIDC authentication, server-state fetching, audit logging, and accessible user-facing error messages. Use markdown headings, tables, and concise bullets.',
};
