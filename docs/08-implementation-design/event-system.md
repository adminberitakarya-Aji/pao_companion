# PAO COMPANION — Event System Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime event system used throughout the PAO Companion platform.

The Event System enables asynchronous communication between engines and services while preserving clear ownership of business state.

Each engine owns its own data.

Changes are communicated through immutable domain events.

---

# Design Principles

The Event System follows these principles:

- Event Driven
- Loose Coupling
- Immutable Events
- Provider Independent
- Versioned Contracts
- At-Least-Once Delivery
- Idempotent Consumers

---

# Event Architecture

```
                 Event Bus
                     │
─────────────────────┼─────────────────────
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
 Character     Relationship   Timeline
    │               │             │
    └───────────────┼─────────────┘
                    ▼
            Conversation Runtime
                    │
                    ▼
              Media Runtime
```

Every runtime publishes and subscribes only to events it requires.

---

# Event Categories

Events are grouped into business domains.

```
Character Events

Relationship Events

Conversation Events

Timeline Events

Memory Events

Media Events

User Events

Subscription Events

System Events
```

Each category has its own versioned contract.

---

# Event Structure

Every event follows the same envelope.

```
Event

├── Event ID
├── Event Type
├── Event Version
├── Timestamp
├── Correlation ID
├── User ID
├── Companion ID
├── Source Engine
├── Payload
└── Metadata
```

The payload contains only information required by consumers.

---

# Event Lifecycle

```
Business Action

↓

Validate

↓

Persist State

↓

Commit Transaction

↓

Publish Event

↓

Subscribers Consume

↓

Subscribers Update Their State
```

Events are published only after successful persistence.

---

# Event Ownership

Each engine publishes events for its own domain.

Character Runtime

publishes:

- CharacterCreated
- CharacterUpdated
- CharacterArchived

Relationship Runtime

publishes:

- RelationshipUpdated
- RelationshipStageChanged
- MilestoneUnlocked

Timeline Runtime

publishes:

- TimelineUpdated
- SummaryGenerated

Conversation Runtime

publishes:

- ConversationStarted
- ConversationCompleted
- ConversationFailed

Media Runtime

publishes:

- ImageGenerated
- VoiceGenerated
- VideoGenerated

No runtime publishes events for another runtime.

---

# Event Consumption

Consumers subscribe only to events they require.

Example:

```
ConversationCompleted

        │

        ├────────► Relationship Runtime

        ├────────► Timeline Runtime

        └────────► Memory Runtime
```

This minimizes unnecessary dependencies.

---

# Event Versioning

Every event includes:

- major version
- minor version

Breaking changes require a new major version.

Older consumers remain supported during migration.

---

# Event Delivery

Recommended guarantees:

- At Least Once Delivery

Consumers must therefore be idempotent.

Duplicate events should not produce duplicate state changes.

---

# Event Ordering

Ordering is guaranteed only within the same aggregate.

Examples:

Character

Relationship

Conversation

Timeline

Cross-domain ordering should never be assumed.

---

# Retry Strategy

If delivery fails:

```
Retry 1

↓

Retry 2

↓

Retry 3

↓

Dead Letter Queue
```

Retries use exponential backoff.

---

# Dead Letter Queue

Events that repeatedly fail are moved to the DLQ.

Operations may:

- inspect
- replay
- archive
- discard

DLQ metrics should be monitored continuously.

---

# Event Replay

Replay supports:

- rebuilding projections
- restoring caches
- analytics
- debugging

Replay never modifies original events.

---

# Event Filtering

Subscribers may filter by:

- event type
- source engine
- companion
- user
- timestamp

Filtering reduces unnecessary processing.

---

# Event Security

Events must never expose:

- provider secrets
- authentication credentials
- internal tokens
- sensitive user information

Sensitive payloads should be encrypted where required.

---

# Observability

Metrics include:

- events published
- events consumed
- retry count
- DLQ size
- processing latency
- consumer failures

Every event includes a Correlation ID.

---

# Failure Recovery

If publishing fails:

- preserve committed business data
- retry publication
- record audit event

If consumption fails:

- retry
- preserve ordering within aggregate
- send to DLQ if retries are exhausted

Business consistency has priority over immediate propagation.

---

# Runtime Dependencies

The Event System is used by:

- Character Runtime
- Relationship Runtime
- Timeline Runtime
- Conversation Runtime
- Media Runtime
- Future services

It is infrastructure and does not own business state.

---

# Related Documents

- character-runtime.md
- relationship-runtime.md
- timeline-runtime.md
- conversation-runtime.md
- media-runtime.md

---

# Final Statement

The Event System provides the backbone for communication across the PAO Companion platform.

By using immutable, versioned, and loosely coupled domain events, the platform enables scalable, resilient, and independently deployable engines while preserving clear ownership of business state.