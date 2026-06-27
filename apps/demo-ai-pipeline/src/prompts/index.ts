import type { Prompt } from '@workspace/shared';

export const PROMPTS: Prompt[] = [
  {
    id: 'workflow',
    title: 'Service Request Workflow',
    description: 'Generate a flowchart and prose for a transport customer portal service request process.',
    capabilities: ['Mermaid flowchart', 'Markdown table'],
    systemPrompt:
      'You are a senior systems analyst. Produce a detailed service request workflow for a government transport customer portal. Include: a Mermaid flowchart (flowchart TD), a markdown table of key decision points and outcomes, and a short implementation notes section. Use ## headings.',
  },
  {
    id: 'renewal',
    title: 'Registration Renewal Eligibility',
    description:
      'Model the eligibility decision flow for vehicle registration renewal as a sequence diagram.',
    capabilities: ['Mermaid sequence', 'Markdown table'],
    systemPrompt:
      'You are a business analyst at a transport authority. Produce an eligibility check workflow for vehicle registration renewal. Include: a Mermaid sequence diagram (sequenceDiagram) showing interactions between Customer, Portal, Database, and Payment Gateway, and a decision table in markdown. Use ## headings.',
  },
  {
    id: 'state-mgmt',
    title: 'React State Management Comparison',
    description:
      'Compare Zustand, Redux Toolkit, Jotai, and TanStack Query across key architectural dimensions.',
    capabilities: ['Markdown table'],
    systemPrompt:
      'You are a senior React architect. Write a structured comparison of Zustand, Redux Toolkit, Jotai, and TanStack Query. Include: a markdown table comparing them across bundle size, learning curve, DevTools, async support, and best use case. Follow with a recommendation section. Use ## headings.',
  },
  {
    id: 'deep-merge',
    title: 'TypeScript Deep Merge Utility',
    description: 'Write a typed, recursive deep merge function with generic constraints.',
    capabilities: ['Code block', 'TypeScript'],
    systemPrompt:
      'You are a TypeScript expert. Write a production-ready deepMerge<T> utility function in TypeScript that recursively merges two objects. Include: full TypeScript implementation with generics, handling for arrays and primitives, and a usage example. Use ```typescript code blocks.',
  },
  {
    id: 'rest-api',
    title: 'Task Management REST API Design',
    description: 'Design REST endpoints, request/response shapes, and a sequence diagram for a task API.',
    capabilities: ['Markdown table', 'Mermaid sequence', 'Code block'],
    systemPrompt:
      'You are a backend architect. Design a RESTful API for a task management system. Include: an endpoint table (method, path, description, auth required), JSON request/response examples in ```json code blocks, and a Mermaid sequence diagram showing a create-task flow. Use ## headings.',
  },
];
