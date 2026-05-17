### Mermaid Decision Flowchart — Sage Accounting OAuth Troubleshooting
```
Mermadi dialog
```
#### Authentication flow
The authentication flow between a 3rd party integration and a Sage Business Cloud Accounting Business requires the connecting application to be granted access by a registered user of the business. When a user grants access to the requesting application they are providing access to all businesses they have access to.
The number of businesses they have access to could potentially change as and when they are added or removed from businesses. This is particularly common in accountancy practices. The below guides provide a deeper insight as to how users with access to multiple businesses should select the business they intend the application to access.
- Multi Business
- Partner Edition
#### Checklist
- You've read the Authentication Guide and High level Auth Flow .
- Your application has been registered in the developer self service portal and the correct callback url's have been added. Note - callback url's are case sensitive.
- A Sage Business Cloud Accounting instance has been created to test the oAuth flow Quick Start Guide . You're able to sign into the Sage Business Cloud Accounting instance and view the welcome dashboard.
- The parameters passed in the auth url match those registered in the developer portal and the country filter(optional) passed matches the country the business is registered for. For example if GB is passed and the business is registered for the US the auth will fail.
#### Common issues
- The callback url passed in the initial auth request does not match a callback url registered in the app registry. Registered callback url's are case sensitive and must match the callback passed in the auth request.
- The developer attempts to authenticate using the log in credentials for the app registry. The log in details required when authenticating are those used to create a trial business.
- The country selected from the region selection or passed as a parameter in the auth request does not match the region the business is registered in.
- The required header parameters have not been set Content-Type: application/x-www-form-urlencoded Accept: application/json
- The refresh_token passed to obtain a new access token is invalid. This is due to one of three issues: The refresh_token has expired. The user has revoked access to the connecting application. The refresh_token has been used before. The refresh_token although unused is not the most recent refresh_token stored by the auth service.
#### Invalid user credentials
#### Country selection does not match country of business
#### Invalid client credentials
#### Incorrect or unregistered callback url
#### Storing tokens
On the successful exchange of the auth_code for the access and refresh tokens, the tokens will need to be stored in a secure location.
The storing and exchanging of tokens can present complications and issues with concurrency especially when ensuring only a single token refresh request is made when or if multiple network calls encounter the need to refresh a token.
There are many libraries and topics covering this subject and we advise implementing a suitable solution which prevents the possibility of multiple refresh_token requests being sent to the auth server asynchronously.
If the auth server has issued a new set of tokens and one or more other requests are received by the auth server containing the now used refresh_token the auth server will return an error.