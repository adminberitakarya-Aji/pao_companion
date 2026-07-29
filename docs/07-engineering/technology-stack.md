# PAO COMPANION — Technology Stack

Version: 1.0

Status: Engineering

Last Updated: 2026-07-29

---

# Introduction

This document defines the official technology stack used to build the PAO Companion platform.

Technology choices are guided by long-term maintainability, scalability, reliability, and provider independence.

The architecture remains technology-agnostic wherever possible.

Individual technologies may evolve over time without changing the system architecture.

---

# Engineering Principles

Technology selection follows these principles:

- Stability over hype
- Open standards over vendor lock-in
- Scalability by design
- Cloud-native architecture
- API-first development
- Infrastructure as Code
- Automation by default
- Security by default
- Observability by default

---

# High-Level Stack

| Layer | Technology |
|----------|------------------------------|
| Frontend | Next.js (React + TypeScript) |
| Mobile | Flutter |
| Backend | Go |
| API | REST + gRPC |
| AI Runtime | Go Services |
| Database | PostgreSQL |
| Cache | Redis |
| Object Storage | S3 Compatible Storage |
| Queue | NATS JetStream |
| Search | OpenSearch |
| Vector Database | pgvector (PostgreSQL) |
| Authentication | JWT + OAuth2 |
| Container | Docker |
| Orchestration | Kubernetes |
| CDN | Cloudflare |
| Reverse Proxy | Traefik |
| Infrastructure | Terraform |
| Monitoring | Prometheus + Grafana |
| Logging | Loki |
| Tracing | OpenTelemetry |
| CI/CD | GitHub Actions |

---

# Frontend

## Next.js

Responsibilities:

- Web application
- Dashboard
- Landing pages
- Authentication UI
- Subscription UI

Reasons:

- Mature ecosystem
- Excellent TypeScript support
- Server-side rendering
- SEO support
- Large community

---

# Mobile

## Flutter

Responsibilities:

- Android
- iOS

Reasons:

- Single codebase
- High performance
- Native rendering
- Excellent developer productivity

---

# Backend

## Go

Responsibilities:

- API
- Business logic
- AI orchestration
- Background workers

Reasons:

- Excellent concurrency
- Low memory usage
- Fast compilation
- Strong ecosystem
- Cloud-native

---

# Database

## PostgreSQL

Primary datastore.

Responsibilities:

- users
- companions
- relationships
- timeline
- conversations
- subscriptions

Reasons:

- ACID compliant
- Mature ecosystem
- JSON support
- Extensions
- Reliability

---

# Vector Search

## pgvector

Responsibilities:

- semantic memory
- embedding search
- hybrid retrieval

Reasons:

- Native PostgreSQL integration
- Simple deployment
- Operational simplicity

---

# Cache

## Redis

Responsibilities:

- session cache
- prompt cache
- rate limiting
- temporary state

---

# Object Storage

S3-compatible object storage.

Responsibilities:

- images
- videos
- voice
- generated assets
- backups

---

# Messaging

## NATS JetStream

Responsibilities:

- asynchronous events
- engine communication
- background jobs

Reasons:

- Lightweight
- High performance
- Cloud-native

---

# Search

## OpenSearch

Responsibilities:

- conversation search
- timeline search
- media search
- administrative search

---

# API Layer

Two communication models are used.

## REST

Used for:

- public API
- authentication
- CRUD operations

## gRPC

Used for:

- engine communication
- internal services
- high-performance APIs

---

# AI Provider Layer

The platform communicates with providers through adapters.

Supported categories:

- LLM
- Image
- Voice
- Video

Providers are interchangeable.

No business logic depends directly on provider SDKs.

---

# Infrastructure

Infrastructure is containerized.

Components include:

- Docker
- Kubernetes
- Terraform

Infrastructure should remain cloud independent.

---

# Authentication

Authentication includes:

- JWT
- OAuth2
- Refresh Tokens

Future support:

- Passkeys
- Enterprise SSO

---

# Observability

Monitoring stack:

- Prometheus
- Grafana

Logging:

- Loki

Tracing:

- OpenTelemetry

Every service should expose health checks and metrics.

---

# CI/CD

GitHub Actions performs:

- testing
- linting
- security scanning
- build
- deployment

Deployment should be fully automated.

---

# Security

Security requirements include:

- TLS everywhere
- encrypted secrets
- RBAC
- audit logs
- dependency scanning
- secret rotation

---

# Coding Standards

Development requirements:

- TypeScript strict mode
- Go formatting
- Static analysis
- Unit testing
- Integration testing

---

# Scalability Strategy

The platform scales horizontally.

Stateless services are preferred.

Background processing is asynchronous.

Media generation is queue-based.

Caching is applied where appropriate.

---

# Technology Evaluation

New technologies must satisfy:

- Production readiness
- Long-term maintenance
- Community support
- Security maturity
- Operational simplicity
- Compatibility with existing architecture

No technology should be adopted solely because it is trending.

---

# Related Documents

- backend-architecture.md
- infrastructure.md
- api-design.md
- provider-architecture.md

---

# Final Statement

The PAO Companion technology stack is intentionally conservative, modular, and cloud-native.

Every selected technology supports the long-term vision of building a scalable AI Companion platform while preserving provider independence, operational simplicity, and architectural consistency.