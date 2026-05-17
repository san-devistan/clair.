---
name: sage-accounting
description: "Documentation for Sage Accounting API v1.0.0 guides. Use when the user asks about Sage Accounting, Sage Business Cloud Accounting, developer.sage.com/accounting, OAuth2 authentication, Postman, X-Business, access rights, key concepts, VAT reform, migrations, pagination, filtering, Zapier, or developer support."
---

# Sage Accounting API v1.0.0 Guides

> 50 pages from [https://developer.sage.com/accounting/docs/v1.0.0/guides](https://developer.sage.com/accounting/docs/v1.0.0/guides)

This `SKILL.md` is an index, not the full documentation. The actual docs are the linked markdown files in this skill folder.

## Required Lookup

When this skill triggers for a Sage Accounting documentation question:

1. Search this skill folder or choose the relevant entry from Contents.
2. Read at least one linked `.md` file before answering API, syntax, authentication, configuration, migration, troubleshooting, or support questions.
3. Read multiple files when the answer spans OAuth flow, business selection, key concepts, endpoint behavior, examples, migrations, regional behavior, or support process.
4. Treat the local markdown files as the source of truth. If the local docs do not cover the question, say that instead of filling gaps from memory.

## Overview

These guides cover Sage Accounting API onboarding and integration work: creating developer apps, setting up trial data, authenticating with OAuth2, making requests with Postman, selecting businesses with `X-Business`, and handling user access rights. They also document accounting-domain concepts such as banking, invoicing, journals, inventory, payments and receipts, response efficiencies, EU VAT reform changes, migration paths to API v3.1, Zapier integration patterns, and Sage developer support expectations.

## Contents

### Guides Overview

- [Journey](journey.md)
- [Support](support.md)
- [Zapier](zapier.md)

### Articles

- [01 06 2021](articles/01-06-2021.md)
- [15 02 2021](articles/15-02-2021.md)
- [21 07 2025](articles/21-07-2025.md)

### Quick Start

- [Getting Started](quick-start/getting-started.md)
- [Create an App](quick-start/create-an-app.md)
- [Extend Your Sage Business Cloud Accounting Trial](quick-start/extend-your-sage-business-cloud-accounting-trial.md)
- [Test Data Preparation](quick-start/test-data-preparation.md)
- [Create Your First Request](quick-start/create-your-first-request.md)
- [Post Your Test Data](quick-start/post-your-test-data.md)
- [Continue Developing](quick-start/continue-developing.md)

### Learning Overview

- [EU VAT Reform](learning/eu-vat-reform.md)
- [Migrating](learning/migrating.md)
- [Regional Considerations](learning/regional-considerations.md)

### Getting Started

- [Client App Registration](learning/getting-started/client_app_registration.md)
- [Developer Signup](learning/getting-started/developer_signup.md)

### Authenticating

- [Authentication](learning/authenticating/authentication.md)
- [High Level Auth Flow](learning/authenticating/high-level-auth-flow.md)
- [OAuth Troubleshooting](learning/authenticating/oauth-troubleshooting.md)
- [Postman](learning/authenticating/postman.md)

### Key Concepts

- [Access Rights](learning/key-concepts/access-rights.md)
- [Analysis Types](learning/key-concepts/analysis_types.md)
- [Banking](learning/key-concepts/banking.md)
- [Best Practices](learning/key-concepts/best-practices.md)
- [Frequently Raised Errors](learning/key-concepts/frequently-raised-errors.md)
- [Inventory](learning/key-concepts/inventory.md)
- [Invoicing](learning/key-concepts/invoicing.md)
- [Journals](learning/key-concepts/journals.md)
- [Payments and Receipts](learning/key-concepts/payments-and-receipts.md)

### Response Efficiencies

- [Attributes](learning/response-efficiencies/attributes.md)
- [Filtering](learning/response-efficiencies/filtering.md)
- [Pagination](learning/response-efficiencies/pagination.md)
- [Sorting](learning/response-efficiencies/sorting.md)

### EU VAT Reform

- [EU VAT Reform Index](learning/eu-vat-reform/index.md)
- [Handling Reverse Charge VAT](learning/eu-vat-reform/handling-reverse-charge-vat.md)
- [Credit Note Allocations Breaking Changes](learning/eu-vat-reform/credit-note-allocations-breaking-changes-to-support-eu-vat-reform-in-api-31.md)
- [Other Receipts Breaking Changes](learning/eu-vat-reform/other-receipts-breaking-changes-to-support-eu-vat-reform-in-api-31.md)
- [Quick Entries Breaking Changes](learning/eu-vat-reform/quick-entries-breaking-changes-to-support-eu-vat-reform-in-api-31.md)

### Migration Guides

- [Migrating from v1 to v3.1](migrating/migrating-from-v1-to-v31.md)
- [Migrating from v2 to v3.1](migrating/migrating-from-v2-to-v31.md)
- [Learning: Migrating from v1 to v3.1](learning/migrating/migrating-from-v1-to-v31.md)
- [Learning: Migrating from v2 to v3.1](learning/migrating/migrating-from-v2-to-v31.md)
- [Learning: Migrating from v3 to v3.1](learning/migrating/migrating-from-v3-to-v31.md)

### Support

- [Support Expectations](support/support-expectations.md)
- [Support Checklist](support/support-checklist.md)
- [Case Lifecycle](support/case-lifecycle.md)

### Zapier

- [Multiple Line Items](zapier/multiple-line-items.md)
- [Products and Services](zapier/products-and-services.md)

## Search Hints

- Use exact terms for API behavior and errors, for example `X-Business`, `invalid_grant`, `MultiUserAccessDenied`, `attributes`, `pagination`, or `reverse charge VAT`.
- Use the Contents section when the topic maps cleanly to a guide, and `rg -n "<term>" .agents/skills/sage-accounting` when it may appear across multiple guides.
- For authentication questions, start with `learning/authenticating/authentication.md`, then check the high-level auth flow, OAuth troubleshooting, or Postman guide as needed.
- For accounting object behavior, start in Key Concepts and cross-check migration or EU VAT reform pages when the answer may vary by API version or region.
