# PAO COMPANION — Character Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime behavior of the Character Engine.

Unlike the engine specification, which describes responsibilities and logical boundaries, this document explains how the Character Engine executes during runtime, how it processes requests, interacts with other components, and persists data.

The Character Runtime is responsible for maintaining the canonical identity of every AI Companion.

---

# Runtime Principles

The Character Runtime follows these principles:

- Single Source of Truth
- Immutable Identity
- Deterministic Execution
- Provider Independent
- Event Driven
- Version Controlled

---

# Runtime Overview

```
HTTP / gRPC Request
        │
        ▼
Companion Service
        │
        ▼
Character Engine
        │
        ├─────────────┐
        ▼             ▼
Character Store   Event Bus
        │             │
        ▼             ▼
Snapshot Cache   Other Engines
```

---

# Runtime Components

```
Character Runtime

├── API Handler
├── Request Validator
├── Character Builder
├── Identity Manager
├── Character Repository
├── Snapshot Builder
├── Cache Manager
├── Event Publisher
└── Audit Logger
```

---

# Request Flow

Character creation follows the execution flow below.

```
Client

↓

API Gateway

↓

Companion Service

↓

Validate Request

↓

Character Builder

↓

Generate Character Manifest

↓

Persist Character

↓

Create Snapshot

↓

Publish Event

↓

Return Response
```

---

# Character Creation Pipeline

## Step 1

Receive Create Companion request.

Input:

- userId
- gender
- appearance configuration
- personality configuration
- communication preferences

---

## Step 2

Validate request.

Validation includes:

- schema validation
- required fields
- ownership verification
- business rules

Invalid requests terminate immediately.

---

## Step 3

Generate Character Identifier.

```
characterId

UUID v7
```

Identity is immutable.

---

## Step 4

Create Character Manifest.

The Character Manifest contains:

- Identity
- Appearance
- Personality
- Communication Style
- Behavioral Constraints
- Media Profile
- Prompt Fragments

The Manifest is the canonical representation of the companion.

---

## Step 5

Persist Character.

Store:

- Character Record
- Character Manifest
- Version 1

Persistence must be atomic.

---

## Step 6

Generate Snapshot.

Snapshot contains:

- frequently accessed fields
- optimized runtime context
- version information

Snapshots are cacheable.

---

## Step 7

Publish Event.

Example:

```
CharacterCreated
```

Other engines subscribe to this event.

---

# Runtime Read Flow

```
Conversation Engine

↓

Character Runtime

↓

Cache Lookup

↓

Repository

↓

Snapshot

↓

Character Manifest

↓

Return Context
```

Cache should always be checked before repository access.

---

# Runtime Update Flow

Updates follow optimistic concurrency.

```
Load Version

↓

Validate

↓

Apply Changes

↓

Generate Version

↓

Persist

↓

Refresh Snapshot

↓

Publish Event
```

---

# Versioning

Every significant update creates:

- new version
- new snapshot
- audit entry

Older versions remain immutable.

---

# Character Snapshot

Snapshot example:

```
Character Snapshot

Identity

Appearance

Personality

Communication

Media Profile

Current Version
```

The snapshot is optimized for runtime consumption.

---

# Cache Strategy

Cached objects include:

- Character Snapshot
- Character Manifest

Suggested TTL:

5–15 minutes

Updates invalidate the cache immediately.

---

# Repository Design

Persistence is split into:

```
Character Repository

├── Character
├── Manifest
├── Version
└── Audit
```

Each repository has a single responsibility.

---

# Event Publishing

Published events:

- CharacterCreated
- CharacterUpdated
- CharacterVersionCreated
- CharacterArchived

Events should be immutable.

---

# Error Handling

Possible errors:

- validation failure
- duplicate request
- persistence failure
- cache failure
- version conflict

Errors are returned using standardized error responses.

---

# Security

Runtime validates:

- ownership
- authorization
- immutable identity
- audit trail

Unauthorized updates are rejected.

---

# Performance

Targets:

- Snapshot read <50 ms
- Cache hit >90%
- Character creation <300 ms
- Update <200 ms

Provider latency is excluded because the Character Runtime never communicates with AI providers.

---

# Observability

Metrics:

- character creations
- update frequency
- cache hit ratio
- version creations
- repository latency

Tracing should include a correlation ID for every request.

---

# Runtime Dependencies

Depends on:

- Companion Service
- Character Repository
- Cache
- Event Bus

Does not depend on:

- AI Provider Layer
- Conversation Engine internals
- Media Provider SDKs

---

# Failure Recovery

If cache generation fails:

- persist data
- publish event
- rebuild cache asynchronously

If event publication fails:

- persist transaction
- enqueue retry
- preserve consistency

Runtime should favor data integrity over immediate propagation.

---

# Related Documents

- character-engine.md
- character-engine-spec.md
- character.schema.json
- relationship-runtime.md

---

# Final Statement

The Character Runtime guarantees that every AI Companion has a single, immutable, and versioned identity throughout its lifecycle.

By separating request handling, manifest generation, persistence, caching, and event publication, the runtime remains deterministic, scalable, and independent of AI providers while serving as the canonical identity source for the entire PAO Companion platform.