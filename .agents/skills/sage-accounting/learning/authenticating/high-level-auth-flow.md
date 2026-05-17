High‑level overview This is a standard OAuth 2.0 Authorization Code flow with:
- Multiple Sage edge/central routing redirects
- Centralised Sage Identity (Auth0-based) login
- Username → Password → MFA (OTP) UI steps
- A user consent (allow) screen
- Final token exchange via a backend call
## Sequence diagram
```
Mermadi dialog
```
### 1. OAuth authorisation request (app → Sage)
Request
```
txt
Copy
GET https://www.sageone.com/oauth2/auth/central?filter=apiv3.1

Example url encoded request
GET https://www.sageone.com/oauth2/auth/central?filter=apiv3.1&response_type=code&client_id=9b1d0693-e32d-4b5d-bbdd-9681851119c6%2F303b24c1-804d-479f-b364-56c2f429b3e8&state=test&scope=full_access&redirect_uri=https%3A%2F%2Fwww.postman.com%2Foauth2%2Fcallback
```
Purpose
- Initiates OAuth flow for Sage Accounting API
- Allows user to select the region of their business CA, IE or UK
- Requests an authorisation code
Key parameters
```
txt
Copy
response_type=code
client_id=<client/app id>
scope=full_access
redirect_uri=https://www.postman.com/oauth2/callback
state=test
```
✅ No user input yet . ✅ Browser-based flow starts
### 2. Sage routing & regional redirects (automatic)
The request is routed through Sage’s infrastructure based on the region selected from the UI:
sageone.com central.uk.sageone.com accounts-extra.sageone.com
These redirects:
- Preserve all OAuth parameters
- Establish Sage session cookies
- Route the user to the correct regional + identity endpoint
✅ All automatic 🔁 HTTP 302 redirects only
### 3. Hand-off to Sage Identity Provider (Auth0)
Redirect
```
txt
Copy
GET https://id.sage.com/authorize
```
This switches from Sage app infrastructure to the central identity service. OIDC scopes requested openid profile email offline_access user:full
✅ This is where interactive authentication begins
### 4. User login – Identifier (UI input #1)
UI page GET /u/login/sage/identifier
User enters:
- Email address / Username
Form POST POST /u/login/sage/identifier
✅ First visible UI ✅ Validates identity and chooses auth path
### 5. User login – Password (UI input #2)
UI page GET /u/login/password
User enters:
- Password
Form POST POST /u/login/password
✅ Standard credentials step ✅ On success, flow continues; on failure, error UI shown
### 6. Multi-Factor Authentication (OTP) (UI input #3)
Because MFA is enabled for the user: UI page GET /u/mfa-otp-challenge
User enters:
- One-time password (OTP) (from authenticator app, SMS, etc.)
Form POST POST /u/mfa-otp-challenge
✅ Required user interaction ✅ Completes authentication
### 7. Identity success → resume OAuth flow (automatic)
After MFA: GET /authorize/resume
Identity service completes login and redirects back to Sage:
```
txt
Copy
GET https://accounts-extra.sageone.com/auth/cloudid/callback
```
✅ Authentication finished 🔁 Back to OAuth authorisation context
### 8. User consent / authorisation (UI input #4)
This page will only show if there is no pre existing connection to the application:
- The first time the user authenticates
- Tokens have been revoked
- User has removed app via UI Manage Apps and Connections page
OAuth auth page
```
txt
Copy
GET /oauth2/auth
```
Followed by:
```
txt
Copy
GET /oauth2/allow/aws
```
User action:
Clicks “Allow / Approve access”
This grants the application:
- Requested scopes (full_access)
- Access to the user’s Sage Accounting data
✅ Explicit user consent step (OAuth requirement)
### 9. Redirect back to application with authorisation code
Final browser redirect
```
txt
Copy
GET https://www.postman.com/oauth2/callback
```
With query parameters:
```
txt
Copy
?code=GB/<authorization_code>
&state=test
```
✅ OAuth authorization code issued ✅ User interaction complete
### 10. Token exchange (backend → Sage, no UI)
Request
```
txt
Copy
POST https://oauth.accounting.sage.com/token
```
Authentication
HTTP Basic Auth (client_id : client_secret)
Body
```
txt
Copy
grant_type=authorization_code
code=<authorization_code>
redirect_uri=https://www.postman.com/oauth2/callback
```
Response
- access_token
- refresh_token
- expires_in
- scope=full_access
✅ Server-to-server only ✅ No user involvement
Summary diagram
```
txt
Copy
App → Sage OAuth
      ↓ (redirects)
Sage Central / Accounts
      ↓
Sage Identity (Auth0)
      → Email
      → Password
      → MFA (OTP)
      ↓
User Consent (Allow)
      ↓
App Callback (code)
      ↓
Token Endpoint
```
Key takeaways
- UI inputs required:
Email / Username Password MFA OTP Consent (Allow access)
- Core redirects happen at:
Sage regional routing Identity provider (id.sage.com) Post-auth back to /oauth2/auth Final redirect to app callback
- Security posture
OIDC + OAuth 2.0 MFA enforced Separation of identity, consent, and token issuance