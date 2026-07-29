# PAO COMPANION — Memory System

Version: 1.0

Status: AI Architecture

Last Updated: 2026-07-29

---

# Introduction

The Memory System defines how PAO stores, retrieves, updates, and manages user knowledge across conversations.

Unlike chat history, memory contains structured knowledge that improves future interactions.

The purpose of the Memory System is not to remember everything.

Its purpose is to remember what matters.

---

# Philosophy

Conversation is temporary.

Timeline records what happened.

Memory preserves what should be understood.

The Memory System converts interactions into reusable knowledge that allows companions to become increasingly personal over time.

---

# Responsibilities

The Memory System is responsible for:

- extracting memory candidates
- classifying memories
- storing validated memories
- retrieving relevant memories
- updating existing memories
- removing obsolete memories
- exposing memories to the Prompt System

The Memory System never generates responses.

---

# Memory Architecture

```
              Conversation

                    │

                    ▼

             Timeline Engine

                    │

                    ▼

            Memory Extraction

                    │

                    ▼

            Memory Classification

                    │

                    ▼

              Memory Store

                    │

                    ▼

            Memory Retrieval

                    │

                    ▼

              Prompt System
```

---

# Memory Lifecycle

Every memory follows the same lifecycle.

```
Candidate

↓

Validation

↓

Classification

↓

Storage

↓

Retrieval

↓

Update

↓

Archive / Delete
```

---

# Memory Categories

The Memory System organizes knowledge into several categories.

---

## Identity Memory

Stable information describing the user.

Examples

- preferred name
- occupation
- hometown
- education

Purpose

Provide long-term personal context.

---

## Preference Memory

Stores user preferences.

Examples

- favorite food
- preferred communication style
- favorite music
- preferred response length

Purpose

Personalize interactions.

---

## Relationship Memory

Stores facts that influence the relationship.

Examples

- anniversary
- promises
- shared jokes
- recurring routines

Purpose

Maintain relationship continuity.

---

## Episodic Memory

Stores meaningful experiences.

Examples

- first job
- graduation
- vacation
- family events

Purpose

Remember important life moments.

---

## Goal Memory

Stores user goals.

Examples

- losing weight
- learning Japanese
- building a startup

Purpose

Support long-term coaching and encouragement.

---

## Context Memory

Stores temporary information that may remain useful for a limited time.

Examples

- upcoming interview
- current project
- exam next week

Purpose

Improve near-term conversations.

---

# Memory Extraction

The Memory System analyzes conversation outcomes and identifies potential memories.

Example

User

"I adopted a golden retriever yesterday."

Candidate

```
Category:
Episodic

Fact:
User adopted a dog.
```

Not every sentence becomes memory.

---

# Memory Validation

Every candidate is evaluated before storage.

Questions

- Is it relevant?
- Is it likely to remain useful?
- Does it improve future conversations?
- Is it already stored?
- Does it conflict with existing knowledge?

Only validated memories become persistent.

---

# Memory Confidence

Each memory has a confidence score.

Example

```
Memory

User prefers tea.

Confidence

92%
```

Confidence changes over time as new evidence is collected.

---

# Memory Updates

Memories are not immutable.

Example

Old memory

```
Preferred beverage

Coffee
```

New information

```
User switched to tea.
```

Result

The memory is updated rather than duplicated.

---

# Memory Retrieval

When a conversation begins, the Memory System retrieves only relevant knowledge.

```
User Message

↓

Intent Analysis

↓

Memory Search

↓

Ranking

↓

Selected Memories

↓

Prompt System
```

---

# Memory Ranking

Retrieved memories are ranked using:

- relevance
- recency
- confidence
- importance

Only the highest-value memories are returned.

---

# Memory Storage

The Memory Store contains structured knowledge instead of raw conversations.

Examples

- preferences
- goals
- important facts
- recurring behaviors

Conversation history remains outside the Memory Store.

---

# Relationship With Other Components

## Timeline Engine

Timeline records events.

Memory extracts meaningful knowledge from those events.

---

## Relationship Engine

Relationship Engine consumes memories that affect emotional progression.

---

## Prompt System

Prompt System receives only the memories required for the current interaction.

---

## Conversation Engine

Conversation Engine never accesses storage directly.

It requests memories through the Memory System.

---

# User Control

Users remain the owners of their memories.

Capabilities include:

- view memories
- edit memories
- delete memories
- disable memory
- export memory

Transparency is a core design principle.

---

# Privacy Principles

The Memory System must:

- store only necessary information
- avoid unnecessary personal data
- support user deletion
- prevent fabricated memories
- maintain auditability

---

# Future Expansion

Future versions may introduce:

- semantic retrieval
- vector search
- memory reflection
- automatic memory summarization
- cross-device synchronization

---

# Design Principles

The Memory System must:

- remember only valuable information
- remain explainable
- avoid duplicate memories
- support efficient retrieval
- minimize prompt size

---

# Final Statement

The Memory System transforms conversations into knowledge.

Timeline remembers the journey.

Memory remembers what is meaningful.

Together they allow PAO to build long-term, personalized companion experiences without relying on complete chat history.