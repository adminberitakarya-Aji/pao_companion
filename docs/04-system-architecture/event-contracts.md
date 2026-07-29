# Event Contracts

Version: 1.0

---

# Introduction

Event Contracts define the official communication protocol between runtimes within PAO Companion.

The platform follows an event-driven architecture where runtimes communicate through immutable events rather than direct dependencies.

An event represents something that has already happened.

Events are never commands.

---

# Event Philosophy

Every event must satisfy three principles.

## Immutable

Once published, an event can never be modified.

If additional information is required, publish a new event.

---

## Historical

Events represent facts.

Good examples:

```
ConversationStarted
```

```
MemoryCreated
```

```
SubscriptionRenewed
```

Bad examples:

```
CreateConversation
```

```
UpdateMemory
```

Commands belong to the application layer, not the event system.

---

## Independent

Events never expose internal runtime implementation.

Only business data may be published.

---

# Event Structure

Every event follows the same structure.

```json
{
  "eventId": "...",
  "eventType": "...",
  "eventVersion": "1.0",
  "correlationId": "...",
  "causationId": "...",
  "aggregateId": "...",
  "aggregateType": "...",
  "occurredAt": "...",
  "producedBy": "...",
  "payload": {}
}
```

---

# Event Metadata

Every event contains standard metadata.

| Field | Description |
|---------|------------|
| eventId | Unique event identifier |
| eventType | Business event name |
| eventVersion | Event schema version |
| correlationId | Request trace identifier |
| causationId | Parent event identifier |
| aggregateId | Aggregate root identifier |
| aggregateType | Aggregate type |
| occurredAt | Event timestamp |
| producedBy | Runtime that produced the event |
| payload | Business payload |

---

# Aggregate Types

Events belong to one aggregate.

Supported aggregates:

```
User

Companion

Conversation

Relationship

Memory

Timeline

Media

Wallet

Subscription

Transaction
```

---

# Event Categories

The platform defines six categories.

```
Conversation Events

Relationship Events

Memory Events

Timeline Events

Media Events

System Events
```

---

# Conversation Events

## ConversationStarted

Published when a new conversation begins.

Producer

Conversation Runtime

Consumers

- Relationship Runtime
- Timeline Runtime
- Analytics

Artifact

Conversation State

---

## ConversationCompleted

Published after the AI response is finalized.

Producer

Conversation Runtime

Consumers

- Memory Runtime
- Timeline Runtime
- Notification Runtime

Artifact

Conversation Output

---

## ConversationArchived

Published when a conversation becomes read-only.

Producer

Conversation Runtime

---

# Relationship Events

## RelationshipChanged

Published whenever relationship metrics change.

Producer

Relationship Runtime

Consumers

- Timeline Runtime
- Memory Runtime

Artifact

Relationship Snapshot

---

## RelationshipLevelUp

Published when relationship reaches a higher stage.

Examples

- Stranger
- Friend
- Close Friend
- Partner

Producer

Relationship Runtime

---

# Timeline Events

## TimelineEntryCreated

Published when an important event is recorded.

Producer

Timeline Runtime

Consumers

Memory Runtime

Artifact

Timeline Summary

---

## TimelineMilestoneReached

Examples

- First Conversation
- 100 Conversations
- One Year Together

---

# Memory Events

## MemoryCreated

Producer

Memory Runtime

Consumers

Context Runtime

Artifact

Memory Set

---

## MemoryUpdated

Producer

Memory Runtime

Consumers

Context Runtime

Artifact

Memory Set

---

## MemoryArchived

Producer

Memory Runtime

Consumers

Storage Runtime

---

## MemoryDeleted

Producer

Memory Runtime

Consumers

Audit System

---

# Character Events

## CharacterUpdated

Published when character configuration changes.

Producer

Character Runtime

Consumers

Context Runtime

Artifact

Character Manifest

---

# Context Events

## ContextBuilt

Published after runtime context is completed.

Producer

Context Runtime

Consumers

Prompt Runtime

Artifact

Runtime Context

---

# Prompt Events

## PromptGenerated

Published after prompt construction.

Producer

Prompt Runtime

Consumers

Provider Runtime

Artifact

Prompt Package

---

# Provider Events

