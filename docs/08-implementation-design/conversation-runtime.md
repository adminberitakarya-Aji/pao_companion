# PAO COMPANION — Conversation Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime execution model of the Conversation Engine.

The Conversation Runtime orchestrates all runtime interactions between users and AI Companions.

It gathers contextual information from multiple engines, builds the runtime prompt, selects the appropriate AI provider, validates responses, updates platform state, and returns the final response.

The Conversation Runtime is the central orchestration layer of PAO Companion.

---

# Runtime Principles

The Conversation Runtime follows these principles:

- Context First
- Character First
- Relationship Aware
- Timeline Aware
- Provider Independent
- Deterministic Orchestration
- Event Driven

---

# Runtime Overview

```
User Message
      │
      ▼
API Gateway
      │
      ▼
Conversation Runtime
      │
      ├───────────────┬────────────────┬────────────────┐
      ▼               ▼                ▼                ▼
Character       Relationship      Timeline        Memory
Runtime            Runtime          Runtime        Runtime
      │               │                │                │
      └───────────────┴────────────────┴────────────────┘
                          │
                          ▼
                  Context Builder
                          │
                          ▼
                   Prompt Builder
                          │
                          ▼
                   Model Routing
                          │
                          ▼
                    AI Provider
                          │
                          ▼
                 Response Validator
                          │
                          ▼
              Conversation Repository
                          │
                          ▼
             Event Publisher & Return
```

---

# Runtime Components

```
Conversation Runtime

├── API Handler
├── Runtime Session
├── Request Validator
├── Character Context Loader
├── Relationship Context Loader
├── Timeline Context Loader
├── Memory Context Loader
├── Context Builder
├── Prompt Builder
├── Model Router
├── Provider Client
├── Response Validator
├── Conversation Repository
├── Event Publisher
└── Audit Logger
```

---

# Runtime Session

Each conversation creates an isolated Runtime Session.

The Runtime Session contains:

- Correlation ID
- Conversation ID
- User Context
- Companion Context
- Character Snapshot
- Relationship Snapshot
- Timeline Summary
- Memory Context
- Prompt Metadata
- Selected Provider
- Selected Model
- Token Usage
- Execution Metrics

The Runtime Session exists only for the lifetime of the request.

---

# Conversation Flow

```
Receive Message

↓

Validate Request

↓

Load Character

↓

Load Relationship

↓

Load Timeline

↓

Load Memory

↓

Build Context

↓

Build Prompt

↓

Route Model

↓

Call AI Provider

↓

Validate Response

↓

Persist Conversation

↓

Publish Events

↓

Return Response
```

---

# Context Loading

The runtime loads contextual information in the following order:

1. Character Snapshot
2. Relationship Snapshot
3. Timeline Summary
4. Memory Context

Each loader should use cached snapshots whenever available.

---

# Context Builder

The Context Builder merges runtime information into a unified Conversation Context.

The Conversation Context includes:

- Companion identity
- Personality
- Communication style
- Relationship state
- Recent timeline
- Relevant memories
- User preferences
- Runtime metadata

The Conversation Context is provider-independent.

---

# Prompt Builder

The Prompt Builder transforms the Conversation Context into a provider-neutral Prompt Package.

A Prompt Package contains:

- System Prompt
- Character Manifest
- Relationship Context
- Timeline Context
- Memory Context
- User Message
- Runtime Instructions

Prompt templates are versioned and managed by the Prompt System.

---

# Model Routing

The Model Router selects the optimal provider and model based on:

- request type
- latency policy
- cost policy
- provider health
- feature requirements
- user subscription tier

Business logic never depends on a specific provider.

---

# Provider Invocation

The Provider Client performs:

- request translation
- authentication
- retries
- timeout handling
- response normalization

Provider-specific implementations remain isolated behind adapters.

---

# Response Validation

Every response is validated before being returned.

Validation includes:

- character consistency
- relationship consistency
- policy compliance
- response completeness
- output normalization

Responses failing validation may be regenerated or rejected.

---

# Conversation Persistence

After validation, the runtime persists:

- conversation record
- provider metadata
- token usage
- latency
- model information
- runtime version

Persistence is atomic.

---

# Event Publishing

Published events include:

- ConversationStarted
- ConversationCompleted
- ConversationFailed
- ProviderSelected
- ResponseValidated

Events are immutable.

---

# Cache Strategy

Frequently accessed objects include:

- Character Snapshot
- Relationship Snapshot
- Timeline Summary
- Memory Context
- Prompt Template

Cache invalidation follows engine-specific policies.

---

# Error Handling

Possible runtime failures include:

- validation failure
- provider timeout
- routing failure
- prompt generation failure
- persistence failure

Errors are translated into standardized API responses.

---

# Security

Runtime validates:

- authentication
- authorization
- subscription access
- provider permissions
- audit requirements

Sensitive information must never be exposed to AI providers unless explicitly required.

---

# Performance

Recommended targets:

- Context Loading <100 ms
- Prompt Generation <30 ms
- Model Routing <10 ms
- Response Validation <20 ms

Overall latency depends on AI provider response time.

---

# Observability

Metrics include:

- conversation count
- provider latency
- model selection
- validation failures
- token usage
- cache hit ratio
- response time

Every request includes a Correlation ID for distributed tracing.

---

# Runtime Dependencies

Depends on:

- Character Runtime
- Relationship Runtime
- Timeline Runtime
- Memory Runtime
- Prompt System
- Model Routing
- AI Provider Layer
- Repository
- Cache
- Event Bus

Does not depend directly on provider SDK implementations.

---

# Failure Recovery

If a provider becomes unavailable:

- retry according to policy
- select fallback provider
- preserve Runtime Session
- record failure event

If persistence fails:

- do not lose validated responses
- enqueue retry where appropriate
- preserve audit information

---

# Integration Flow

```
Character Runtime
         │
         ▼
Relationship Runtime
         │
         ▼
Timeline Runtime
         │
         ▼
Memory Runtime
         │
         ▼
Conversation Runtime
         │
         ▼
AI Provider Layer
```

Conversation Runtime orchestrates the execution but never owns the state managed by other engines.

---

# Related Documents

- conversation-engine.md
- conversation-engine-spec.md
- conversation.schema.json
- prompt-system.md
- model-routing.md
- memory-runtime.md

---

# Final Statement

The Conversation Runtime is the orchestration core of PAO Companion.

By coordinating context loading, prompt construction, provider selection, response validation, persistence, and event publication through a deterministic runtime pipeline, it delivers conversations that are consistent, context-aware, provider-independent, and aligned with the evolving relationship between users and their AI Companions.