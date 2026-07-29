# PAO COMPANION — Media Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the runtime behavior of the Media Engine.

The Media Runtime orchestrates every media generation request while preserving the canonical identity of an AI Companion.

It ensures that generated images, voices, and videos remain consistent with the Character Manifest, Relationship state, Timeline context, and platform policies regardless of the underlying AI provider.

The Media Runtime is the authoritative orchestration layer for all media generation.

---

# Runtime Principles

The Media Runtime follows these principles:

- Character Consistency First
- Provider Independent
- Identity Preservation
- Deterministic Orchestration
- Event Driven
- Version Controlled

---

# Runtime Overview

```
Media Request
      │
      ▼
API Gateway
      │
      ▼
Media Runtime
      │
      ├──────────────┬──────────────┬──────────────┐
      ▼              ▼              ▼              ▼
Character      Relationship     Timeline      Conversation
 Runtime          Runtime         Runtime        Runtime
      │              │              │              │
      └──────────────┴──────────────┴──────────────┘
                     │
                     ▼
              Media Context Builder
                     │
                     ▼
              Media Prompt Builder
                     │
                     ▼
               Provider Routing
                     │
                     ▼
              Media Provider Layer
                     │
                     ▼
             Asset Validator
                     │
                     ▼
              Media Repository
                     │
                     ▼
         Event Publisher & Return
```

---

# Runtime Components

```
Media Runtime

├── API Handler
├── Runtime Session
├── Request Validator
├── Character Context Loader
├── Relationship Context Loader
├── Timeline Context Loader
├── Conversation Context Loader
├── Media Context Builder
├── Media Prompt Builder
├── Provider Router
├── Provider Client
├── Asset Validator
├── Asset Repository
├── Cache Manager
├── Event Publisher
└── Audit Logger
```

---

# Runtime Session

Each request creates an isolated Runtime Session.

The Runtime Session contains:

- Correlation ID
- Request Metadata
- User Context
- Companion Context
- Character Snapshot
- Relationship Snapshot
- Timeline Summary
- Conversation Context
- Media Type
- Provider
- Model
- Asset Metadata
- Execution Metrics

The Runtime Session exists only during request execution.

---

# Supported Media Types

The Media Runtime supports:

- Image
- Voice
- Video

Future media types may be added without changing the runtime architecture.

---

# Media Request Flow

```
Receive Request

↓

Validate Request

↓

Load Character

↓

Load Relationship

↓

Load Timeline

↓

Load Conversation Context

↓

Build Media Context

↓

Build Media Prompt

↓

Route Provider

↓

Generate Media

↓

Validate Asset

↓

Persist Asset

↓

Publish Events

↓

Return Result
```

---

# Media Context Builder

The Media Context Builder combines information from multiple engines into a provider-independent Media Context.

The Media Context includes:

- Character Manifest
- Appearance Profile
- Voice Profile
- Relationship Stage
- Timeline Summary
- Conversation Context
- User Request
- Runtime Metadata

---

# Media Prompt Builder

The Media Prompt Builder converts the Media Context into a provider-specific generation request.

Prompt generation includes:

- appearance constraints
- clothing consistency
- facial consistency
- voice characteristics
- emotional expression
- scene description
- generation parameters

Prompt templates are version-controlled.

---

# Provider Routing

The Provider Router selects the optimal provider based on:

- media type
- provider capability
- latency
- cost policy
- provider health
- subscription tier

Business logic never depends on provider-specific implementations.

---

# Provider Invocation

The Provider Client performs:

- request translation
- authentication
- retries
- timeout handling
- response normalization

Provider adapters remain isolated behind the Media Provider Layer.

---

# Asset Validation

Every generated asset is validated before publication.

Validation includes:

- character identity consistency
- media format
- metadata integrity
- generation success
- policy compliance

Invalid assets are rejected or regenerated according to policy.

---

# Asset Persistence

The runtime persists:

- asset identifier
- provider information
- generation parameters
- model information
- storage location
- checksum
- metadata
- runtime version

Persistence is atomic.

---

# Repository Design

Persistence is separated into:

```
Media Repository

├── Asset
├── Metadata
├── Version
├── Audit
└── Storage Reference
```

---

# Cache Strategy

Cached objects include:

- Character Snapshot
- Media Profile
- Prompt Templates
- Provider Configuration

Updates invalidate affected cache entries immediately.

---

# Event Publishing

Published events include:

- ImageGenerated
- VoiceGenerated
- VideoGenerated
- MediaGenerationFailed
- MediaValidated

Events are immutable.

---

# Error Handling

Possible runtime failures include:

- validation failure
- provider timeout
- routing failure
- generation failure
- storage failure
- metadata failure

Errors are translated into standardized API responses.

---

# Security

Runtime validates:

- authentication
- authorization
- subscription access
- provider permissions
- asset ownership

Media generation must comply with platform safety policies.

---

# Performance

Recommended targets:

- Context Loading <100 ms
- Prompt Generation <30 ms
- Provider Routing <10 ms
- Asset Validation <50 ms

Overall latency depends on the selected media provider.

---

# Observability

Metrics include:

- generation requests
- generation success rate
- provider latency
- asset validation failures
- storage latency
- cache hit ratio

Every request includes a Correlation ID.

---

# Runtime Dependencies

Depends on:

- Character Runtime
- Relationship Runtime
- Timeline Runtime
- Conversation Runtime
- Media Provider Layer
- Repository
- Cache
- Event Bus

Does not depend directly on provider SDK implementations.

---

# Failure Recovery

If generation fails:

- retry according to provider policy
- select fallback provider if applicable
- preserve Runtime Session
- publish failure event

If persistence fails:

- preserve generated asset where possible
- enqueue retry
- maintain audit consistency

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
Conversation Runtime
        │
        ▼
Media Runtime
        │
        ▼
Media Provider Layer
```

The Media Runtime orchestrates media generation while relying on other runtimes for contextual information.

---

# Related Documents

- media-engine.md
- media-engine-spec.md
- media.schema.json
- ai-provider-layer.md
- character-runtime.md
- conversation-runtime.md

---

# Final Statement

The Media Runtime provides a deterministic, provider-independent execution model for generating companion media assets.

By orchestrating context loading, prompt construction, provider selection, asset validation, persistence, and event publication, the Media Runtime ensures that every generated image, voice, or video remains consistent with the companion's canonical identity, relationship state, and historical context across the PAO Companion platform.