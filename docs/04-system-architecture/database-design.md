# PAO COMPANION — Database Design

Version: 1.0

Status: System Architecture

Last Updated: 2026-07-29

---

# Introduction

This document defines the logical database design for PAO COMPANION.

The database is responsible for storing persistent business data, companion state, conversations, memories, generated media, and operational metadata.

The database design is domain-driven and provider-independent.

Technology-specific implementation details are documented separately in the Engineering documentation.

---

# Design Philosophy

The database models the PAO domain.

It does not model:

- user interface
- AI providers
- HTTP requests
- external APIs

Every table represents a business entity with a clearly defined responsibility.

---

# Design Principles

The database follows these principles:

- domain-driven design
- normalization where appropriate
- provider independence
- immutable event history
- auditability
- scalability
- data ownership

---

# High-Level Domain Model

```
                     User
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼

   Companion    Subscription   Notification

        │
        │
        ▼

 Relationship

        │
        │
        ▼

 Conversation
        │
        │
        ▼

 Conversation Message

        │
        ├──────────────┐
        │              │
        ▼              ▼

 Timeline Event    Memory

        │
        ▼

 Generated Media
```

---

# Core Domains

The database is organized into logical domains.

- Identity
- Companion
- Conversation
- Relationship
- Timeline
- Memory
- Media
- Billing
- System

Each domain owns its own entities.

---

# Identity Domain

## User

Represents a registered platform user.

Responsibilities:

- authentication reference
- profile
- preferences
- account status

Relationships:

- one user
- many companions
- many conversations
- one subscription

---

# Companion Domain

## Companion

Represents an AI companion.

Stores:

- identity
- appearance
- personality
- configuration
- lifecycle state

A user may own multiple companions.

---

# Relationship Domain

## Relationship

Represents the evolving relationship between one user and one companion.

Stores:

- relationship stage
- trust level
- affection
- intimacy
- interaction statistics
- relationship milestones

Relationship state changes over time.

---

# Conversation Domain

## Conversation

Represents one conversation session.

Stores:

- owner
- companion
- start time
- end time
- conversation state

---

## Conversation Message

Represents every exchanged message.

Stores:

- sender
- message type
- content
- timestamps
- generation metadata

Conversation history is immutable.

Messages should never be modified after creation.

---

# Timeline Domain

## Timeline Event

Represents chronological events shared between the user and companion.

Examples:

- first conversation
- birthday
- anniversary
- new job
- travel
- relationship milestone

Timeline is an event log.

Timeline is not memory.

---

# Memory Domain

## Memory

Represents structured long-term knowledge.

Examples:

- preferences
- goals
- recurring habits
- personal facts
- important life information

Memory is extracted from conversations and timeline events.

Memory may evolve over time.

---

# Media Domain

## Generated Media

Represents AI-generated assets.

Examples:

- profile image
- selfie
- voice clip
- future video

Stores:

- owner
- companion
- media type
- storage reference
- generation metadata

Binary files are stored outside the relational database.

The database stores references only.

---

# Billing Domain

## Subscription

Stores:

- active plan
- credits
- renewal information
- billing status

---

## Usage Record

Tracks AI resource consumption.

Examples:

- model
- provider
- tokens
- execution time
- estimated cost

Used for analytics and billing.

---

# Notification Domain

## Notification

Stores:

- recipient
- notification type
- schedule
- delivery status

---

# Audit Domain

## Audit Log

Records important system actions.

Examples:

- account creation
- companion creation
- subscription changes
- memory deletion
- administrative actions

Audit records are append-only.

---

# Relationships

```
User

1 ─────────── N Companion

1 ─────────── N Conversation

1 ─────────── 1 Subscription


Companion

1 ─────────── N Conversation

1 ─────────── 1 Relationship

1 ─────────── N Generated Media


Conversation

1 ─────────── N Conversation Message

1 ─────────── N Timeline Event


Timeline Event

N ─────────── N Memory
```

---

# Data Ownership

Each domain owns its own data.

Examples:

User Domain

Owns:

- profile
- preferences

Relationship Domain

Owns:

- trust
- affection
- milestones

Memory Domain

Owns:

- long-term knowledge

No domain should directly modify another domain's internal state.

Cross-domain updates occur through application services.

---

# Storage Strategy

The platform uses multiple storage types.

## Relational Database

Stores:

- transactional data
- relationships
- configuration

---

## Cache

Stores:

- sessions
- temporary context
- frequently accessed data

---

## Object Storage

Stores:

- images
- voice
- videos
- attachments

Only storage references are persisted in the relational database.

---

## Vector Database (Future)

May store:

- semantic memories
- embeddings
- similarity search indexes

The vector database complements, but does not replace, the relational database.

---

# Data Lifecycle

Every entity follows a lifecycle.

```
Create

↓

Read

↓

Update

↓

Archive

↓

Delete
```

Some entities, such as conversation messages and audit logs, are immutable after creation.

---

# Data Integrity

The database should enforce:

- primary keys
- foreign keys
- uniqueness
- referential integrity
- optimistic concurrency where appropriate

Application logic should not replace database integrity rules.

---

# Privacy

The database should support:

- user data export
- user data deletion
- configurable retention
- encrypted sensitive data
- least-privilege access

Users remain the owners of their data.

---

# Scalability

The design supports:

- horizontal application scaling
- read replicas
- background processing
- partitioning for large tables
- object storage for media

Future scaling strategies should not require redesigning the domain model.

---

# Related Documents

- system-overview.md
- backend-architecture.md
- api-design.md
- infrastructure.md

---

# Final Statement

The PAO database is a domain model, not an implementation model.

Its purpose is to preserve the state of users, companions, relationships, conversations, memories, and media in a provider-independent manner.

By separating business entities from AI provider details, the platform remains maintainable, scalable, and adaptable as AI technology evolves.