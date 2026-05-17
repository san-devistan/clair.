This tutorial was made with Postman 5.5.0.
## Developer and Client Registration
Sign up for a developer account, subscribe to the API and register your app as described in the How to Create Your First App guide. After this, you will have
- the client ID of your registered app
- the client secret of your registered app
- one or more callback URLs. For Postman, you'll need to register https://www.postman.com/oauth2/callback for the app or if you're using the browser https://oauth.pstmn.io/v1/browser-callback
## Setup
Download the Postman collection using this link:
- Sage Accounting Postman Collection
Use the Import feature of Postman and select these files to start using them. To make requests for businesses in other countries, please substitute the path accordingly.
Go to www.sageone.com and register for a new free trial.
## Authorize API Access
Select "OAuth 2.0" as authorization type and add the authorization data to the "Request Headers". Then click "Get New Access Token" and enter the data as seen in the following screenshot. Use your own values for YOUR_CLIENT_CALLBACK_URI , YOUR_CLIENT_ID , YOUR_CLIENT_SECRET . You can use any value for the state parameter YOUR_RANDOM_VALUE . Set Client Authentication to Send client credentials in body .
After clicking "Request Token", you will be taken to the login screen of Sage Accounting. Use the credentials of the account you have previously created. You will then be asked to give the Postman API client access to your accounting data. After clicking "Accept", you will see such a screen:
Click on "Use Token" to complete this step.
## Making API Requests
Three HTTP request headers must be present to successfully make API requests.
- Authorization is handled automatically by Postman
Select an endpoint and click "Send" to fire the request.
The access token will be valid for 5 minutes. You will then have to require a new access token as described above. In your own app, you should refresh the token after its expiration, so the user needs to grant access only once.
Trouble Shooting: Try to remove the cookies in Postman, when authorization fails. This may especially become necessary when you are switching between different countries on Sage Accounting.