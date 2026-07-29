# PAO COMPANION — Prompt Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime architecture responsible for constructing AI prompts across the PAO Companion platform.

The Prompt Runtime transforms structured runtime context into provider-ready prompt packages while preserving character consistency, relationship continuity, timeline awareness, memory relevance, and platform policies.

The Prompt Runtime owns prompt construction only.

It never owns business state.

---

# Design Principles

The Prompt Runtime follows these principles:

- Context First
- Prompt as Artifact
- Provider Independent
- Template Driven
- Version Controlled
- Deterministic
- Observable

---

# Runtime Overview

```
Conversation Runtime

        │

        ▼

Structured Context

        │

        ▼

Prompt Runtime

        │

        ├─────────────┐
        ▼             ▼

Prompt Builder   Policy Engine

        │

        ▼

Prompt Package

        │

        ▼

Provider Runtime
```

The Prompt Runtime transforms structured context into a complete Prompt Package.

---

# Responsibilities

The Prompt Runtime is responsible for:

- prompt planning
- template selection
- prompt assembly
- prompt validation
- prompt versioning
- token estimation
- provider optimization
- prompt metadata generation

The Prompt Runtime never calls AI providers directly.

---

# Runtime Components

```
Prompt Runtime

├── Prompt Planner
├── Template Registry
├── Prompt Builder
├── Policy Engine
├── Prompt Optimizer
├── Token Estimator
├── Prompt Validator
├── Prompt Repository
├── Metrics Collector
├── Audit Logger
└── Trace Manager
```

---

# Prompt Construction Flow

```
Receive Context

↓

Validate Context

↓

Select Template

↓

Plan Prompt

↓

Assemble Prompt

↓

Estimate Tokens

↓

Optimize Prompt

↓

Validate Prompt

↓

Create Prompt Package

↓

Return
```

Prompt construction is deterministic for identical inputs.

---

# Prompt Context

Prompt construction consumes structured context only.

Example:

```
Character

Relationship

Timeline Summary

Relevant Memories

Conversation History

User Message

Runtime Metadata
```

The Prompt Runtime never loads data directly from storage.

---

# Prompt Planning

The Prompt Planner determines:

- conversation objective
- emotional tone
- response style
- creativity level
- reasoning depth
- safety constraints
- output format

Planning occurs before prompt assembly.

---

# Template Registry

Templates are version-controlled.

Examples:

- chat
- image generation
- voice synthesis
- video generation
- onboarding
- summarization

Templates are provider-neutral.

---

# Prompt Builder

The Prompt Builder assembles:

```
Prompt Package

├── System Instructions
├── Character Manifest
├── Relationship Context
├── Timeline Context
├── Memory Context
├── Conversation Context
├── User Request
├── Runtime Instructions
└── Output Constraints
```

The Prompt Package is the canonical output of the Prompt Runtime.

---

# Policy Engine

The Policy Engine enforces:

- safety rules
- platform policies
- subscription restrictions
- provider capabilities
- output constraints

Policies are applied before prompt delivery.

---

# Prompt Optimization

Optimization may include:

- removing redundant context
- compressing history
- prioritizing memories
- reducing token usage
- provider-specific formatting

Optimization never changes business meaning.

---

# Token Estimation

Estimated values include:

- input tokens
- expected output tokens
- total request size

The estimate supports routing and billing decisions.

---

# Prompt Validation

Validation includes:

- required sections
- template compatibility
- context completeness
- token limits
- policy compliance

Invalid Prompt Packages are rejected.

---

# Prompt Versioning

Each Prompt Package includes:

- Prompt ID
- Template Version
- Policy Version
- Runtime Version
- Created Timestamp

Prompt generation is reproducible.

---

# Prompt Repository

Optionally stores:

- Prompt Metadata
- Template Version
- Token Estimate
- Validation Result

Sensitive prompt content should not be retained unless explicitly required for auditing or debugging.

---

# Security

The Prompt Runtime enforces:

- prompt sanitization
- injection protection
- metadata validation
- policy enforcement
- audit logging

Secrets are never embedded into prompts.

---

# Performance

Recommended targets:

- Template Selection <10 ms
- Prompt Planning <20 ms
- Prompt Assembly <20 ms
- Token Estimation <10 ms
- Validation <10 ms

---

# Observability

Metrics include:

- prompts generated
- template usage
- average prompt size
- token estimates
- validation failures
- optimization savings

Every Prompt Package includes a Correlation ID.

---

# Failure Recovery

If prompt construction fails:

- preserve runtime context
- return standardized errors
- record validation failures
- publish operational metrics

Prompt failures must not corrupt business state.

---

# Runtime Dependencies

Depends on:

- Conversation Runtime
- Character Runtime
- Relationship Runtime
- Timeline Runtime
- Memory Runtime
- Provider Runtime

The Prompt Runtime owns prompt construction only.

---

# Integration Flow

```
Conversation Runtime

↓

Context Builder

↓

Prompt Runtime

↓

Prompt Package

↓

Provider Runtime

↓

LLM
```

Business runtimes never construct provider prompts directly.

---

# Related Documents

- prompt-system.md
- conversation-runtime.md
- provider-runtime.md
- model-routing.md
- memory-system.md

---

# Final Statement

The Prompt Runtime provides a deterministic, provider-independent, and policy-driven architecture for transforming structured runtime context into AI-ready Prompt Packages.

By separating prompt planning, template management, policy enforcement, optimization, validation, and packaging from business logic, the platform ensures consistent AI behavior, efficient token utilization, and long-term maintainability while preserving the canonical identity and relationship of every AI Companion.