# DONE — AI Markdown Pipeline Final 5 Fixtures

> **Completed:** 2026-06-30 — TMR-specific prompt manifest and fixture files shipped; fixture mode is the default demo experience.

> Scope: `apps/demo-ai-pipeline`
>
> Goal: replace the generic demo fixtures with five TMR-aligned transactional service fixtures that best
> showcase AI-generated markdown rendering, Mermaid diagrams, code blocks, tables, accessibility,
> security, auth, and API-contract thinking.
>
> **Completion legend:** `[ ]` to-do · `[x]` done · `[-]` deferred

---

## Decision

Use this final fixture set:

| #   | Fixture                             | Prompt ID              | Primary renderer proof                     | TMR / role alignment                                                 |
| --- | ----------------------------------- | ---------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| 1   | Registration Renewal Eligibility    | `registration-renewal` | Mermaid sequence, decision table           | Registration transformation, payment flow, eligibility logic         |
| 2   | Driver Licence Renewal Workflow     | `licence-renewal`      | Mermaid flowchart, status table            | Licensing transformation, manual review paths, accessible forms      |
| 3   | Change of Address Service Flow      | `change-address`       | REST/code blocks, Mermaid sequence         | Authenticated transaction, PII handling, validation, audit trail     |
| 4   | Fine Payment / Infringement Flow    | `fine-payment`         | Mermaid sequence, status table, error JSON | Payment UX, failure states, receipts, support escalation             |
| 5   | AI Service Finder / Forms Assistant | `service-finder`       | AI/RAG markdown, tables, Mermaid graph     | AI-integrated service delivery, rich generated content, human review |

Remove these from the primary prompt list:

- `workflow` / **Service Request Workflow** — too broad; replace with sharper licence/registration flows.
- `state-mgmt` / **React State Management Comparison** — useful but generic; fold state strategy notes into fixture implementation notes.
- `deep-merge` / **TypeScript Deep Merge Utility** — too generic; preserve code-rendering proof through API/schema examples.
- `rest-api` / **Task Management REST API Design** — too generic; replace with TMR-shaped API contracts.

Keep the current `renewal` idea, but rename/rework it as `registration-renewal`.

---

## Why This Set

The TMR role description is not just asking for a React portfolio. It calls out:

- AI-integrated web applications
- data visualisation, diagramming, graph/network/process flows
- rich markdown rendering for AI-generated content
- code blocks, tables, embedded media
- React, TypeScript, routing, server-state fetching
- OAuth2/OIDC and secure token handling
- WCAG 2.1/2.2 AA accessibility
- tests, API mocking, Playwright, axe/Lighthouse
- secure coding, sanitisation, dependency and secrets awareness
- government or regulated-service delivery context

This fixture set makes every prompt card speak to those requirements in TMR language:

- registration renewal
- driver licence renewal
- change of address
- infringement payment
- AI-assisted service/form discovery

The demo remains an **AI markdown rendering pipeline**, but the content now looks like something built
for a transport/customer-service transformation team.

---

## Diagram Authoring Rules

The current screenshots show two problems:

- flowchart labels can become tiny or clipped when node text is too long
- sequence diagram text has low contrast and can become hard to read at large widths

Use these rules when generating fixture markdown:

- Prefer short Mermaid node labels, then explain detail in markdown tables below the diagram.
- Use aliases for sequence participants, such as `participant Portal as Customer Portal`.
- Avoid long edge labels; keep edge labels under roughly 36 characters.
- Prefer `flowchart LR` for wide business processes and `sequenceDiagram` for system interaction flows.
- Avoid Mermaid HTML labels unless the renderer/sanitiser issue is fully solved.
- Do not rely on diagram text alone; every diagram must be backed by a table.
- Keep each fixture around 900-1400 rendered words or equivalent; the demo should feel complete, not endless.

---

## Fixture 1 — Registration Renewal Eligibility

**Prompt ID:** `registration-renewal`

**Prompt card title:** `Registration Renewal Eligibility`

