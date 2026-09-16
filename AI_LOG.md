# AI Development Log

## Prompt 1

The user provided the complete Round 2 multiplex pricing-engine brief and instructed the AI to inspect the workspace, build the backend and frontend end to end, add MongoDB persistence, seed data, tests, documentation, and a Git checkpoint.

### AI Response

The AI inspected the existing workspace and found only a placeholder README and the initial Git commit. It proposed a TypeScript approach initially, then after the fuller brief selected a compact Node.js/Express backend with MongoDB and a React/Vite frontend. Since the brief did not specify numeric pricing values, it selected documented configurable defaults: a ₹100 festival discount, 10% member discount capped at ₹150, ₹25 per-ticket convenience fee, and 18% GST.

### What I Implemented

The implementation created the Express/Mongoose API, integer-paise pricing service, MongoDB models, seed script, atomic transactional inventory update, React booking workflow, responsive styles, tests, README, REASONING.md, environment example, and this log. The pricing tests initially caught two incorrect expected totals; those test values were corrected to match the documented fee-before-GST rule. The backend test suite and frontend production build were then run successfully. No claims were made about live MongoDB API integration because a MongoDB service was not available during validation.
