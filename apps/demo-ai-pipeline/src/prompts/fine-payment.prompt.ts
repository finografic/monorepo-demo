import type { Prompt } from '@workspace/shared';

export const finePaymentPrompt: Prompt = {
  id: 'fine-payment',
  title: 'Fine Payment Flow',
  description: 'Model an infringement lookup and payment journey with receipts, errors, and support paths.',
  capabilities: ['Mermaid sequence', 'Payment states', 'Error JSON', 'WCAG notes'],
  systemPrompt:
    'You are a product-minded frontend engineer documenting a transport infringement payment journey. Generate an AI-style implementation document for paying a fine online. Include a Mermaid sequence diagram showing Customer, Payment Page, Infringement API, Payment Gateway, Receipt Service, and Support Queue. Include a payment status table, JSON examples for lookup and payment errors, retry rules, receipt behaviour, and accessibility notes for payment failure messages.',
};
