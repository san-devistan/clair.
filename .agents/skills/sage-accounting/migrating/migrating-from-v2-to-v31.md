The current API version v3.1 comes with many benefits compared to API version v2.
## Benefits to Upgrade to API v3.1
- Wider range of supported endpoints and features
- A whole load of new capabilities, ie. sorting, filtering, pagination, idempotency, etc.
- Authorization adheres closely to the OAuth 2.0 specification
- Sophisticated request signing is no longer required - what a relief!
- Supports Accounting in 7 countries instead of UK, Ireland and US only
- Identical API for all supported regions, no country specific differences in the API itself
- Structural consistency of endpoints
- Multi-user and multi-business support
- No planned end of life
- A fantastic set of ever-growing documentation
- JSON everywhere
Read through the guides to get a good overview on all these great improvements!
## Steps to Upgrade
### 1. Register new client application
We have reworked the developer registration service with with under the hood improvements. Check out all the information about Developer Sign Up and Client App Registration when you follow those links.
### 2. New authorization endpoints
Authorization requests in API v2 went against https://www.sageone.com/oauth2/auth , but this has to be changed to:
```
txt
Copy
https://www.sageone.com/oauth2/auth/central?filter=apiv3.1
```
When an Accounting user has already logged into Accounting in the current browser session, it will redirect them to the login screen and subsequently to the grant access page. When no such country cookie is present, the "flag page" is displayed, allowing the user to select their destination.
Only the countries valid for API v3.1 are displayed, while in API v2, all countries covered by the Sage Business Cloud Accounting (formerly known as Sage One) product line were shown.
### 3. New token endpoints
All requests to get new tokens went to https://api.sageone.com/oauth2/token in this previous API version, but now they need to target:
```
txt
Copy
https://oauth.accounting.sage.com/token
```
### 4. New tokens
The format of the access and refresh tokens itself has changed quite a bit. While v2 tokens where always 40 characters long, the tokens in v3.1 have a size around 1300 characters. Please reserve up to 2048 characters (2k) to store the new tokens.
Another notable change with the new tokens is their reduced expiration time. Access tokens now last for only five minutes, a value that was 60 minutes before. Refresh tokens, which would never expire in the previous API version, now expire after one month (31 days). You should not hard-code these values, as they may change at any time. Read out the values returned by the token endpoint ( expires_in and refresh_token_expires_in ) and use them to decide when you want to refresh the access token.
Sample token endpoint response:
```
json
Copy
{

  
"access_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjExMmRrVFhmd0ZOelpKLXlnY0lxTXU1U..."
,

  
"expires_in"
:
 
300
,

  
"token_type"
:
 
"bearer"
,

  
"refresh_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjExMmRrVFhmd0ZOelpKLXlnY0lxTXU1U..."
,

  
"refresh_token_expires_in"
:
 
2678400
,

  
"scope"
:
 
"full_access"
,

  
"requested_by_id"
:
 
"08474715-85cc-7099-b842-61cf2fdd4769"

}
```
### 4. Different Base URL
The base URL for all requests to API v2 were either https://api.sageone.com/accounts/v2/ or https://api.sageone.com/core/v2/ . This has been changed for all endpoints in API v3.1 to:
```
txt
Copy
https://api.accounting.sage.com/v3.1/`
```
### 5. Remove Nonce and Signature Code
The X-Nonce and X-Signature request headers are no longer required to make API calls. You may sacrifice all the code involved with it on the altar of obsolete features. Don't forget to celebrate this event properly!
Hint: since API v3.1 was implemented very closely aligned to the OAuth 2.0 specification, we recommend using a popular OAuth library for connecting with the Sage Accounting API.
### 6. Review and Update all API calls
To port your endpoints to the new API version, some resources have changed their names and others, their structure. While all endpoints return much more information now, it may take you a minute or two to identify the new attributes.
| API v2 | API v3.1 |
| --- | --- |
| /accounts/v2/account_types | /v3.1/bank_account_types |
| /accounts/v2/artefact_statuses | /v3.1/artefact_statuses |
| /accounts/v2/attachments | /v3.1/attachments |
| /accounts/v2/bank_accounts | /v3.1/bank_accounts |
| /accounts/v2/contacts | /v3.1/contacts |
| /accounts/v2/countries | /v3.1/countries |
| /accounts/v2/exchange_rates | /v3.1/exchange_rates |
| /accounts/v2/expense_types | /v3.1/ledger_accounts?visible_in=expenses |
| /accounts/v2/expenses | /v3.1/other_payments?transaction_type_id=OTHER_PAYMENT |
| /accounts/v2/financial_settings | /v3.1/financial_settings |
| /accounts/v2/income_types | /v3.1/ledger_accounts?visible_in=sales |
| /accounts/v2/incomes | /v3.1/other_payments?transaction_type_id=OTHER_RECEIPT |
| /accounts/v2/invoice_settings | /v3.1/invoice_settings |
| /accounts/v2/ledger_accounts | /v3.1/ledger_accounts |
| /accounts/v2/ledger_account_types | /v3.1/ledger_account_types |
| /accounts/v2/ledger_entries | /v3.1/ledger_entries |
| /accounts/v2/period_types | not supported yet |
| /accounts/v2/products | /v3.1/products |
| /accounts/v2/purchase_credit_notes | /v3.1/purchase_credit_notes |
| /accounts/v2/purchase_invoices | /v3.1/purchase_invoices |
| /accounts/v2/sales_credit_notes | /v3.1/sales_credit_notes |
| /accounts/v2/sales_invoices | /v3.1/sales_invoices |
| /accounts/v2/sales_invoices/summary | not supported yet |
| /accounts/v2/sales_quotes | /v3.1/sales_quotes |
| /accounts/v2/services | /v3.1/services |
| /accounts/v2/summary | not supported yet |
| /accounts/v2/tax_offices | /v3.1/tax_offices |
| /accounts/v2/tax_profiles | /v3.1/tax_profiles |
| /accounts/v2/tax_rates | /v3.1/tax_rates |
| /core/v2/business | /v3.1/businesses/lead |
| /core/v2/business_relationships | /v3.1/businesses |
| /core/v2/me | not supported yet |
| /core/v2/user | /v3.1/user |
### 7. Core endpoints
In v3.1 we've taken the opportunity and given the "core" endpoints a complete overhaul. They were redesigned to be more in line with the other available endpoints and the general idea of RESTful API design. The new implementations also provide enhanced support for the multi-business tenants of Sage Accounting.
The new endpoints are:
- GET /businesses
- GET, PUT /businesses/{id}
- GET, PUT /user
For to most detailed information, please go to API Reference .
#### Businesses
```
txt
Copy
GET /businesses
```
returns a list of all businesses the user has access to which was handled by business_relationships in API v2.
```
txt
Copy
GET /businesses/{id}
```
returns the details of the business for the given business id.
```
txt
Copy
PUT /businesses/{id}
Content-Type: application/json