**Prompt card description:** `Stream an eligibility and payment workflow for renewing vehicle registration online.`

**Capabilities:**

- `Mermaid sequence`
- `Decision table`
- `OIDC/Auth`
- `Payment flow`

**Purpose**

This is the strongest existing TMR match. It directly maps to vehicle registration renewal and lets
the demo show system interactions, eligibility checks, payment, certificate generation, and failure
states.

**System prompt**

```text
You are a senior business analyst for a transport authority. Generate an AI-style implementation
document for online vehicle registration renewal. Include a Mermaid sequence diagram showing the
Customer, Customer Portal, Identity Provider, Registration API, Vehicle Registry, Payment Gateway,
and Notification Service. Include an eligibility decision table, validation and failure states, and
short implementation notes covering OIDC authentication, server-state fetching, audit logging, and
accessible user-facing error messages. Use markdown headings, tables, and concise bullets.
```

**Expected markdown sections**

- `# Registration Renewal Eligibility`
- `## Sequence Diagram`
- `## Eligibility Decision Table`
- `## Failure States`
- `## Frontend Implementation Notes`
- `## Accessibility and Security Notes`

**Diagram content**

- Customer authenticates
- Portal loads renewal options
- API validates vehicle ownership
- Vehicle registry returns registration state
- Portal checks unpaid infringements and inspection requirements
- Payment gateway authorises payment
- Registration API updates record
- Notification service sends receipt/certificate

**Must show**

- OIDC/session awareness
- payment not attempted until eligibility passes
- targeted remediation messages for failed checks
- no raw PII in logs
- TanStack Query style server-state notes

---

## Fixture 2 — Driver Licence Renewal Workflow

**Prompt ID:** `licence-renewal`

**Prompt card title:** `Driver Licence Renewal`

**Prompt card description:** `Render a licence-renewal workflow with identity checks, medical review, and approval paths.`

**Capabilities:**

- `Mermaid flowchart`
- `Status model`
- `WCAG notes`
- `Secure data`

**Purpose**

This replaces the generic service-request fixture with a direct licensing transaction. It demonstrates
business-process modelling, conditional branches, manual review, accessible form behaviour, and
sensitive-data handling.

**System prompt**

```text
You are a frontend-focused systems analyst working on a government licensing portal. Generate an
AI-style process document for online driver licence renewal. Include a Mermaid flowchart with
identity verification, eligibility checks, medical-condition handling, payment, confirmation, and
manual review branches. Include a status table, form validation notes, accessibility notes for errors
and focus management, and security notes for personal data handling. Use concise labels in the
Mermaid diagram.
```

**Expected markdown sections**

- `# Driver Licence Renewal Workflow`
- `## Process Flow`
- `## Renewal Status Model`
- `## Form Validation Rules`
- `## Accessibility Notes`
- `## Security Notes`

**Diagram content**

- Start renewal
- Verify identity
- Check licence status
- Ask medical declaration
- Route to manual review when needed
- Calculate fee
- Process payment
- Issue renewed licence or send review outcome

**Must show**

- manual review branch
- status model suitable for frontend routing
- accessible inline validation
- screen-reader-friendly error summary
- sensitive personal data minimisation

---

## Fixture 3 — Change of Address Service Flow

**Prompt ID:** `change-address`

**Prompt card title:** `Change of Address`

**Prompt card description:** `Document an authenticated change-of-address flow with validation, audit, and API examples.`

**Capabilities:**

- `REST API`
- `Code block`
- `Mermaid sequence`
- `Audit trail`

**Purpose**

This fixture is the best replacement for the generic REST API demo. It keeps the code-block and API
contract proof, but makes the content TMR-specific and security-aware.

**System prompt**

```text
You are a senior frontend engineer documenting an authenticated government service flow. Generate an
implementation document for changing a customer's address online. Include a Mermaid sequence diagram
showing Customer, Customer Portal, OIDC Provider, Profile API, Address Validation Service, and Audit
Log. Include REST request and response examples in JSON code blocks, a validation error table, and
frontend notes covering TanStack Query mutation states, optimistic update avoidance, PII exposure,
and confirmation messaging.
```

