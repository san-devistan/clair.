This section explains how to use OAuth 2.0 to allow Sage Accounting users to authorize your app to access their data without sharing their actual login details. To help build understanding, there is a full sequence diagram and detailed overview of the auth flow available here
At present only a single Authorization Code Flow is available to the API's. This flow requires the user of the Sage Business Cloud Accounting instance, to authenticate/grant access to the connecting application.
You can obtain a trial instance of Sage Business Cloud Accounting using the links provided in the Quick Start Guide .
With every API request, you must supply a valid Access Token within the Authorization header:
```
txt
Copy
Authorization: Bearer ‹‹Access Token››
```
An Access Token belongs to a single user account in Sage Business Cloud Accounting. This means a user can access all the data of their related businesses (a user might have access to one or more businesses .
When using the Accounting API with an API client, you can select the business you want to read or amend data by providing the X-Business header in each request that specifies the Business ID. The X-Business header is optional – if not set, the API will return data of the user's lead business.
## Obtain an Access Token
The steps outlined here explain how to obtain the access token and how to use the refresh token to get a new access token if the current one has expired.
### 1. Authorization request
Redirect to the Sage Accounting authorization server https://www.sageone.com/oauth2/auth/central?filter=apiv3.1 with the relevant URL query parameters:
##### Required params
|  |  |
| --- | --- |
| client_id | The ID of your app. |
| response_type | The type of response. This is always code . |
| redirect_uri | Your app callback URL. This is where your users will be sent after authorizing. You have to use a ''callback URL'' that has been configured when registering the app. |
In addition to the above required url parameters you will also need to pass the below header params:
- Content-Type: application/x-www-form-urlencoded
- Accept: application/json
Note - If you are using an external test client such as POSTMAN, you will need to register the default POSTMAN 'redirect_uri' in the app registry:
- https://www.postman.com/oauth2/callback - POSTMAN app
- https://oauth.pstmn.io/v1/browser-callback - POSTMAN browser
##### Optional params
|  |  |
| --- | --- |
| scope | Lets you specify the type of access to allow. Can be readonly or full_access . |
| country | If you already know the country of your business, you can pass a country parameter to simplify the auth flow by not showing the list of available countries. Valid values are: ca (for Canada) gb (for United Kingdom) ie (for Ireland) |
| locale | The locale can be used to define which language the subsequent authentication and authorisation screens are presented in, for a number of combinations shown below: en-CA (for Canadian in English) en-GB (for UK in English)they can also be combined with the country parameter, for example: https://www.sageone.com/oauth2/auth/central?country=US&locale=fr-CA |
| filter | You should always set this filter to apiv3.1 to only see countries that support API v3.1. This parameter is ignored if a country is provided. |
| state | A string used to protect against CSRF attacks. Although state is optional, we recommend including this. This should be a string that cannot be guessed. Note: If the value of the state parameter returned in the response does not match the state that was provided in the original request, it does not originate from the original request and you must not continue. |
| code_challenge | This PKCE parameter is a hashed or unhashed random string with a length between 43 and 128. See RFC 7636 Section 4.2 for detailed instructions how to create a value for this attribute. |
| code_challenge_method | This PKCE parameter contains the name of the hash function used to create the code_challenge . Only S256 or plain are valid. You must use S256 unless your client is unable to compute SHA256 hashes. |
##### Example Authorization Request
```
txt
Copy
GET https://www.sageone.com/oauth2/auth/central?filter=apiv3.1&response_type=code&client_id=4b6xxxxxxx710&redirect_uri=https://myapp.com/auth/callback&scope=full_access&state=random_string
```
When this endpoint is hit, the user is prompted to login to Sage Accounting and asked if they want to authorize your app.
If the user allows access to your app, they are redirected to the callback URL along with an authorization code which can be read from the response:
```
txt
Copy
GET https://myapp.com/auth/callback?code=GB%2F12abcxxxxxxxxxxxxf7d&country=GB&state=random_string
```
Note - If the optional country param has not been passed in the Authorization Request the user will first be redirected to the country/region selection screen. Based on the selection, the request will then be routed to one of two Authorization servers located in UK or NA. The country selected by the user authenticating must match the region of the Sage Business Cloud Accounting instance. For example, the authorization request will fail if the user has a UK business and selects the CA in the country/region selection screen.
If your application/integration supports only a single country/region it would be good practice to pass the country param together with the value to ensure your users are correctly routed. If you support more than one country/region but not all, consider providing your users with a UI country/region selector to allow the country value to be passed in the Authorization Request.
##### Possible errors
- access_denied : This error occurs when the Sage Accounting business user chooses not to authorize your app.
- invalid_request : This error occurs when a required parameter is missing, invalid or provided more than once.
- invalid_scope : This error occurs when the scope provided is invalid or unknown. You should ensure that scope in your request is either readonly or full_access .
- server_error : This generic error occurs when the authorization server encounters something unexpected that prevents it from fulfilling the request.
- temporarily_unavailable : This error occurs when the authorization server is unavailable. We recommend waiting for 10 minutes before retrying.
- unauthorized_client : This error occurs when the client is not authorized to perform this action. This may be due to an incorrect client_id value.
- unsupported_response_type : This error occurs when the authorization server does not support the method being used to request the code. You should ensure that the response_type in your request is code .
### 2. Exchange the authorization code for the access token
Note: the authorization code obtained above is for single-use only and expires after 60 seconds.
To exchange the authorization code for an access token and resource_owner_id, you should send a POST request with Content-Type: application/x-www-form-urlencoded and Accept: application/json set as headers to the token endpoint:
```
txt
Copy
POST https://oauth.accounting.sage.com/token
```
##### Required header parameters
Content-Type: application/x-www-form-urlencoded
Accept: application/json
##### Required body parameters
|  |  |
| --- | --- |
| client_id | Your app Client ID. You can get this value from the App Details . |
| client_secret | Your app Client Secret. You can get this value from the App Details . |
| code | The authorization code provided in the response from the previous step. |
| grant_type | This must be authorization_code . |
| redirect_uri | Your app callback URL. You must provide this value exactly as configured in the App Details , you must not add any additional params. |
##### Optional params
|  |  |
| --- | --- |
| code_verifier | This is the original (not hashed) random string, that was generated by the client before requesting an authorization code. If the authorization code was requested with PKCE parameter, the code_verifier is required for requesting an access token. See section 4.5 of RFC 7636 for details. |
##### Example request
```
txt
Copy
POST https://oauth.accounting.sage.com/token
Content-Type: application/x-www-form-urlencoded
Accept: application/json

client_id=4b6xxxxxxx710
&client_secret=iNuxxxxxxxxxxtm9
&code=12axxxxxxxxxxxxf7d
&grant_type=authorization_code
&redirect_uri=https://myapp.com/auth/callback
```
The response includes the access token:
```
json
Copy
{

  
"access_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjNwX2VsSXBnQkNwY0dRYkpzNGVUTFlzYWdQVjQ1Z01pU1RidElfSWVxTzA9In0.eyJqdGkiOiJiMWVmZWQ1Zi01YWE2LTQ2YjctYmNkYi05ZDM5NjgzMDFjZWYiLCJpYXQiOjE1Mjc1MTAwMzMsImV4cCI6MTUyNzUxMDMzMywiaXNzIjoib2F1dGguYXdzLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwic3ViIjoiNDQ0IiwiYXVkIjoiYXBpLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwiYXpwIjoiMzMzIiwiY291bnRyeSI6InVzIiwic2NvcGVzIjoiYWNjb3VudHM6cncgYWNjb3VudGluZzpydyBjb3JlOnJ3In0.NnE2Wxt5BTZa6m2vh8fcH54gyWRFciZWuVq8KrtbLJLatMUHxQAo4WY3Tht6HmhpI-oq-yxg5LADtvRRDbxFrBTnXOGm6Go3-UdBC6OADo_18PrtpN6e1FiY-BV9k16zJyiB_R8pQXPTVSp_9XXBqpNSJGqJ__sIdYPLx0wrkWorI73DLR_0KSFVs5dFufPpdhmBZ_BhfSd3Fe1B4ErVo8m28jP_6QFNt2ssZAxufidVnk3wXAyqN0fka-tMjK7OrEenGQl_PAVLxhvMhpw6PRDxKYfoPUmmcaqTkZLK7aTFP0m23BtRwSs6ezRqzQzsbUgIWkUTSzh6tfVFDVheEz8tLhctU_OqvcoNmufCMV7kDYQ0_JRcGnMN5MTaMnVG49NQ0sWsmsD9drOfuN6bJeJFu-F5GAL3BAUP6UZcunj0a9I1WAEs0Zf5sEEQkDK2VOJ-mh5JVOkdbUnfverETaI5i0X_kCVgjP1q1Glq5xv8Mm85kO-0kLuO3VOHAM70_ln9e8_gcIIpBuerVFrwFUX1SFBu1JUNWq6_TfIh3WkehkYpK33aQy-dnRg0dgkx_MVyGenIvqvcTGzd9l7SNgqyzoOeY01LJb-NQBKDgGFbyNrUhvud7f4O68AaabDDntSQmlBrxPNqF-bAPYlpb90kD6NKUb9YiM7z6wnij4o"
,

  
"scope"
:
 
"full_access"
,

  
"token_type"
:
 
"bearer"
,

  
"expires_in"
:
 
300
,

  
"refresh_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjNwX2VsSXBnQkNwY0dRYkpzNGVUTFlzYWdQVjQ1Z01pU1RidElfSWVxTzA9In0.eyJqdGkiOiI0Yjk1MmQxYy04OGEwLTQxZjUtYjdiNS0wMDVmOTc4ODg5YjYiLCJpYXQiOjE1Mjc1MTAwNjIsImV4cCI6MTUyNzUxMDM2MiwiaXNzIjoib2F1dGguYXdzLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwic3ViIjoiNDQ0IiwiYXVkIjoiYXBpLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwiYXpwIjoiMzMzIiwiY291bnRyeSI6InVzIiwic2NvcGVzIjoiYWNjb3VudHM6cncgYWNjb3VudGluZzpydyBjb3JlOnJ3In0.QQZ4bzOnrGUnNjYsJfK_FBNxKz1jGpF0Z-ur4wCoOTERi2W4iosX1N7ksdkRfUKSJlWlOfPp2XNMxszONmqZHczPjmVNUc0er1qo-oDmPJfbcH305sWmMFqspfoaUOCVXu_TcAh5Dz_zBUAznhBGbx603SBidvjMIa9Jncy9SjjYrJqhzz4y1-vgST4hccGCbsORGB_U6yKgfS6bupzoLVDdCj2bsgG4hSiDqagXbpAsoh9vR2UBALsJz8PUEEW7qA81B7SjtLUiHbvzryKhMt-7Q631D2j_iQaGpld1aICMBfAL0h5wiJMjf6r9R-EcJOmSzWtCcTI0y-PJfprinxIo3Mg_sljfoe_0wrEikIWRQIQa3D40nhMnLtqevCftPscQjLO_vf_ERUICHTiJdXiKsSwmUp9EGKnWC_qEKOcVA-o7y_vsAuFODsUvXC9k6Z7sVCg2k37k8r4NqoJ82d_l4ZrgNnvV6VEL2xtuASIA46-MlWWTPTbuQkzyfmVQW1gg50q4tNT8XkvVil6F2rNCiLSA2vhsH8lLu8mcSfCqVaPJh9-XvtjSkKUAtjgA3aa8bJEuUXFRn-U6Z7TyMZGHRZCEg-1IZa49rOQ5FhfvD85MQL466vAdr7X1zwVqxvr1T3UW58NuKMr3FyAWRyQhp_bBB8AXdf4W1BIeYLk"
,

  
"refresh_token_expires_in"
:
 
2678400
,

  
"requested_by_id"
:
 
"c3c32d1c-41ba-483f-a3ff-49fdb57b9c38"

}
```
- access_token is used for authenticating API requests. It expires after five minutes. Make sure to not share this token and to not store it in an unsafe location. Reserve up to 2048 bytes in your data storage for this token.
- scope informs you about the scope, ie. access rights, that have been requested and authorized. Can be full_access and readonly
- token_type is always bearer
- expires_in informs you about the lifetime of the access token, which is 300 seconds/5 minutes
- refresh_token is used to obtain new access and refresh tokens when the access token expired. The refresh token itself expires after 31 days, users will have to freshly authorize your app if you do not refresh your tokens within that time. You MUST NOT share this token or store it in an unsafe location, eg. an unencrypted browser session. Reserve up to 2048 bytes in your data storage for this token.
- refresh_token_expires_in informs you about the lifetime of the refresh token, which is 2678400 seconds/31 days.
- requested_by_id is the ID of the user who authorized your authorization request.
##### Possible errors
- invalid_request : This error occurs when a required parameter is missing, invalid or provided more than once.
- invalid_grant : This error occurs when the grant_type provided is invalid or unknown. The authorization code could be expired (after 60 seconds), already used or otherwise unknown. This error also occurs when the refresh token is expired or revoked.
- invalid_client : This error occurs when the client cannot be authenticated. For example, if the client_id or client_secret are incorrect or invalid.
- unauthorized_client : This error occurs when the client is not authorized to use the specified grant_type .
- unsupported_grant_type : This error occurs when the authorization server does not support the grant_type specified. You should ensure that the grant_type in your request is authorization_code or refresh_token .
## Renew an Access Token
You can use the refresh token to obtain a new access token if the current one has expired. This means that your users aren't required to authorize your app every time you request a new token.
Send a POST request with Content-Type: application/x-www-form-urlencoded and Accept: application/json set as headers and the body set with the required parameters to the token endpoint https://oauth.accounting.sage.com/token
##### Required header parameters
Content-Type: application/x-www-form-urlencoded
Accept: application/json
##### Required body parameters
|  |  |
| --- | --- |
| client_id | Your app Client ID. |
| client_secret | Your app Client Secret. |
| grant_type | This must be refresh_token . |
| refresh_token | The refresh token provided in the response from the previous step. |
##### Example request
```
txt
Copy
POST https://oauth.accounting.sage.com/token
Content-Type: application/x-www-form-urlencoded
Accept: application/json

client_id=4b6xxxxxxx710
&client_secret=iNuxxxxxxxxxxtm9
&grant_type=refresh_token
&refresh_token=eyJxxxxxxxxxxYLk
```
The response includes the new access token and a new refresh token:
```
json
Copy
{

  
"access_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjNwX2VsSXBnQkNwY0dRYkpzNGVUTFlzYWdQVjQ1Z01pU1RidElfSWVxTzA9In0.eyJqdGkiOiJiMWVmZWQ1Zi01YWE2LTQ2YjctYmNkYi05ZDM5NjgzMDFjZWYiLCJpYXQiOjE1Mjc1MTAwMzMsImV4cCI6MTUyNzUxMDMzMywiaXNzIjoib2F1dGguYXdzLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwic3ViIjoiNDQ0IiwiYXVkIjoiYXBpLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwiYXpwIjoiMzMzIiwiY291bnRyeSI6InVzIiwic2NvcGVzIjoiYWNjb3VudHM6cncgYWNjb3VudGluZzpydyBjb3JlOnJ3In0.NnE2Wxt5BTZa6m2vh8fcH54gyWRFciZWuVq8KrtbLJLatMUHxQAo4WY3Tht6HmhpI-oq-yxg5LADtvRRDbxFrBTnXOGm6Go3-UdBC6OADo_18PrtpN6e1FiY-BV9k16zJyiB_R8pQXPTVSp_9XXBqpNSJGqJ__sIdYPLx0wrkWorI73DLR_0KSFVs5dFufPpdhmBZ_BhfSd3Fe1B4ErVo8m28jP_6QFNt2ssZAxufidVnk3wXAyqN0fka-tMjK7OrEenGQl_PAVLxhvMhpw6PRDxKYfoPUmmcaqTkZLK7aTFP0m23BtRwSs6ezRqzQzsbUgIWkUTSzh6tfVFDVheEz8tLhctU_OqvcoNmufCMV7kDYQ0_JRcGnMN5MTaMnVG49NQ0sWsmsD9drOfuN6bJeJFu-F5GAL3BAUP6UZcunj0a9I1WAEs0Zf5sEEQkDK2VOJ-mh5JVOkdbUnfverETaI5i0X_kCVgjP1q1Glq5xv8Mm85kO-0kLuO3VOHAM70_ln9e8_gcIIpBuerVFrwFUX1SFBu1JUNWq6_TfIh3WkehkYpK33aQy-dnRg0dgkx_MVyGenIvqvcTGzd9l7SNgqyzoOeY01LJb-NQBKDgGFbyNrUhvud7f4O68AaabDDntSQmlBrxPNqF-bAPYlpb90kD6NKUb9YiM7z6wnij4o"
,

  
"scope"
:
 
"full_access"
,

  
"token_type"
:
 
"bearer"
,

  
"expires_in"
:
 
300
,

  
"refresh_token"
:
 
"eyJhbGciOiJSUzUxMiIsImtpZCI6IjNwX2VsSXBnQkNwY0dRYkpzNGVUTFlzYWdQVjQ1Z01pU1RidElfSWVxTzA9In0.eyJqdGkiOiI0Yjk1MmQxYy04OGEwLTQxZjUtYjdiNS0wMDVmOTc4ODg5YjYiLCJpYXQiOjE1Mjc1MTAwNjIsImV4cCI6MTUyNzUxMDM2MiwiaXNzIjoib2F1dGguYXdzLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwic3ViIjoiNDQ0IiwiYXVkIjoiYXBpLnNiYy1hY2NvdW50aW5nLnNhZ2UuY29tIiwiYXpwIjoiMzMzIiwiY291bnRyeSI6InVzIiwic2NvcGVzIjoiYWNjb3VudHM6cncgYWNjb3VudGluZzpydyBjb3JlOnJ3In0.QQZ4bzOnrGUnNjYsJfK_FBNxKz1jGpF0Z-ur4wCoOTERi2W4iosX1N7ksdkRfUKSJlWlOfPp2XNMxszONmqZHczPjmVNUc0er1qo-oDmPJfbcH305sWmMFqspfoaUOCVXu_TcAh5Dz_zBUAznhBGbx603SBidvjMIa9Jncy9SjjYrJqhzz4y1-vgST4hccGCbsORGB_U6yKgfS6bupzoLVDdCj2bsgG4hSiDqagXbpAsoh9vR2UBALsJz8PUEEW7qA81B7SjtLUiHbvzryKhMt-7Q631D2j_iQaGpld1aICMBfAL0h5wiJMjf6r9R-EcJOmSzWtCcTI0y-PJfprinxIo3Mg_sljfoe_0wrEikIWRQIQa3D40nhMnLtqevCftPscQjLO_vf_ERUICHTiJdXiKsSwmUp9EGKnWC_qEKOcVA-o7y_vsAuFODsUvXC9k6Z7sVCg2k37k8r4NqoJ82d_l4ZrgNnvV6VEL2xtuASIA46-MlWWTPTbuQkzyfmVQW1gg50q4tNT8XkvVil6F2rNCiLSA2vhsH8lLu8mcSfCqVaPJh9-XvtjSkKUAtjgA3aa8bJEuUXFRn-U6Z7TyMZGHRZCEg-1IZa49rOQ5FhfvD85MQL466vAdr7X1zwVqxvr1T3UW58NuKMr3FyAWRyQhp_bBB8AXdf4W1BIeYLk"
,

  
"refresh_token_expires_in"
:
 
2678400
,

  
"requested_by_id"
:
 
"c3c32d1c-41ba-483f-a3ff-49fdb57b9c38"

}
```
## Revoke a Refresh Token
You revoke a refresh token so it is no longer valid for obtaining access tokens. Please note that you cannot revoke access tokens, they are valid during their entire lifetime of five minutes. Once a refresh token is revoked, it cannot be used to obtain a new set of access and refresh tokens, so that the user will need to authorize your app again once the access token expires.
Send a POST request with Content-Type: application/x-www-form-urlencoded to the revoke endpoint https://oauth.accounting.sage.com/revoke
##### Required parameters
|  |  |
| --- | --- |
| client_id | Your app Client ID. |
| client_secret | Your app Client Secret |
| token | The refresh token you wish to revoke. |
##### Example request
```
txt
Copy
POST https://oauth.accounting.sage.com/revoke
Content-Type: application/x-www-form-urlencoded

client_id=4b6xxxxxxx710
&client_secret=iNuxxxxxxxxxxtm9
&token=eyJxxxxxxxxxxYLk
```
On success, you will see the following response with HTTP status 200:
```
json
Copy
{

  
"success"
:
 
"ok"

}
```
##### Troubleshooting oAuth Issues
We've created a troubleshooting guide which provides a step by step checklist and highlights the common issues often seen when attempting to authenticate or exchange tokens. oAuth Troubleshooting