The current API version v3.1 comes with many benefits compared to API version v1.
## Benefits to Upgrade to API v3.1
- Much wider range of supported endpoints and features
- A whole load of new capabilities, ie. sorting, filtering, pagination, idempotency, etc.
- Authorization adheres closely to the OAuth 2.0 specification
- Sophisticated request signing is no longer required - what a relief!
- Supports Accounting in seven countries instead of UK and Ireland only
- Structural consistency of endpoints
- Multi-user and multi-business support
- No planned end of life
- A fantastic set of ever-growing documentation
- JSON everywhere
Read through the guides to get a good overview on all these great improvements!
## Steps to Upgrade
### 1. Register new client application
We have reworked the developer registration service with under the hood improvements. Check out all the information about Developer Sign Up and Client App Registration when you follow those links.
### 2. New authorization endpoints
Authorization requests in API v1 went against https://www.sageone.com/oauth2/auth , but this has to be changed to:
```
txt
Copy
https://www.sageone.com/oauth2/auth/central?filter=apiv3.1
```
When an Accounting user has already logged into Accounting in the current browser session, it will redirect them to the login screen and subsequently to the grant access page. When no such country cookie is present, the "flag page" is displayed, allowing the user to select their destination.
Only the countries valid for API v3.1 are displayed, while in API v1, all countries covered by the Sage Business Cloud Accounting (formerly known as Sage One) product line were shown.
### 3. New token endpoints
All requests to get new tokens went to https://api.sageone.com/oauth2/token in this previous API version, but now they need to target:
```
txt
Copy
https://oauth.accounting.sage.com/token
```
### 4. New tokens
The format of the access and refresh tokens itself has changed quite a bit. While v1 tokens where always 40 characters long, the tokens in v3.1 have a size around 1300 characters. Please reserve up to 2048 characters (2k) to store the new tokens.
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
The base URL for all API requests was https://api.sageone.com/accounts/v1/ in API version v1 and has been changed in API v3.1 to:
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
| API v1 | API v3.1 |
| --- | --- |
| /accounts/v1/account_types | /v3.1/bank_account_types |
| /accounts/v1/bank_accounts | /v3.1/bank_accounts |
| /accounts/v1/coa_structure | /v3.1/coa_templates and /v3.1/ledger_accounts |
| /accounts/v1/coa_templates | /v3.1/businesses/lead and /v3.1/coa_accounts |
| /accounts/v1/contacts | /v3.1/contacts |
| /accounts/v1/countries | /v3.1/countries |
| /accounts/v1/current_vat_scheme | /v3.1/financial_settings |
| /accounts/v1/exchange_rates | /v3.1/exchange_rates |
| /accounts/v1/expenditures | /v3.1/other_payments?transaction_type_id=OTHER_PAYMENT |
| /accounts/v1/expense_types | /v3.1/ledger_accounts?visible_in=expenses |
| /accounts/v1/financial_settings | /v3.1/financial_settings |
| /accounts/v1/income_types | /v3.1/ledger_accounts?visible_in=sales |
| /accounts/v1/incomes | /v3.1/other_payments?transaction_type_id=OTHER_RECEIPT |
| /accounts/v1/journals | /v3.1/journals |
| /accounts/v1/ledger_accounts | /v3.1/ledger_accounts |
| /accounts/v1/payment_statuses | /v3.1/artefact_statuses |
| /accounts/v1/period_types | not supported yet |
| /accounts/v1/products | /v3.1/products |
| /accounts/v1/purchase_invoices | /v3.1/purchase_invoices |
| /accounts/v1/sales_invoices | /v3.1/sales_invoices |
| /accounts/v1/services | /v3.1/services |
| /accounts/v1/summary | not supported yet |
| /accounts/v1/tax_rates | /v3.1/tax_rates |
| /accounts/v1/transaction_types | /v3.1/transaction_types |
| /accounts/v1/transactions | /v3.1/transactions |
| /accounts/v1/vat_schemes | /v3.1/tax_schemes |
### 7. JSON-only API
In contrast to API v1, API v3.1 only accepts requests with a content type of JSON:
```
txt
Copy
Content-Type: application/json
```
Requests with content types other than JSON are no longer possible and you will receive an error from the API.
### 8. Migrate your data, transfer IDs
Here come the bad news: the IDs of almost all entities have changed. But don't despair, there is hope! You can still query the API v1 IDs in the new API v3.1, just use the show_legacy_id=true query parameter. Here's an example for contacts, yet this query parameter exists on all API v3.1 endpoints where IDs apply.
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
To reconcile your API v1 IDs with the new ones, you need to iterate through all entities in API v3.1 to get the IDs you may have cached in your client application.
### 9. Send the X-Business header (optional)
There is one new optional header your client may send which is named X-Business . This header can be used to specify the business instance the request is made against. This is only relevant for Sage Accounting users who have access to multiple business instances. If you do not pass this header, the user's lead business is used.
### 10. Ship it!