**Expected markdown sections**

- `# Change of Address Service Flow`
- `## Sequence Diagram`
- `## API Contract`
- `## Request`
- `## Success Response`
- `## Validation Errors`
- `## Frontend State Handling`
- `## Security Notes`

**Code block requirements**

Include at least:

```text
PATCH /api/customer/address
Authorization: Bearer <token>
Content-Type: application/json
```

Include JSON request and response examples with realistic fields:

- `addressLine1`
- `suburb`
- `state`
- `postcode`
- `effectiveDate`
- `auditReason`

**Must show**

- authenticated-only flow
- address validation service
- audit event persistence
- validation errors mapped to fields
- no optimistic update until server confirms

---

## Fixture 4 — Fine Payment / Infringement Flow

**Prompt ID:** `fine-payment`

**Prompt card title:** `Fine Payment Flow`

**Prompt card description:** `Model an infringement lookup and payment journey with receipts, errors, and support paths.`

**Capabilities:**

- `Mermaid sequence`
- `Payment states`
- `Error JSON`
- `WCAG notes`

**Purpose**

This fixture demonstrates transactional UI complexity: lookup, payment, authorisation, retry,
receipt generation, error handling, and escalation. It is visibly TMR-relevant and shows mature
frontend thinking around failure states.

**System prompt**

```text
You are a product-minded frontend engineer documenting a transport infringement payment journey.
Generate an AI-style implementation document for paying a fine online. Include a Mermaid sequence
diagram showing Customer, Payment Page, Infringement API, Payment Gateway, Receipt Service, and
Support Queue. Include a payment status table, JSON examples for lookup and payment errors, retry
rules, receipt behaviour, and accessibility notes for payment failure messages.
```

**Expected markdown sections**

- `# Fine Payment / Infringement Flow`
- `## Sequence Diagram`
- `## Payment Status Table`
- `## Error Response Examples`
- `## Retry and Escalation Rules`
- `## Accessible Payment UX`
- `## Security Notes`

**Must show**

- infringement lookup before payment
- gateway timeout and declined-card states
- receipt generation after confirmed payment
- support escalation when payment status is ambiguous
- PCI-sensitive data never touches the app server

---

## Fixture 5 — AI Service Finder / Forms Assistant

**Prompt ID:** `service-finder`

**Prompt card title:** `AI Service Finder`

**Prompt card description:** `Render an AI-assisted service recommendation with forms, source context, and review flags.`

**Capabilities:**

- `AI/RAG`
- `Knowledge graph`
- `Markdown table`
- `Human review`

**Purpose**

This is the strongest "AI-integrated UI" fixture. It shows the renderer handling AI-generated,
structured advisory content instead of only deterministic process documentation. It also speaks to
the role's nice-to-haves around RAG, knowledge graphs, and LLM-powered interfaces.

**System prompt**

```text
You are an AI service assistant embedded in a transport customer portal. Generate a structured
AI-assisted response for a customer who bought a used car and needs to transfer registration.
Include the recommended service, required documents, likely forms, eligibility notes, confidence
and human-review flags, source/context references, and a Mermaid graph showing how customer intent,
vehicle, seller, buyer, identity, payment, and policy nodes relate. Use clear markdown sections,
tables, and cautious language suitable for a government service.
```

**Expected markdown sections**

- `# AI Service Finder Response`
- `## Recommended Service`
- `## Required Documents`
- `## Eligibility Notes`
- `## Source Context`
- `## Confidence and Review Flags`
- `## Context Graph`
- `## Safe Response Notes`

**Diagram content**

Use a compact Mermaid graph with short labels:

- Customer intent
- Transfer registration
- Vehicle record
- Seller details
- Buyer identity
- Payment
- Policy/rules
- Human review

