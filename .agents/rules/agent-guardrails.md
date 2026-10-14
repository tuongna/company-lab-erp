---
trigger: model_decision
description: Operational guardrails for Git, security, language, and safe changes. Use when creating branches, committing code, touching dependencies, or modifying core infrastructure.
---

# Agent Operational Guardrails

Guidelines and safety constraints for AI agent operations within CompanyLab ERP.

## 1. Git & Workflow Safety

- **No Direct Pushes**: Never push directly to protected branches (`main`, `master`, `staging`, `production`).
- **Branch Naming**: When creating feature branches for autonomous work, prefix with `ai-agent/<task-slug>` (e.g., `ai-agent/asset-request-workflow`, `ai-agent/legacy-sync-reconcile`).
- **Conventional Commits**: Strictly format commits as `type(scope): subject` following `AGENTS.md` conventions (e.g., `feat(asset): ...`, `fix(legacy-sync): ...`, `feat(api): ...`, `refactor(web): ...`). Keep commit messages concise (under 100 characters).

## 2. Security & Secret Protection

- **Zero Secrets in Code & Git**: Never commit, log, or output secrets, tokens, private keys, or `.env` contents.
- **Secret Isolation**: Use local `.env` files for local dev; GCP Secret Manager for cloud deployments.
- **No Destructive DB Operations**: Never execute untracked `DROP`, `TRUNCATE`, or unconditional `DELETE` statements on production/staging databases. All schema updates must pass via TypeORM migrations (`synchronize: false`).

## 3. Language & Artifact Consistency

- **User Interactions**: Communicate with the user in **Vietnamese**.
- **Code & Docs**: Write all code, comments, tests, PR descriptions, commit messages, and ADRs in **English**.
- **Clean Source Files**: Avoid hardcoded Unicode special characters or broken encodings in source code identifiers.

## 4. Quality & Testing

- **Bug Fix Protocol**: Every bug fix must include a test that reproduces the defect and fails prior to applying the fix.
- **Monorepo Integrity**: Use `pnpm --filter` and Turborepo pipeline commands (`turbo run build`, `turbo run test`, `turbo run lint`) to verify cross-package contracts and integrity.
