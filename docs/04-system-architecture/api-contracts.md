# API Contracts

Version: 1.0

---

# Introduction

API Contracts define the official communication interface between external clients and the PAO Companion Platform.

Unlike the Runtime Interface, which governs internal runtime communication, API Contracts govern communication between:

- Web Application
- Mobile Application
- Desktop Application
- Third-party Integrations
- Backend Services

The API layer is responsible for translating external requests into Runtime execution.

---

# Design Principles

Every API must follow the same principles.

## Stateless

Every request is independent.

Servers should not rely on previous requests stored in memory.

---

## Resource Oriented

Resources represent business entities.

Examples

```
Users

Companions

Conversations

Memories

Timeline

Wallet

Subscription
```

---

## Versioned

Every public endpoint belongs to an API version.

Example

```
/api/v1/...
```

Breaking changes require a new API version.

---

## Secure

Every protected endpoint requires authentication.

Authorization is validated before business logic executes.

---

## Consistent

Every endpoint follows the same request and response format.

---

# API Base URL

```
/api/v1
```

---

# Standard Request Headers

```
Authorization: Bearer <JWT>

Content-Type: application/json

Accept: application/json

X-Correlation-ID: <UUID>

X-Client-Version: <Version>

X-Platform: web | ios | android | desktop
```

---

# Standard Response Structure

Every successful response follows:

```json
{
    "success": true,
    "data": {},
    "meta": {},
    "errors": null
}
```

---

# Standard Error Structure

```json
{
    "success": false,
    "data": null,
    "meta": {},
    "errors": [
        {
            "code": "VALIDATION_ERROR",
            "message": "Invalid request."
        }
    ]
}
```

---

# Response Metadata

Every response may include:

```json
{
    "requestId": "...",
    "correlationId": "...",
    "timestamp": "...",
    "apiVersion": "v1"
}
```

---

# Authentication APIs

## Register

```
POST /api/v1/auth/register
```

Request

- Email
- Password
- Name

Response

- User
- Access Token
- Refresh Token

---

## Login

```
POST /api/v1/auth/login
```

Request

- Email
- Password

Response

- User
- Access Token
- Refresh Token

---

## Refresh Token

```
POST /api/v1/auth/refresh
```

---

## Logout

```
POST /api/v1/auth/logout
```

---

## Forgot Password

```
POST /api/v1/auth/forgot-password
```

---

## Reset Password

```
POST /api/v1/auth/reset-password
```

---

# User APIs

## Get Current User

```
GET /api/v1/users/me
```

---

## Update Profile

```
PATCH /api/v1/users/me
```

---

## Delete Account

```
DELETE /api/v1/users/me
```

---

# Companion APIs

## Create Companion

```
POST /api/v1/companions
```

Creates a new AI Companion.

Returns

- Companion
- Character
- Relationship

---

## List Companions

```
GET /api/v1/companions
```

---

## Get Companion

```
GET /api/v1/companions/{companionId}
```

---

## Update Companion

```
PATCH /api/v1/companions/{companionId}
```

---

## Delete Companion

```
DELETE /api/v1/companions/{companionId}
```

---

# Conversation APIs

## Send Message

```
POST /api/v1/conversations
```

Request

```
{
    "companionId": "...",
    "message": "...",
    "attachments": []
}
```

Execution Flow

```
API

↓

Conversation Runtime

↓

Relationship Runtime

↓

Timeline Runtime

↓

Memory Runtime

↓

Character Runtime

↓

Context Runtime

↓

Prompt Runtime

↓

Provider Runtime

↓

Conversation Output

↓

Response
```

Response

- Conversation Output
- Updated Relationship
- Credit Usage
- Media References

---

## Get Conversation

```
GET /api/v1/conversations/{conversationId}
```

---

## List Conversations

```
GET /api/v1/conversations
```

---

# Memory APIs

## List Memories

```
GET /api/v1/companions/{companionId}/memories
```

---

## Get Memory

```
GET /api/v1/memories/{memoryId}
```

---

## Archive Memory

```
PATCH /api/v1/memories/{memoryId}/archive
```

---

## Delete Memory

```
DELETE /api/v1/memories/{memoryId}
```

---

# Timeline APIs

## Get Timeline