**Must show**

- AI content with caution / not legal advice style wording
- confidence table
- human review trigger
- source/context references
- privacy warning about not exposing unrelated customer records

---

## Prompt Manifest Update

Replace `PROMPTS` in `apps/demo-ai-pipeline/src/prompts/index.ts` with this shape:

```ts
export const PROMPTS: Prompt[] = [
  {
    id: 'registration-renewal',
    title: 'Registration Renewal Eligibility',
    description:
      'Stream an eligibility and payment workflow for renewing vehicle registration online.',
    capabilities: ['Mermaid sequence', 'Decision table', 'OIDC/Auth', 'Payment flow'],
    systemPrompt: '...',
  },
  {
    id: 'licence-renewal',
    title: 'Driver Licence Renewal',
    description:
      'Render a licence-renewal workflow with identity checks, medical review, and approval paths.',
    capabilities: ['Mermaid flowchart', 'Status model', 'WCAG notes', 'Secure data'],
    systemPrompt: '...',
  },
  {
    id: 'change-address',
    title: 'Change of Address',
    description:
      'Document an authenticated change-of-address flow with validation, audit, and API examples.',
    capabilities: ['REST API', 'Code block', 'Mermaid sequence', 'Audit trail'],
    systemPrompt: '...',
  },
  {
    id: 'fine-payment',
    title: 'Fine Payment Flow',
    description:
      'Model an infringement lookup and payment journey with receipts, errors, and support paths.',
    capabilities: ['Mermaid sequence', 'Payment states', 'Error JSON', 'WCAG notes'],
    systemPrompt: '...',
  },
  {
    id: 'service-finder',
    title: 'AI Service Finder',
    description:
      'Render an AI-assisted service recommendation with forms, source context, and review flags.',
    capabilities: ['AI/RAG', 'Knowledge graph', 'Markdown table', 'Human review'],
    systemPrompt: '...',
  },
];
```

---

## Fixture File Update

Create or replace these fixture files:

- [x] `apps/demo-ai-pipeline/src/fixtures/registration-renewal.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/licence-renewal.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/change-address.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/fine-payment.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/service-finder-used-vehicle-transfer.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/service-finder-fine-payment.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/service-finder-change-address.fixture.json`

Remove or stop referencing:

- [x] `apps/demo-ai-pipeline/src/fixtures/workflow.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/state-mgmt.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/deep-merge.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/rest-api.fixture.json`
- [x] `apps/demo-ai-pipeline/src/fixtures/renewal.fixture.json`

---

## Implementation Tasks

- [x] Update prompt IDs and labels in `apps/demo-ai-pipeline/src/prompts/index.ts`
- [x] Confirm server fixture lookup supports hyphenated IDs
- [x] Generate the five new markdown fixture contents
- [x] Split each fixture into chunks using the existing fixture format
- [x] Ensure each fixture includes at least one table
- [x] Ensure at least two fixtures include JSON or TypeScript-highlighted code blocks
- [x] Update any tests that assert old prompt titles or fixture IDs
- [x] Run `pnpm typecheck`
- [x] Run the relevant demo tests
- [-] Ensure all diagrams render without clipped labels — manual polish; no known blockers in fixture set
- [-] Browser smoke all five prompt cards — manual QA; automated Vitest/Playwright coverage exists
- [x] Run `graphify update .`

---

## Acceptance Criteria

- All five visible prompt cards are TMR-specific.
- The generic React/state/deep-merge/task fixtures are no longer part of the primary demo.
- Every fixture demonstrates a role requirement from the TMR description.
- Mermaid diagrams are legible in the rendered view at desktop width.
- Raw markdown mode still shows complete fixture markdown.
- Metrics still appear after each fixture completes.
- No fixture requires external API cost in default fixture mode.
- The demo can be explained in one sentence:

```text
This is a streamed AI markdown renderer for transport-service workflows, showing accessible,
secure rendering of diagrams, tables, API contracts, and AI-generated service guidance.
```
