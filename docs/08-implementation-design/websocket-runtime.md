# PAO COMPANION — WebSocket Runtime Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the realtime communication architecture of the PAO Companion platform.

The WebSocket Runtime provides persistent bidirectional communication between clients and the platform, enabling low-latency updates for conversations, media generation, notifications, and companion state.

The WebSocket Runtime is responsible for realtime delivery only.

It does not implement business logic.

---

# Design Principles

The WebSocket Runtime follows these principles:

- Persistent Connections
- Event Driven
- Stateless Processing
- Runtime Independent
- Horizontal Scalability
- Secure by Default
- Provider Independent

---

# Runtime Overview

```
                 Client

                   │

        Persistent Connection

                   │

                   ▼

          WebSocket Gateway

                   │

                   ▼

          WebSocket Runtime

                   │

        ┌──────────┼──────────┐

        ▼          ▼          ▼

   Event Bus     Queue     API Runtime

                   │

                   ▼

              Business Runtime
```

The WebSocket Runtime subscribes to platform events and delivers realtime updates to connected clients.

---

# Responsibilities

The WebSocket Runtime is responsible for:

- Connection lifecycle
- Authentication
- Session registration
- Channel subscription
- Event delivery
- Streaming responses
- Presence tracking
- Heartbeat management

The WebSocket Runtime never owns business state.

---

# Runtime Components

```
WebSocket Runtime

├── Connection Manager
├── Authentication Adapter
├── Session Registry
├── Channel Manager
├── Subscription Manager
├── Event Subscriber
├── Stream Dispatcher
├── Presence Manager
├── Heartbeat Manager
├── Metrics Collector
├── Audit Logger
└── Trace Manager
```

---

# Connection Lifecycle

```
Client Connect

↓

Authenticate

↓

Create Session

↓

Register Connection

↓

Subscribe Channels

↓

Receive Events

↓

Disconnect

↓

Cleanup Session
```

Connections remain active until closed by the client or server.

---

# Authentication

Authentication occurs during the connection handshake.

Validation includes:

- access token
- session validity
- companion ownership
- subscription eligibility

Unauthenticated connections are rejected.

---

# Session Registry

Each active connection stores:

- Connection ID
- Session ID
- User ID
- Companion ID
- Device Information
- Connected At
- Last Heartbeat
- Active Channels

The registry is optimized for fast lookup and cleanup.

---

# Channel Model

Clients subscribe to logical channels.

Examples:

```
conversation

media

relationship

timeline

notification

billing

system
```

A connection may subscribe to multiple channels.

---

# Event Delivery

The WebSocket Runtime receives events from the Event Bus.

Example:

```
ConversationCompleted

↓

Event Bus

↓

WebSocket Runtime

↓

Connected Client
```

Delivery is push-based.

---

# Streaming Responses

Conversation responses may be streamed incrementally.

Example:

```
Conversation Runtime

↓

LLM Streaming

↓

WebSocket Runtime

↓

Client

↓

Render Incrementally
```

Streaming improves perceived responsiveness.

---

# Media Progress Updates

Long-running media tasks publish progress events.

Example:

```
GenerateImage

↓

Media Queue

↓

Worker

↓

Progress Event

↓

WebSocket Runtime

↓

Client
```

Progress updates may include percentages or stage changes.

---

# Presence Management

Presence tracks connection state.

Possible states:

- Online
- Idle
- Offline
- Reconnecting

Presence data is transient and not part of the business domain.

---

# Heartbeat

Connections are monitored using heartbeat messages.

```
Heartbeat

↓

Validate

↓

Update Last Activity

↓

Continue

or

Disconnect
```

Inactive connections are automatically released.

---

# Reconnection

When a connection is lost:

```
Disconnect

↓

Reconnect

↓

Authenticate

↓

Restore Session

↓

Restore Subscriptions
```

Reconnection is transparent whenever possible.

---

# Error Handling

Possible failures include:

- authentication failure
- connection timeout
- heartbeat timeout
- subscription failure
- event delivery failure

Errors are standardized before being sent to clients.

---

# Security

The WebSocket Runtime enforces:

- TLS encryption
- authenticated sessions
- authorization checks
- subscription validation
- payload limits
- connection limits
- replay protection

Authorization is verified before delivering protected events.

---

# Performance

Recommended targets:

- Connection Establishment <200 ms
- Event Dispatch <20 ms
- Stream Latency <50 ms
- Heartbeat Processing <10 ms

Targets exclude external network latency.

---

# Observability

Metrics include:

- active connections
- new connections
- reconnect rate
- message throughput
- event delivery latency
- connection failures
- heartbeat failures

Every connection is associated with a Correlation ID.

---

# Failure Recovery

If a WebSocket node becomes unavailable:

- clients reconnect automatically
- session registry is restored where applicable
- subscriptions are re-established
- missed events are recovered according to policy

Realtime availability should not affect business consistency.

---

# Runtime Dependencies

Depends on:

- Authentication Flow
- API Runtime
- Event System
- Queue System
- Conversation Runtime
- Media Runtime

The WebSocket Runtime owns connection state only.

---

# Integration Flow

```
Client

↓

WebSocket Runtime

↓

Event Bus

↓

Conversation Runtime

↓

Event Bus

↓

WebSocket Runtime

↓

Client
```

Business runtimes never communicate directly with clients over WebSocket.

---

# Related Documents

- api-runtime.md
- authentication-flow.md
- conversation-runtime.md
- media-runtime.md
- event-system.md
- queue-system.md

---

# Final Statement

The WebSocket Runtime provides a scalable, secure, and event-driven realtime communication layer for the PAO Companion platform.

By separating connection management from business execution and delivering updates through immutable events, the platform supports responsive conversations, live media generation progress, realtime notifications, and seamless user experiences while preserving clean architectural boundaries.