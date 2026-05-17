We update our API on an ongoing basis and every so often we move to a whole new way of doing things. As part of this continuous improvement, we've moved from Microsoft Azure to Amazon Web Services (AWS). This enables us to reduce the registration and authentication load on you, while allowing us the opportunity to revise the documentation that will speed up your app development and make this a nicer place to be. There are lots of improvements heading your way so keep visiting us to stay up to date with the news.
To reduce disruption, we'll avoid constantly releasing breaking versions. Our move to AWS will not change most of our endpoints so the API will increment to v3.1. We will be simplifying the URL so you don't need to add the country code which means the URLs will require changes. We'll keep the current version (v3) going for some time and give you plenty of notice when we do announce a deprecation date.
We do recommend you upgrade now to start enjoying all the benefits!
## v1 and v2
Note that v1 and v2 have already been deprecated. If you're still using these now is a great time to upgrade.
## Benefits of v3.1
- There is only one base URL for all countries ( https://api.accounting.sage.com/v3.1 ) and no need to use different URLs for Accounting users from different countries.
- Centralized app for signing up for a developer account and registering apps.
- The authentication flow follows the OAuth2 specification closely so most OAuth2 client libraries should work out of the box with v3.1.
- There is no need to pass custom HTTP headers or subscription keys on API requests, you just have to include an access token.
- There is a fantastic set of ever-growing documentation.
## Calls to Action
You can stay where you are with v3 but we recommend you move to v3.1. We will not be migrating developer data from Microsoft Azure so you will need to,
1. Register at our new Developer Portal – you can use your Github account details to save you time.
2. Add all your apps to the new Developer Portal – no extra information needed.
3. Change the token URL you use.
4. Change the base URL you use to call our API as country is no longer needed.
5. Allow for the expiration date of refresh tokens.
6. Change your implementation of the /business , /business_relationships , /user and /me endpoints (further information below).
7. Remove the subscription key, site, signature and nonce headers.
8. Prepare for users with multiple businesses (optional)
9. Ensure only JSON is sent to the API
The sooner you upgrade, the sooner you see the benefits! All those steps are easy to implement. Most steps involve changing configuration or removing redundant business logic.
### 1. Sign up for a Developer Account
Click Sign Up to create your developer account. You can use your email address, or your GitHub account to do this. For more information, go to Signup documentation page .
### 2. Add your apps to your Developer Account
You'll need to get new client ids and secrets dedicated for v3.1. However, you can continue to use your v3 ids and secrets when using v3. For more information, go to App Registration documentation .
### 3. Change the token URL you use
While the authentication endpoint URL remains the same — https://www.sageone.com/auth/central —, you will need to use a different URL for obtaining API access and refresh tokens than in v3. The good news is that you do not have to code for the user's country anymore, there is one URL that allows you to exchange authorization codes or refresh tokens against access tokens: https://oauth.accounting.sage.com/token .
We've reduced the validity time for access tokens. Access tokens now expire after 5 minutes. In v3 they were valid for 60 minutes. The size of the access and refresh tokens have been increased in v3.1, they may reach a size of 2048 bytes long. If you're storing tokens in a database, you may need to increase the column sizes accordingly.
For more information about authentication, please go to Authentication page .
### 4. Change the base URL you use to call our API
With v3.1, we're changing the host and the path prefixes for our API endpoints. The new base URL is
https://api.accounting.sage.com/v3.1
You do not need to add a country to that base URL, also parts like core or accounts are not required anymore. Just add the name of the endpoint you want to access to the base URL. For example:
in v3: https://api.columbus.sage.com/us/sageone/accounts/v3/contacts
becomes in v3.1: https://api.accounting.sage.com/v3.1/contacts
### 5. Allow for the expiration date of refresh tokens
In v3, refresh tokens had no expiration date. To improve the security of our users, we're changing this in v3.1: Refresh tokens now expire after 31 days. If your app doesn't use the refresh token to obtain a new set of access and refresh tokens within that time, the user will have to re-authorize your app. If you cannot afford losing access to a user account, make sure to refresh your tokens once per month.
### 6. Endpoints with Breaking Changes
In v3.1 we've introduced breaking changes to several v3 endpoints: Some simply have changed their behaviour regarding the specification of an attribute, like endpoints for sales and purchase artefacts (see below).
Four endpoints, however, were completely redesigned ( /v3/core/business , /v3/core/business_relationships , /v3/core/me , and /v3/core/user ). These didn't follow the conventions found in all the other v3 endpoints, so we've taken the opportunity to bring them in line. The new implementations also provide enhanced support for the multi-business tenants of Sage Accounting.
The new endpoints are:
- GET /businesses
- GET, PUT /businesses/{id}
- GET, PUT /user
For more information, please go to API Reference .
#### Businesses
```
txt
Copy
GET /businesses
```
returns a list of all businesses the user has access to which was handled by business_relationships in API v3.
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
Be prepared that the lead business might change in some edge cases:
- deleting a user's first owned business
- creating a business if the user was invited to another business and has not created a business before
You can identify a lead business change by comparing the X-Business headers in the API responses, see the section about multi business support below.
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
#### Sales and Purchase Transactions
In sales and purchase transactions, the v3.1 validation of a line item's attribute tax_amount is now stricter in that it cannot be omitted as simply as before. See API Reference for Purchase Transactions and Sales Transactions .
#### Retrieving Attachment Binary Files
In order to get a binary attachment file, in API v3.1 you need to specify an Accept request header. Please always set it to Accept: application/octet-stream , regardless of the type of the file you are requesting:
```
txt
Copy
GET /attachments/{id}/file

Accept: application/octet-stream
```
### 7. Remove some obsolete headers from the API calls
We love simplicity, so we've removed custom HTTP headers that were required for API requests in v3:
- ocp-apim-subscription-key
- X-Site
If you're still sending X-Signature and X-Nonce headers, you can remove them too.
The only headers your client is required to send are:
- Authentication , its value is Bearer ACCESS_TOKEN_STRING ( ACCESS_TOKEN_STRING needs to be replaced by the actual access token).
- Content-Type , which has to be set to application/json
There is one new optional header your client may send which is named X-Business . This header can be used to specify the business instance the request is made against. This is only relevant for Sage Accounting users who have access to multiple business instances. If you do not pass this header, the user's lead business is used.
### 8. Prepare for Users with Multiple Businesses (optional)
The previous header for the business selection is has changed from X-Site to X-Business . For further information, please go to Multi Business .
You can identify the business being used for any request by the X-Business header included in the response.
### 9. JSON-only API
In contrast to API v3, API v3.1 only accepts requests with a content type of JSON:
```
txt
Copy
Content-Type: application/json
```
Requests with content types other than JSON are no longer possible and you will receive an error from the API.