## ProviderRequestCreated

Producer

Provider Runtime

Consumers

Monitoring

Artifact

Provider Request

---

## ProviderCompleted

Producer

Provider Runtime

Consumers

Conversation Runtime

Artifact

Provider Response

---

## ProviderFailed

Producer

Provider Runtime

Consumers

Retry Manager

Monitoring

Alerting

---

## ProviderTimeout

Producer

Provider Runtime

Consumers

Retry Manager

---

## ProviderFallbackActivated

Published when another provider is selected.

Producer

Provider Runtime

Consumers

Monitoring

---

# Media Events

## MediaGenerationStarted

Producer

Media Runtime

---

## MediaGenerated

Producer

Media Runtime

Consumers

Conversation Runtime

Notification Runtime

Artifact

Media

---

## MediaGenerationFailed

Producer

Media Runtime

---

# Wallet Events

## WalletCredited

Producer

Billing System

Consumers

Notification Runtime

---

## WalletDebited

Producer

Billing System

Consumers

Analytics

---

## CreditConsumed

Producer

Billing System

Consumers

Monitoring

---

# Subscription Events

## SubscriptionActivated

Producer

Billing System

---

## SubscriptionRenewed

Producer

Billing System

---

## SubscriptionExpired

Producer

Billing System

Consumers

Notification Runtime

---

## SubscriptionCancelled

Producer

Billing System

---

# Authentication Events

## UserRegistered

Producer

Authentication Flow

---

## UserLoggedIn

Producer

Authentication Flow

---

## UserLoggedOut

Producer

Authentication Flow

---

## UserDeleted

Producer

Authentication Flow

---

# Notification Events

## NotificationQueued

Producer

Notification Runtime

---

## NotificationDelivered

Producer

Notification Runtime

---

## NotificationFailed

Producer

Notification Runtime

---

# System Events

## RuntimeStarted

Published whenever a runtime starts.

---

## RuntimeStopped

Published whenever a runtime stops.

---

## RuntimeHealthChanged

Published when runtime health changes.

---

## RuntimeRecovered

Published after recovery.

---

# Event Flow

```
User Message

↓

ConversationStarted

↓

RelationshipChanged

↓

TimelineEntryCreated

↓

MemoryCreated

↓

ContextBuilt

↓

PromptGenerated

↓

ProviderCompleted

↓

ConversationCompleted
```

---

# Event Ordering

Events should be published in chronological order.

Ordering is guaranteed only within the same aggregate.

Cross-aggregate ordering must not be assumed.

---

# Event Versioning

Every event contains

```
eventVersion
```

Breaking changes require a new version.

Consumers should support backward compatibility whenever possible.

---

# Event Delivery

The platform targets at-least-once delivery.

Consumers must therefore be idempotent.

Duplicate events must not produce duplicate business effects.

---

# Event Retention

Events are historical records.

They should not be modified or deleted except under explicit data retention policies or legal requirements.

---

# Event Naming Convention

Use the format:

```
<Entity><PastTenseVerb>
```

Examples

```
ConversationStarted

MemoryCreated

WalletCredited

ProviderCompleted
```

Avoid:

```
DoConversation

RunProvider

CreateMemory

UpdateRelationship
```

---

# Event Validation

Before publishing, every event must pass validation.

Validation includes:

- Schema validation
- Aggregate validation
- Payload validation
- Version validation
- Correlation validation

Invalid events must never be published.

---

# Event Observability

Every published event should be traceable through:

- Event ID
- Correlation ID
- Causation ID
- Runtime Name
- Timestamp

This enables complete request tracing across the platform.

---

# Event Contract Rules

Every event must:

- Represent a completed business fact.
- Be immutable.
- Be versioned.
- Be serializable.
- Include standard metadata.
- Reference the appropriate aggregate.
- Be independent of provider implementations.

Events must never:

- Contain runtime objects.
- Contain provider SDK objects.
- Expose secrets.
- Represent commands.
- Be modified after publication.

---

# Final Statement

Event Contracts provide the standardized communication layer for PAO Companion's event-driven architecture.

Together with Runtime Artifacts, they establish a stable, observable, and provider-independent execution model where each runtime operates autonomously while remaining loosely coupled through immutable business events.