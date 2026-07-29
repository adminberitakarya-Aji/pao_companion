# PAO COMPANION — Development Guide

Version: 1.0

Status: Engineering

Last Updated: 2026-07-29

---

# Introduction

This document defines the official engineering workflow for developing the PAO Companion platform.

Its purpose is to ensure that every contributor follows the same engineering standards, development process, coding practices, and architectural principles.

This document is the engineering playbook for the project.

---

# Development Principles

Every contributor should follow these principles.

- Architecture First
- Domain Driven Design
- API First
- Provider Independence
- Simplicity Before Cleverness
- Security By Default
- Test Before Merge
- Documentation As Code

---

# Repository Structure

Developers must follow the official repository structure.

Do not introduce new top-level directories without architectural approval.

Business logic belongs inside the appropriate engine.

Shared utilities belong inside shared modules.

---

# Local Development Workflow

```
Clone Repository

↓

Install Dependencies

↓

Configure Environment

↓

Run Database

↓

Run Backend

↓

Run Frontend

↓

Run Tests

↓

Start Development
```

Every developer should be able to start the complete platform using documented commands.

---

# Branch Strategy

The project follows a simplified Git workflow.

```
main
│
├── develop
│
├── feature/*
│
├── fix/*
│
├── release/*
│
└── hotfix/*
```

Rules:

- Never commit directly to `main`.
- Every change must be submitted through a Pull Request.
- Every Pull Request requires review before merging.
- Squash merge is preferred to keep history clean.

---

# Commit Convention

Use Conventional Commits.

Examples:

```
feat: add relationship progression rules

fix: prevent duplicate timeline events

docs: update memory architecture

refactor: simplify provider adapter

test: add conversation engine tests

chore: update dependencies
```

---

# Coding Standards

General rules:

- Keep functions small and focused.
- Prefer composition over inheritance.
- Avoid global mutable state.
- Write deterministic business logic.
- Handle errors explicitly.
- Never ignore returned errors.

Code should be easy to read before being clever.

---

# Project Architecture Rules

Developers must respect engine boundaries.

Allowed communication:

```
Character Engine
        │
Relationship Engine
        │
Timeline Engine
        │
Conversation Engine
        │
Media Engine
```

Cross-engine access must occur through public interfaces.

Direct database access across engine boundaries is prohibited.

---

# Dependency Rules

Business logic must not depend directly on:

- AI providers
- cloud providers
- storage providers
- external SDK implementations

All integrations must pass through abstraction layers.

---

# Configuration Management

Configuration should be provided through environment variables.

Examples:

- database
- cache
- provider keys
- storage
- authentication
- feature flags

Secrets must never be committed to the repository.

---

# Error Handling

Errors should:

- be explicit
- contain context
- support tracing
- avoid leaking sensitive information

User-facing messages should differ from internal logs.

---

# Logging

Logging requirements:

- structured logging
- correlation IDs
- request IDs
- service names
- log levels

Sensitive information must never appear in logs.

---

# Testing Strategy

Every feature should include appropriate tests.

Recommended layers:

- Unit Tests
- Integration Tests
- API Tests
- End-to-End Tests

Critical business logic should have high test coverage.

---

# Code Review

Every Pull Request should verify:

- architecture compliance
- coding standards
- test coverage
- documentation updates
- security considerations
- performance impact

Reviews should improve code quality rather than block progress.

---

# Documentation

Documentation is part of the product.

Every architectural change should update:

- documentation
- schemas
- engine specifications
- API documentation

Documentation should never become outdated.

---

# Performance

Performance guidelines:

- avoid unnecessary allocations
- cache expensive operations
- prefer asynchronous workflows
- minimize network calls

Measure before optimizing.

---

# Security

Security requirements:

- validate all inputs
- enforce authorization
- sanitize external data
- rotate secrets
- protect personal data

Security reviews are required for authentication, billing, and AI provider integrations.

---

# Observability

Every service should expose:

- health endpoint
- readiness endpoint
- metrics endpoint
- tracing support

Production debugging should not rely solely on logs.

---

# Release Checklist

Before release:

- tests pass
- documentation updated
- migrations verified
- API compatibility checked
- security scan completed
- performance regression checked

---

# Engineering Culture

Engineers are expected to:

- write maintainable code
- respect architecture
- automate repetitive work
- communicate design decisions
- continuously improve documentation

The goal is long-term sustainability rather than short-term speed.

---

# Related Documents

- technology-stack.md
- backend-architecture.md
- api-design.md
- testing-strategy.md
- deployment.md

---

# Final Statement

The Development Guide defines how software is built within PAO Companion.

By following consistent engineering practices, architectural boundaries, and disciplined development workflows, contributors can build a platform that remains maintainable, scalable, and reliable as the project grows.