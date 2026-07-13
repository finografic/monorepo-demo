# AWS Deployments Extension

Helps you **architect, cost, and deploy** apps to AWS from Cursor — plus generate architecture diagrams.

### Skills (auto or `/`)

| Skill                          | When it kicks in                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| **`deploy`**                   | “deploy to AWS”, “estimate AWS cost”, “generate infrastructure”, architecture questions |
| **`aws-architecture-diagram`** | Draw.io diagrams from a codebase or from scratch (AWS4 icons)                           |
| **`elastic-beanstalk`**        | Elastic Beanstalk / managed EC2 / Heroku-style hosting                                  |

Invoke with `/deploy`, `/aws-architecture-diagram`, or `/elastic-beanstalk`, or just ask in natural language.

### MCP servers (live AWS data)

| Server           | Role                                |
| ---------------- | ----------------------------------- |
| **awsknowledge** | Docs, regions, service guidance     |
| **awspricing**   | Real-time cost estimates            |
| **awsiac**       | CDK / CloudFormation best practices |

These power the skills with current docs and pricing — not your local serverless MCP (SAM/Lambda), which stays separate.

### Hooks

A **PostToolUse** hook runs automatically after tool calls (guardrails / follow-up checks — no manual step).

### Typical flow

1. Ask to deploy or estimate cost → **`deploy`** skill

2. Agent analyzes the repo → recommends services via **awsknowledge**

3. Cost via **awspricing** → IaC via **awsiac**

4. Optionally diagram with **`aws-architecture-diagram`**

### Auth status

No `STATUS.md` on `awsiac` / `awsknowledge` / `awspricing` — they look ready (tools already present). No extra MCP login step right now.

Your existing **`awslabs.aws-serverless-mcp`** in `.cursor/mcp.json` still covers Lambda/SAM lifecycle; this plugin covers broader deploy / cost / diagram workflows.
