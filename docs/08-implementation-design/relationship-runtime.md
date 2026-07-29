# PAO COMPANION — Relationship Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime behavior of the Relationship Engine.

The Relationship Runtime manages the dynamic relationship between a user and an AI Companion throughout its lifecycle.

Unlike the Character Engine, which maintains immutable identity, the Relationship Engine manages continuously evolving relationship data.

The runtime is responsible for ensuring that relationship progression remains consistent, realistic, and compliant with business rules.

---

# Runtime Principles

The Relationship Runtime follows these principles:

- Relationship Evolves Gradually
- State Driven
- Event Driven
- Deterministic Business Rules
- Version Controlled
- Provider Independent

---

# Runtime Overview

```
HTTP / gRPC Request
        │
        ▼
Conversation Service
        │
        ▼
Relationship Engine
        │
        ├─────────────┐
        ▼             ▼
Relationship Store Event Bus
        │             │
        ▼             ▼
Snapshot Cache   Other Engines
```

---

# Runtime Components

```
Relationship Runtime

├── API Handler
├── Runtime Session
├── Request Validator
├── Relationship Loader
├── State Evaluator
├── Progression Engine
├── Snapshot Builder
├── Repository
├── Cache Manager
├── Event Publisher
└── Audit Logger
```

---

# Runtime Session

Each execution creates an isolated Runtime Session.

The Runtime Session contains:

- Correlation ID
- Request Metadata
- User Context
- Companion Context
- Current Relationship Snapshot
- Validation Results
- Transaction State
- Execution Metrics

The Runtime Session exists only during request execution.

---

# Request Flow

```
Client

↓

API Gateway

↓

Conversation Service

↓

Relationship Runtime

↓

Load Snapshot

↓

Evaluate Current State

↓

Apply Relationship Rules

↓

Persist Changes

↓

Refresh Snapshot

↓

Publish Events

↓

Return Response
```

---

# Runtime Read Flow

```
Conversation Engine

↓

Relationship Runtime

↓

Cache Lookup

↓

Repository

↓

Relationship Snapshot

↓

Return State
```

Relationship information should be loaded from cache whenever possible.

---

# Runtime Update Flow

```
Load Relationship

↓

Validate Rules

↓

Evaluate State

↓

Apply Progression

↓

Generate Version

↓

Persist

↓

Refresh Cache

↓

Publish Events
```

---

# Relationship State

A relationship contains multiple runtime dimensions.

Examples include:

- Relationship Stage
- Trust
- Affection
- Emotional Stability
- Familiarity
- Shared Experiences
- Communication Frequency

Each dimension is updated independently according to business rules.

---

# Progression Engine

The Progression Engine evaluates whether relationship changes are allowed.

Example inputs:

- conversation outcome
- timeline events
- user actions
- completed milestones

Outputs:

- updated scores
- state transitions
- milestone creation
- progression events

The engine never performs arbitrary progression.

---

# Snapshot Design

Relationship Snapshot contains:

```
Relationship Snapshot

Relationship Stage

Trust

Affection

Emotional State

Recent Milestones

Current Version
```

Snapshots are optimized for fast runtime access.

---

# Repository Design

Persistence is separated into:

```
Relationship Repository

├── Relationship
├── State
├── Version
├── Milestone
└── Audit
```

Each repository has a single responsibility.

---

# Cache Strategy

Cached objects include:

- Relationship Snapshot
- Current State

Suggested TTL:

5–10 minutes

Updates immediately invalidate cached entries.

---

# Event Publishing

Published events include:

- RelationshipCreated
- RelationshipUpdated
- RelationshipStageChanged
- MilestoneUnlocked
- RelationshipVersionCreated

Events are immutable.

---

# Error Handling

Possible runtime errors include:

- validation failure
- invalid state transition
- version conflict
- persistence failure
- cache failure

Errors should return standardized responses.

---

# Security

Runtime validates:

- ownership
- authorization
- state integrity
- version integrity
- audit requirements

Unauthorized modifications are rejected.

---

# Performance

Recommended targets:

- Snapshot Read <50 ms
- Cache Hit >90%
- Relationship Update <200 ms
- State Evaluation <20 ms

Provider latency is excluded because this runtime does not communicate directly with AI providers.

---

# Observability

Metrics include:

- relationship updates
- milestone creations
- state transitions
- cache hit ratio
- repository latency

Every request includes a Correlation ID for tracing.

---

# Runtime Dependencies

Depends on:

- Character Runtime
- Timeline Runtime
- Repository
- Cache
- Event Bus

Does not depend on:

- AI Provider Layer
- Prompt System
- Media Providers

---

# Failure Recovery

If cache refresh fails:

- persist relationship
- publish event
- rebuild cache asynchronously

If event publishing fails:

- commit transaction
- enqueue retry
- maintain consistency

Relationship integrity has priority over event propagation.

---

# Integration Flow

Relationship Runtime exchanges information with:

```
Character Runtime
        │
        ▼
Relationship Runtime
        │
        ├──────────────┐
        ▼              ▼
Timeline Runtime   Conversation Runtime
```

The runtime acts as the authoritative source for relationship state.

---

# Related Documents

- relationship-engine.md
- relationship-engine-spec.md
- relationship.schema.json
- character-runtime.md
- timeline-runtime.md

---

# Final Statement

The Relationship Runtime provides a deterministic and versioned execution model for managing the evolving relationship between users and AI Companions.

By separating state evaluation, progression logic, persistence, caching, and event publication into dedicated runtime components, the Relationship Runtime ensures that relationship development remains consistent, observable, scalable, and independent of AI providers while serving as the authoritative source of relationship state across the PAO Companion platform.