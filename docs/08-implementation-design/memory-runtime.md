# PAO COMPANION — Memory Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime architecture responsible for long-term memory management within the PAO Companion platform.

The Memory Runtime extracts, evaluates, stores, retrieves, updates, and retires memories that help companions maintain continuity across conversations.

Memory is structured knowledge derived from interactions.

It is not a conversation log.

---

# Design Principles

The Memory Runtime follows these principles:

- Memory is Knowledge
- Conversation is Temporary
- Importance Driven
- Retrieval First
- Immutable History
- Provider Independent
- Explainable Decisions

---

# Runtime Overview

```
Conversation Runtime

        │

        ▼

Conversation Events

        │

        ▼

Memory Runtime

        │

 ┌──────┼───────────────┐

 ▼      ▼               ▼

Extract Evaluate     Retrieve

        │

        ▼

Memory Store

        │

        ▼

Conversation Runtime
```

The Memory Runtime continuously transforms conversations into reusable knowledge.

---

# Responsibilities

The Memory Runtime is responsible for:

- memory extraction
- memory classification
- importance scoring
- confidence scoring
- duplicate detection
- memory retrieval
- memory updates
- memory retirement

The Memory Runtime never owns conversations.

---

# Runtime Components

```
Memory Runtime

├── Memory Extractor
├── Memory Classifier
├── Importance Scorer
├── Confidence Scorer
├── Duplicate Detector
├── Memory Retriever
├── Memory Updater
├── Memory Retention Manager
├── Memory Repository
├── Metrics Collector
├── Audit Logger
└── Trace Manager
```

---

# Memory Lifecycle

```
Conversation Event

↓

Extract Candidate Memory

↓

Classify

↓

Score Importance

↓

Score Confidence

↓

Duplicate Detection

↓

Store Memory

↓

Retrieve

↓

Update

↓

Retire
```

Every stage is deterministic and auditable.

---

# Memory Categories

Examples include:

- User Profile
- Preferences
- Relationships
- Personal Facts
- Goals
- Interests
- Habits
- Important Dates
- Long-term Plans
- Companion Memories

Additional categories may be introduced without changing the runtime architecture.

---

# Memory Extraction

The Memory Extractor identifies candidate memories from conversation events.

Examples:

```
"I love jazz."

↓

Preference

-------------------

"My birthday is May 8."

↓

Important Date

-------------------

"I started a new job."

↓

Life Event
```

Not every message becomes a memory.

---

# Importance Scoring

Importance may consider:

- explicit user statements
- repetition
- emotional significance
- long-term relevance
- relationship impact
- user corrections

Higher importance increases retrieval priority.

---

# Confidence Scoring

Confidence indicates how certain the platform is about a memory.

Example factors:

- direct statement
- inferred information
- repeated confirmation
- conflicting evidence

Confidence is updated over time.

---

# Duplicate Detection

Before storing a new memory:

```
Candidate Memory

↓

Search Existing

↓

Duplicate?

↓

Merge

or

Create New
```

Duplicate handling prevents memory fragmentation.

---

# Memory Retrieval

Retrieval considers:

- relevance
- importance
- confidence
- recency
- category
- relationship context
- current conversation goal

Retrieval produces a Memory Set for prompt construction.

---

# Memory Updates

Memories may be:

- reinforced
- corrected
- merged
- deprecated

Historical versions remain traceable.

---

# Memory Retirement

Memories may be retired when:

- superseded
- explicitly deleted
- expired by policy
- determined to be incorrect

Retired memories remain auditable where policy requires.

---

# Memory Repository

Each memory includes metadata such as:

- Memory ID
- Category
- Importance
- Confidence
- Source
- Version
- Created Timestamp
- Updated Timestamp

The repository stores structured knowledge rather than raw conversations.

---

# Security

The Memory Runtime enforces:

- ownership validation
- policy enforcement
- secure storage
- audit logging
- controlled retrieval

Only authorized runtimes may access memories.

---

# Performance

Recommended targets:

- Memory Extraction <30 ms
- Retrieval <50 ms
- Duplicate Detection <20 ms
- Memory Update <30 ms

---

# Observability

Metrics include:

- memories extracted
- retrieval latency
- duplicate rate
- importance distribution
- confidence distribution
- retired memories

Memory operations include Correlation IDs for tracing.

---

# Failure Recovery

If memory processing fails:

- preserve conversation events
- retry extraction asynchronously
- avoid partial updates
- publish operational events

Conversation continuity should not be interrupted by memory failures.

---

# Runtime Dependencies

Depends on:

- Conversation Runtime
- Timeline Runtime
- Prompt Runtime
- Storage System
- Event System

The Memory Runtime owns long-term knowledge only.

---

# Integration Flow

```
Conversation Runtime

↓

Conversation Event

↓

Memory Runtime

↓

Memory Store

↓

Prompt Runtime

↓

Provider Runtime
```

Memory retrieval occurs before prompt construction.

---

# Related Documents

- memory-system.md
- prompt-runtime.md
- conversation-runtime.md
- timeline-runtime.md
- storage-system.md

---

# Final Statement

The Memory Runtime provides a deterministic, explainable, and provider-independent architecture for managing long-term knowledge within the PAO Companion platform.

By separating conversations from memories and managing memory extraction, scoring, retrieval, updating, and retirement as dedicated runtime responsibilities, the platform enables companions to maintain meaningful continuity, personalization, and relationship growth across every interaction without coupling business logic to any specific AI provider.