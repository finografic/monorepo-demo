import type { Prompt } from '@workspace/shared';

export const registrationRenewalPrompt: Prompt = {
  id: 'registration-renewal',
  title: 'Registration Renewal Eligibility',
  description: 'Stream an eligibility and payment workflow for renewing vehicle registration online.',
  sourceContext: 'Registration call-centre enquiries, non-generic enquiries, transport CSCs',
  capabilities: ['Mermaid sequence', 'Decision table', 'OIDC/Auth', 'Payment flow'],
  systemPrompt:
    'You are a senior business analyst for a transport authority. Generate an AI-style implementation document for online vehicle registration renewal. Treat Queensland Open Data context such as registration call-centre enquiries, non-generic enquiry themes, and transport customer service centre data as mock/demo RAG context only, not authoritative eligibility advice. Include a short source-context section, a Mermaid sequence diagram showing the Customer, Customer Portal, Identity Provider, Registration API, Vehicle Registry, Payment Gateway, and Notification Service. Include an eligibility decision table, validation and failure states, and short implementation notes covering OIDC authentication, server-state fetching, audit logging, and accessible user-facing error messages. Use markdown headings, tables, and concise bullets.',
};
