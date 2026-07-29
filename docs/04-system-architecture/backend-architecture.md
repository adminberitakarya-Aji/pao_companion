# PAO COMPANION — Backend Architecture

Version: 1.0

Status: System Architecture

Last Updated: 2026-07-29

---

# Introduction

This document defines the backend architecture of PAO COMPANION.

The backend coordinates all application logic, companion intelligence, persistence, and communication with external AI providers.

Its primary responsibility is orchestration.

It is not responsible for generating AI responses directly.

---

# Architecture Principles

The backend follows five core principles.

## 1. Service Owns Business Logic

Services expose APIs and implement business workflows.

---

## 2. Engine Owns Intelligence

Companion behavior is implemented inside engines.

Services never duplicate engine logic.

---

## 3. Clear Domain Ownership

Each domain owns its own data and rules.

---

## 4. Stateless Requests

HTTP services should remain stateless whenever possible.

Persistent state belongs in databases or distributed caches.

---

## 5. Asynchronous Heavy Work

Long-running tasks should execute through background workers.

---

# Backend Overview

```
                    Client Applications

                            │

                            ▼

                      API Gateway

                            │

        ┌───────────────────┼───────────────────┐
        │                   │                   │

        ▼                   ▼                   ▼

  Authentication      Companion APIs      Media APIs

        │                   │                   │

        └───────────────────┼───────────────────┘

                            ▼

                   Backend Services

        ┌──────────────────────────────────────┐
        │                                      │
        │ User Service                         │
        │ Companion Service                    │
        │ Conversation Service                 │
        │ Media Service                        │
        │ Billing Service                      │
        │ Notification Service                 │
        │                                      │
        └──────────────────────────────────────┘

                            │

                            ▼

                  Companion Engine Layer

        ┌──────────────────────────────────────┐
        │                                      │
        │ Character Engine                     │
        │ Relationship Engine                  │
        │ Timeline Engine                      │
        │ Conversation Engine                  │
        │ Media Engine                         │
        │                                      │
        └──────────────────────────────────────┘

                            │

                            ▼

                     Data & AI Layers
```

---

# Backend Services

The backend is organized around business services.

---

## API Gateway

Responsibilities

- request routing
- authentication
- authorization
- API versioning
- rate limiting
- request validation

The API Gateway never contains business logic.

---

## User Service

Responsibilities

- user registration
- authentication
- profile management
- account settings
- preferences

Primary owner

User domain.

---

## Companion Service

Responsibilities

- companion creation
- companion configuration
- companion lifecycle
- onboarding
- companion activation

Primary owner

Companion domain.

---

## Conversation Service

Responsibilities

- receive user messages
- coordinate conversation execution
- invoke Conversation Engine
- persist conversation records
- return responses

Conversation Service orchestrates interaction.

It does not generate responses itself.

---

## Media Service

Responsibilities

- image generation requests
- voice generation requests
- media retrieval
- media metadata
- media processing

Media generation may execute asynchronously.

---

## Billing Service

Responsibilities

- subscriptions
- credits
- usage accounting
- payment events

---

## Notification Service

Responsibilities

- push notifications
- scheduled reminders
- companion-initiated notifications
- system alerts

---

# Companion Engine Integration

Backend services communicate with Companion Engines.

```
Conversation Service

↓

Conversation Engine

↓

Character Engine

↓

Relationship Engine

↓

Timeline Engine
```

Each engine provides domain intelligence.

Services remain responsible for orchestration.

---

# Data Access

Each service accesses only the data required for its domain.

```
User Service

↓

User Data


Conversation Service

↓

Conversation Data


Companion Service

↓

Companion Data
```

Cross-domain access should occur through services or domain interfaces rather than direct coupling.

---

# Background Processing

Long-running operations execute outside the request lifecycle.

Examples include:

- image generation
- voice generation
- notification delivery
- timeline summarization
- memory extraction

```
Request

↓

Queue

↓

Worker

↓

Result
```

This improves responsiveness and scalability.

---

# Backend Request Lifecycle

```
Client Request

↓

API Gateway

↓

Authentication

↓

Service

↓

Companion Engine

↓

AI Architecture

↓

AI Provider Layer

↓

Response

↓

Persistence

↓

Client
```

---

# Conversation Lifecycle

```
User Message

↓

Conversation Service

↓

Conversation Engine

↓

Memory System

↓

Context Management

↓

Prompt System

↓

Model Routing

↓

AI Provider Layer

↓

Language Model

↓

Response

↓

Relationship Update

↓

Timeline Update

↓

Memory Evaluation

↓

Conversation Saved
```

---

# Companion Creation Lifecycle

```
Create Companion

↓

Character Definition

↓

Character Engine

↓

Relationship Initialization

↓

Timeline Initialization

↓

Media Generation

↓

Companion Activated
```

---

# Background Worker Architecture

Workers execute tasks independently from API requests.

Examples:

### Media Worker

Responsibilities

- image generation
- voice generation
- future video generation

---

### Memory Worker

Responsibilities

- memory extraction
- memory consolidation
- memory cleanup

---

### Notification Worker

Responsibilities

- scheduled notifications
- reminder delivery
- relationship events

---

# Data Persistence

The backend persists several categories of data.

- users
- companions
- conversations
- relationships
- timeline events
- memories
- generated media
- billing records

The storage implementation is defined in `database-design.md`.

---

# Security Responsibilities

The backend enforces:

- authentication
- authorization
- request validation
- encrypted communication
- audit logging
- secret management

No provider credentials are exposed to client applications.

---

# Scalability

The backend supports horizontal scaling.

Services should be independently deployable.

Heavy workloads should be isolated through queues and workers.

State should remain external to application instances.

---

# Observability

Every critical operation should be observable.

Monitoring should include:

- request latency
- error rate
- worker status
- AI execution time
- provider failures
- queue depth

Logs, metrics, and traces should share correlation identifiers whenever possible.

---

# Related Documents

- `system-overview.md`
- `database-design.md`
- `api-design.md`
- `infrastructure.md`

---

# Final Statement

The PAO backend is an orchestration platform.

Services coordinate workflows.

Companion Engines provide intelligence.

The AI Architecture prepares execution.

External providers supply AI capabilities.

This separation of responsibilities keeps the platform modular, scalable, maintainable, and independent of any individual AI vendor.