{
  "business": {
    "address_line_1": "23 Acacia Ave.",
    "mobile": "0777654321",
    "website": "https://example.com/"
  }
}
```
The attributes to update are nested inside a business structure in API v3.1 to be consistent with all other endpoints. Only the business owner can change business details.
#### Lead Business
```
txt
Copy
GET /businesses/lead
```
returns the default business that is used for API calls without given X-Business header. This is only important if a user has access to multiple businesses with their account.
You can read more details about the lead business in the multi business section of the guides.
#### User
```
txt
Copy
GET /user
```
returns the details of the user.
```
txt
Copy
PUT /user
Content-Type: application/json

{
  "user": {
    "last_name": "Smith"
  }
}
```
will update user details. Just like when updating business details, all attributes are nested into a user structure here.
### 8. JSON-only API
In contrast to API v2, API v3.1 only accepts requests with a content type of JSON:
```
txt
Copy
Content-Type: application/json
```
Requests with content types other than JSON are no longer possible and you will receive an error from the API.
### 9. Migrate your data, transfer IDs
Here come the bad news: the IDs of almost all entities have changed. But don't despair, there is hope! You can still query the API v2 IDs in the new API v3.1, just use the show_legacy_id=true query parameter. Here's an example for contacts, yet this query parameter exists on all API v3.1 endpoints where IDs apply.
```
txt
Copy
GET https://api.accounting.sage.com/v3.1/contacts?show_legacy_id=true
```
```
json
Copy
{

  
"$total"
:
 
3
,

  
"$page"
:
 
1
,

  
"$next"
:
 
null
,

  
"$back"
:
 
null
,

  
"$itemsPerPage"
:
 
20
,

  
"$items"
:
 
[

    
{

      
"legacy_id"
:
 
53117661
,

      
"id"
:
 
"f909acd78be748ad96e824b35af9749d"
,

      
"displayed_as"
:
 
"HMRC Reclaimed (HMRC Rec)"
,

      
"$path"
:
 
"/contacts/f909acd78be748ad96e824b35af9749d"

    
}
,

    
{

      
"legacy_id"
:
 
53117663
,

      
"id"
:
 
"8db0c9af0e8f4def9d15667bd8e16445"
,

      
"displayed_as"
:
 
"HMRC Payments (HMRC Pay)"
,

      
"$path"
:
 
"/contacts/8db0c9af0e8f4def9d15667bd8e16445"

    
}
,

    
{

      
"legacy_id"
:
 
53117843
,

      
"id"
:
 
"cbb711e2da304720beb4cc4a5d8309af"
,

      
"displayed_as"
:
 
"Jessica B. Hill (Cust #12345)"
,

      
"$path"
:
 
"/contacts/cbb711e2da304720beb4cc4a5d8309af"

    
}

  
]

}
```
To reconcile your API v2 IDs with the new ones, you need to iterate through all entities in API v3.1 to get the IDs you may have cached in your client application.
### 10. Send the X-Business header (optional)
There is one new optional header your client may send which is named X-Business . This header can be used to specify the business instance the request is made against. This is only relevant for Sage Accounting users who have access to multiple business instances. If you do not pass this header, the user's lead business is used. More details can be found in the guides to the multi business feature .
### 11. Ship it!