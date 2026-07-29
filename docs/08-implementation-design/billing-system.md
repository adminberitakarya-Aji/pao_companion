# PAO COMPANION — Billing System Design

Version: 1.0

Status: Implementation Design

Last Updated: 2026-07-29

---

# Introduction

This document defines the billing architecture of the PAO Companion platform.

The Billing System manages subscriptions, credit wallets, usage metering, pricing calculation, invoices, payments, and financial records.

Billing operates independently from AI providers and business services.

---

# Design Principles

The Billing System follows these principles:

- Usage First
- Accurate Metering
- Immutable Financial Records
- Provider Independent
- Event Driven
- Auditable
- Deterministic Pricing

---

# Billing Architecture

```
Client

↓

Runtime

↓

Usage Meter

↓

Usage Repository

↓

Billing Engine

↓

Wallet / Subscription

↓

Payment

↓

Invoice

↓

Event Bus
```

The Billing Engine is the only component responsible for calculating charges.

---

# Billing Components

```
Billing System

├── Usage Meter
├── Billing Engine
├── Wallet Manager
├── Subscription Manager
├── Pricing Engine
├── Invoice Manager
├── Payment Manager
├── Refund Manager
├── Event Publisher
└── Audit Logger
```

---

# Usage Flow

Every AI request follows the same billing sequence.

```
Conversation Completed

↓

Create Usage Record

↓

Persist Usage

↓

Calculate Cost

↓

Validate Balance

↓

Deduct Credits

↓

Publish Billing Event
```

No credits are deducted before usage is successfully recorded.

---

# Usage Record

Every AI operation creates a Usage Record.

Example fields:

- Usage ID
- User ID
- Companion ID
- Feature
- Provider
- Model
- Token Usage
- Media Count
- Duration
- Timestamp

Usage Records are immutable.

---

# Wallet System

Each user owns one wallet.

The wallet contains:

- Current Balance
- Reserved Balance
- Lifetime Credits Purchased
- Lifetime Credits Consumed
- Last Transaction
- Version

Wallet updates use optimistic concurrency control.

---

# Credit Transactions

Supported transaction types include:

- Deposit
- Consumption
- Refund
- Adjustment
- Promotional Bonus
- Expiration (if enabled)

Every transaction is recorded permanently.

---

# Subscription System

Subscriptions define platform access.

Examples:

- Free
- Starter
- Pro
- Premium
- Enterprise

Subscriptions determine:

- available features
- provider access
- monthly quotas
- generation limits
- concurrency limits

Subscriptions do not directly calculate usage cost.

---

# Pricing Engine

The Pricing Engine calculates charges based on:

- feature type
- selected provider
- AI model
- token usage
- media generation
- subscription benefits
- promotional rules

Pricing rules are versioned.

---

# Payment Flow

```
User

↓

Payment Provider

↓

Payment Verification

↓

Wallet Update

↓

Receipt

↓

Billing Event
```

Payment providers are abstracted behind adapters.

---

# Invoice Management

Invoices contain:

- Invoice ID
- Customer
- Billing Period
- Transactions
- Taxes (where applicable)
- Total
- Status

Invoices are immutable after issuance.

---

# Refund Flow

Refunds follow:

```
Refund Request

↓

Validation

↓

Approval

↓

Wallet Adjustment

↓

Payment Refund

↓

Audit

↓

Event
```

Refunds are fully auditable.

---

# Event Publishing

Billing publishes events such as:

- CreditsPurchased
- CreditsDeducted
- WalletUpdated
- SubscriptionChanged
- InvoiceGenerated
- PaymentCompleted
- RefundProcessed

Financial events are immutable.

---

# Security

Billing validates:

- ownership
- authorization
- transaction integrity
- payment verification
- audit compliance

Financial operations require strong consistency.

---

# Performance

Recommended targets:

- Usage Record <50 ms
- Wallet Update <100 ms
- Pricing Calculation <20 ms
- Billing Event <20 ms

Payment latency depends on external providers.

---

# Observability

Metrics include:

- revenue
- credits consumed
- credits purchased
- wallet balance distribution
- payment success rate
- billing failures
- refund rate

Financial metrics should be retained for long-term analysis.

---

# Failure Recovery

If payment succeeds but wallet update fails:

- preserve payment confirmation
- retry wallet update
- prevent duplicate credits
- notify operations if retries fail

If billing calculation fails:

- preserve Usage Record
- suspend deduction
- retry asynchronously

Financial integrity always has priority.

---

# Runtime Dependencies

The Billing System is used by:

- Conversation Runtime
- Media Runtime
- Subscription Service
- Payment Service
- Notification Service

Billing owns financial state only.

---

# Related Documents

- monetization.md
- api-design.md
- deployment.md
- authentication-flow.md

---

# Final Statement

The Billing System provides a deterministic, auditable, and provider-independent financial architecture for the PAO Companion platform.

By separating usage metering, pricing, wallet management, subscriptions, and payment processing into dedicated components, the platform supports flexible monetization models while maintaining financial accuracy, scalability, and operational transparency.