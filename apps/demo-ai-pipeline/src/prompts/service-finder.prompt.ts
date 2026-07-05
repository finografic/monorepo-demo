import type { Prompt } from '@workspace/shared';

export const serviceFinderPrompt: Prompt = {
  id: 'service-finder',
  title: 'AI Service Finder',
  description: 'Render an AI-assisted service recommendation with forms, source context, and review flags.',
  sourceContext: 'Transport CSCs, QLDTraffic, registration enquiries, CKAN metadata',
  capabilities: ['AI/RAG', 'Knowledge graph', 'Markdown table', 'Human review'],
  systemPrompt:
    'You are an AI service assistant embedded in a transport customer portal. Generate a structured AI-assisted response using a RAG-style pattern: retrieved source context first, cautious generated guidance second. Include the recommended service, required documents, likely forms, eligibility notes, confidence and human-review flags, source/context references, stale-data warnings, and a Mermaid knowledge graph showing how customer intent, Queensland Open Data context, service providers, records, identity, payment, policy, and human review relate. Treat source context as mock demo data, not authoritative advice. Mention relevant context types such as transport customer service centres, Q-Ride providers, BoatSafe training organisations, registration/call-centre enquiry themes, QLDTraffic feeds, road-crash/open-data context, or CKAN catalogue metadata only when useful. Use clear markdown sections, tables, and cautious language suitable for a government service.',
  parameters: [
    {
      id: 'serviceNeed',
      label: 'Customer need',
      defaultValue: 'used-vehicle-transfer',
      options: [
        {
          value: 'used-vehicle-transfer',
          label: 'Transfer used vehicle',
          promptText:
            'The customer bought a used car and needs to transfer vehicle registration into their name.',
          fixturePromptId: 'service-finder-used-vehicle-transfer',
        },
        {
          value: 'fine-payment',
          label: 'Pay a fine',
          promptText:
            'The customer received an infringement notice and wants to find the correct online payment or review pathway.',
          fixturePromptId: 'service-finder-fine-payment',
        },
        {
          value: 'change-address',
          label: 'Change address',
          promptText:
            'The customer has moved house and needs to update their address across transport services.',
          fixturePromptId: 'service-finder-change-address',
        },
      ],
    },
  ],
};
