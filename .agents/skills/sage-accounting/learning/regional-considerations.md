## Entering Central European regions for the first time after developing for the South African region
## The purpose of this guide
For any developers who have become familiar with the South African (SA/ZA) regional version of Sage Business Cloud Accounting (formerly SageOne), it's corresponding SA/ZA API v2.0.0., and who are looking to market their product(s) in the United Kingdom (UK), or other regions supported by the versions of Sage Business Cloud Accounting (SBCA) powered by the Global Accounting Core (GAC) API v3.1.
> NOTE:
> Similar, regional versions of SBCA exist for Australia, New Zealand, and Asia (Hong Kong, Singapore, Malaysia).
> These regions are not covered in this guide.
## Quick facts and links
### Sage Business Cloud Accounting (SBCA) using API v2.0.0. - Southern Hemisphere
This API supports South African (SA/ZA) business entities, and theoretically can support other regional versions of SBCA.
Specifically for South Africa...
- Developer main page: Become a Sage Business Cloud Accounting Developer
- Security model: Basic Authentication
- Enrollment Form and License Agreement required to begin developing.
- You request an API Key, and receive an email to signup for a Sandbox/Test Environment
> NOTE:
> You may have two 'Trial' environments at this point, only your 'Sandbox/Test Environment' is eligible to be extended as your development environment.
- There is one Guide for API v2.0.0. Scroll down to the API Overview section.
> Recommended reading:
> Each section including the examples that follow the
> API Overview
> section of this Guide.
- API v2.0.0. Documentation - endpoints are organized by data object.
> NOTE:
> This is the only currently available/supported API for the South African version of SBCA (formerly Sage One).
- Calls to the API are made to this URL (using your API key):
- Community: invitation by email, post registration to the Sage One Accounting Google Group
- Dev Support:
### Sage Business Cloud Accounting (SBCA) using API v3.1 - Northern Hemisphere
Supports 3 countries/regions (UK, IE, CA) via the Global Accounting Core (GAC) API v3.1 .
- Developer main Page: Develop for Accounting
- Security model: Authentication and Authorization using OAuth 2.0 .
- No enrollment is required prior to developing. Terms and Conditions are agreed to regionally, prior to review of your application. There are processes for building and maintaining your listing on the Sage Business Cloud Marketplace.
- Trial Environments are requested for each region you will develop against and the process is outlined in the Quick Start Guide .
> TIP:
> You can use email services which support aliasing on the fly such as Google's
> task-specific email addresses
> to help you manage multiple environments from the same email account/inbox.
- Multiple Guides , organized by 'Learning' topics. Clicking on these topics, expands a list of sub-topics.
> Recommended:
> Click on the topics for
> Getting Started
> ,
> Authenticating
> ,
> Key Concepts
> ,
> Response efficiencies
> , and
> Brexit
> to review the sub-topics for each.
- GAC API v3.1 Documentation - endpoints are grouped by functional area.
> NOTE:
> API v3.0 is still in use, but differs regionally across 6 regions (UKI, US, DE, ES, CA, FR). Therefore, the GAC API v3.1 is the preferred and unified API for the 7 countries supported
> .
> API v3.0 is not covered in this guide.
- Calls to the API are made to: with the desired endpoint, such as /coa_accounts , appended to the URL.
- Community (requires registration):
- Dev support: To ensure we can help everyone as quickly as possible, please see the Overview , Support checklist , Expectations , and Case lifecycle for detailed information.
### Notable Differences between API v2.0.0 and the GAC API v3.1
1. SA/ZA API v2.0.0. handled app registration quite differently. You had to register first for a 'sandbox' API key, then go through a gating process for a 'production' API key. For the GAC API v3.1 there is a single place for registration, but you do have to set up a trial environment for each country where your solution will be deployed.
2. Authentication and Authorization are handled very differently: a complete guide to authenticating Basic auth is used with SA/ZA API v2.0.0. OAuth 2.0 is used by GAC API v3.1. Specifically: tokens and refresh tokens are integrated into the OAuth process - with optional PKCE support since Feb, 2021. Also see the OAuth Grant Types for a full list of Grant Types, including Authorization Code.
3. Mapping Chart of Accounts (COA) is presumed one of the exercises which remains the same as a prerequisite, including Best Practice advise to monitor for any customization in the SBCA COA. Presumably the COAs are also different (this is not known/confirmed.) COA is not customizable through the South African UI versions or through its API v2.0.0. SBCA GAC allows customization (including a CSV file import format) only when no transactions have been entered. Exception: control accounts/nominals which are always fixed/unchangable .
4. Differences in Endpoints. Data gathering workflows or maps from API v2.0.0. endpoints to API v3.1 are being created. Examples include: Customers and Suppliers - both distinct endpoints in SA/ZA - are handled by a single Contacts endpoint. Item is a single endpoint - handles physical products as well as services - are handled by a set of Products and Services endpoints, treating them as 'Catalog Items'. Inventory Management requires Accounting Plus. Allocations - including outstanding documents for both customers and suppliers - are handled by a group of Payments & Receipts endpoints, specifically contact allocations and unallocated artefacts Analysis Categories and Analysis Types do not yet have API support, but can be set up through the UI in the UK: Help Documentation on Analysis Types . The concept of a quick entry doesn't exist in the South African version; SBCA GAC offers these for specific situations - for Purchase Quick Entries and for Sales Quick Entries . A sales Quote exists in the SA/ZA versions with its own endpoint; the SBCA GAC quote artefact appears under Sales Transactions .
> Recommended:
> Sage has created a closed club in the
> Clubs
> area of the Developer Community called 'Accounting Regional API Standardisation'.
> To request access or receive an invitation to this Club, you will need to register for the Community first.
## Getting familiar with the SBCA GAC API v3.1
Check out the 'Key Concepts' section of the Tutorials & Guides for the SBCA GAC (API v3.1) to help you better understand the data relationships.
> TIP:
> Download the
> full Swagger file for the GAC API v3.1
> and use it as a reference for field lengths supported by each object's properties. Search for
> maxLength
> , noting the:
> object
> and the property data
> type, maxLength, and description
> .
South Africa has a single version of Sage Business Cloud Accounting (formerly SageOne) which can be upgraded to an 'Advantage' version in support of multi-currency, and time-tracking.
There are at least two versions of Sage Business Cloud Accounting in geographic regions supported by GAC API v3.1, and in the UK there are 3:
1. Start - single user, invoices, bank reconciliation, calculate and submit VAT.
2. Standard - same as Start and adds: multiple users, advanced reports, quotes, estimates, forecasts, purchase invoices, and products/items
3. Plus - same as the above and adds: invoicing in multiple currencies, inventory management
> NOTE:
> While there is an SBCA Partner Edition available, API support remains in development.
Differences between (Accounting) Standard and (Accounting) Start versions are outlined in the Tutorials & Guides
All Customers and Suppliers are considered 'Contacts' and are also related to addresses. See Contact and Address Relationships
> NOTE:
> Contact Persons
> are a special use case related to purchase or sales invoice business addresses which have no direct relationship with a CUSTOMER or VENDOR. A primary contact for a given address can be set using the contact_persons endpoint, for example
> .
Examples of Artefacts include: (purchase or sales) invoices, credit notes, quick entries, corrective invoices, contact payments, other payments, and opening balances.
An artefact that requires payment can be a purchase invoice or a sales invoice and will be related to a Contact ( contact_type_id of either VENDOR or CUSTOMER). Allocated payments are described in the 'Payments and Receipts' key concepts, for example, and recorded via the Contact Allocations endpoint .
> TIP:
> Be sure not to miss these articles/concepts which appear in the
> Tutorials and Guides
> , by expanding the left-hand navigation
> Learning: Key Concepts
> node:
> Best Practices
> FAQ-Frequently Asked Questions
> Frequently Raised Errors
> Multi Business
> design considerations.
> Indempotency
### Known gaps between SA/ZA API v2.0.0 and GAC API v3.1
Available in SA/ZA API, but not in the GAC API:
1. User Defined fields on: Customer, Supplier, Item, Asset, Documents & Transactions. There are 3 each for text, yes/no, numeric, and date values on each of those objects.
2. API Support for Analysis Categories and Analysis Types.
3. Task Management: Task Dashboard and Task Categories.
4. Dedicated area for Accountants vs. simple invitations for an Accountant to join a customer's SBCA environment.