```
GET /api/v1/companions/{companionId}/timeline
```

---

## Timeline Events

```
GET /api/v1/companions/{companionId}/timeline/events
```

---

# Relationship APIs

## Get Relationship

```
GET /api/v1/companions/{companionId}/relationship
```

---

## Relationship History

```
GET /api/v1/companions/{companionId}/relationship/history
```

---

# Character APIs

## Get Character

```
GET /api/v1/companions/{companionId}/character
```

---

## Update Character

```
PATCH /api/v1/companions/{companionId}/character
```

Administrative endpoint only.

---

# Media APIs

## Generate Image

```
POST /api/v1/media/image
```

---

## Generate Voice

```
POST /api/v1/media/voice
```

---

## Generate Video

```
POST /api/v1/media/video
```

---

## List Media

```
GET /api/v1/media
```

---

## Delete Media

```
DELETE /api/v1/media/{mediaId}
```

---

# Wallet APIs

## Get Wallet

```
GET /api/v1/wallet
```

---

## Wallet Transactions

```
GET /api/v1/wallet/transactions
```

---

## Credit Balance

```
GET /api/v1/wallet/credits
```

---

# Subscription APIs

## Current Subscription

```
GET /api/v1/subscription
```

---

## Upgrade Subscription

```
POST /api/v1/subscription/upgrade
```

---

## Cancel Subscription

```
POST /api/v1/subscription/cancel
```

---

# Notification APIs

## List Notifications

```
GET /api/v1/notifications
```

---

## Mark as Read

```
PATCH /api/v1/notifications/{notificationId}
```

---

# Provider APIs

Provider APIs are internal.

Public clients must never communicate directly with AI providers.

All provider interactions occur through Runtime execution.

---

# Health APIs

## Health Check

```
GET /health
```

---

## Readiness

```
GET /ready
```

---

## Liveness

```
GET /live
```

---

# Pagination

Collection endpoints should support:

```
page

limit

sort

order
```

Response metadata:

```json
{
    "page": 1,
    "limit": 20,
    "total": 125,
    "pages": 7
}
```

---

# Filtering

Endpoints may support:

```
status

createdAt

updatedAt

type

keyword
```

---

# HTTP Status Codes

| Code | Meaning |
|--------|----------|
|200|Success|
|201|Created|
|202|Accepted|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|429|Too Many Requests|
|500|Internal Server Error|
|503|Service Unavailable|

---

# Error Codes

Examples

```
VALIDATION_ERROR

UNAUTHORIZED

FORBIDDEN

RESOURCE_NOT_FOUND

INSUFFICIENT_CREDITS

SUBSCRIPTION_REQUIRED

PROVIDER_TIMEOUT

PROVIDER_UNAVAILABLE

INTERNAL_ERROR
```

---

# Rate Limiting

Rate limiting should be enforced on:

- Authentication
- AI Generation
- Media Generation
- Upload
- Billing

Example headers

```
X-RateLimit-Limit

X-RateLimit-Remaining

X-RateLimit-Reset
```

---

# Idempotency

Sensitive write operations should support:

```
Idempotency-Key
```

Examples

- Payment
- Subscription Upgrade
- Wallet Top-up

This prevents duplicate processing.

---

# API Compatibility

The API must remain backward compatible within the same major version whenever possible.

Breaking changes require:

- New API version
- Migration documentation
- Deprecation notice

---

# API Rules

Every endpoint must:

- Validate authentication.
- Validate authorization.
- Validate request schema.
- Return standardized responses.
- Emit Correlation ID.
- Produce structured logs.
- Generate runtime metrics.

Every endpoint must never:

- Expose provider-specific implementations.
- Expose internal runtime objects.
- Return stack traces.
- Leak secrets or credentials.

---

# API Architecture

```
Client

↓

API Gateway

↓

Authentication

↓

Authorization

↓

Validation

↓

API Runtime

↓

Runtime Pipeline

↓

Response Builder

↓

Client
```

---

# Final Statement

API Contracts define the external interface of PAO Companion.

Together with the Domain Model, Runtime Interface, Runtime Artifacts, Event Contracts, and JSON Schemas, they establish a stable, versioned, secure, and provider-independent contract between clients and the platform, enabling consistent integrations while preserving the internal architecture.