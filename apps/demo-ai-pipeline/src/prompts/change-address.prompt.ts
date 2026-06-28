import type { Prompt } from '@workspace/shared';

export const changeAddressPrompt: Prompt = {
  id: 'change-address',
  title: 'Change of Address',
  description: 'Document an authenticated change-of-address flow with validation, audit, and API examples.',
  capabilities: ['REST API', 'Code block', 'Mermaid sequence', 'Audit trail'],
  systemPrompt:
    'You are a senior frontend engineer documenting an authenticated government service flow. Generate an implementation document for changing a customer address online. Include a Mermaid sequence diagram showing Customer, Customer Portal, OIDC Provider, Profile API, Address Validation Service, and Audit Log. Include REST request and response examples in JSON code blocks, a validation error table, and frontend notes covering TanStack Query mutation states, optimistic update avoidance, PII exposure, and confirmation messaging.',
};
