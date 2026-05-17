Using Postman, you can create your first request to the Sage Business Cloud Accounting API for businesses created in Canada, Ireland and the UK. The requests used in this Quick Start Guide are available as a Postman collection and rely on an environment to store the required environment variables.
Postman uses default callback url's which you'll need to add to your registered application in the app registry .
- https://www.postman.com/oauth2/callback - Postman app
- https://oauth.pstmn.io/v1/browser-callback - Postman browser
Import the Postman collection and environment
1. Download the Postman collection and environment Collection and environment .
2. Extract the collection and environment files from the downloaded zip file.
3. Open Postman and click Import .
4. Select the v3.1_sbca_environment_postman.json and v3.1_sbca_request_collection.postman.json files and import.
5. Select and edit the environment variables adding client_id and client_secret. Don't forget to save the changes.
Authorisation request
1. Ensure the V3.1 SBC Accounting Production Environment has been selected from the top right of the POSTMAN app.
2. Click on the Collections tab in Postman to view the available collections including the SBCA V3.1 Request Collection. Prior to sending a request from the collection, we must first obtain an access token. Authentication .
3. Expand the Authentication folder in the SBCA V3.1 Request Collection, select Initial Auth Request and select the Authorization tab.
4. To configure a new token, change the name of your app to a name of your choice and hover your cursor over the client_id environment variable to ensure it is being populated.
5. Clear cookies and Get New Access Token
6. Select the locale of the business you are going to connect with. This should be Canada, Ireland or the UK.
7. Enter the user information requested to grant the POSTMAN client application access to your Sage business data. Create a Trial Business .
8. The successful auth handshake returns the access_token and refresh_token. The tokens need to be stored in the associated environment variable to ensure they can be used in future requests. First, highlight the access_token, right click and set the access_token environment variable. You'll also need to set the refresh_token value in the associated refresh_token environment variable.
9. It's best practice to use the business_id in all requests made to the API. This ensures the request is correctly routed to the intended business. The businesses API is the only request that does not require the X-Business header param as it uses the user id to obtain the businesses the user has access to. From the SBCA V3.1 Request Collection expand the Business folder and select the GET Businesses request. Examine the headers and note the Authorization header value is being provided by the access_token environment variable. The access_token is maintained through the use of a pre-request script which exchanges the refresh_token when the access_token is close to expiry. Multi Business . Send the request and view the body in the response.
```
JSON
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

    
"$items_per_page"
:
 
2147483647
,

    
"$items"
:
 
[

        
{

            
"displayed_as"
:
 
"Test Account for SBCA"
,

            
"id"
:
 
"5ffd916d9e83459da41a4a491622af90"
,

            
"$path"
:
 
"/businesses/5ffd916d9e83459da41a4a491622af90"

        
}
,

        
{

            
"displayed_as"
:
 
"Test Account 2"
,

            
"id"
:
 
"1266598edb34424db32efadc51e5923a"
,

            
"$path"
:
 
"/businesses/1266598edb34424db32efadc51e5923a"

        
}
,

        
{

            
"displayed_as"
:
 
"Test Account 3"
,

            
"id"
:
 
"e2b8207c242d4eb6866bc2ee7d9d4f47"
,

            
"$path"
:
 
"/businesses/e2b8207c242d4eb6866bc2ee7d9d4f47"

        
}

    
]

}
```
1. Set the business_id environment variable with the business id you wish to direct your requests to.
2. Make a request to the intended business. From the SBCA V3.1 Request Collection expand the Contacts folder and select the GET Contacts request. Examine the header params for the request and note the addition of the X-Business param which is set with the business_id environment variable. Hover your cursor over the value to ensure it is set. If not, repeat step 8. Depending on the state of your data there may only be two default contacts returned in the response.
```
JSON
Copy
{

    
"$total"
:
 
2
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

            
"id"
:
 
"bd7860529a6445f7898b4418feced4b1"
,

            
"displayed_as"
:
 
"HMRC Reclaimed (HMRC Rec)"
,

            
"$path"
:
 
"/contacts/bd7860529a6445f7898b4418feced4b1"

        
}
,

        
{

            
"id"
:
 
"eaab22cbff1e4f33883fa39961124ac7"
,

            
"displayed_as"
:
 
"HMRC Payments (HMRC Pay)"
,

            
"$path"
:
 
"/contacts/eaab22cbff1e4f33883fa39961124ac7"

        
}

    
]

}
```
All of the other requests in the collection use the Pre_request script previously mentioned meaning the POSTMAN client app will maintain the access token without the need to re-auth. To create new requests and add to the collection it is recommended that one of the existing requests is duplicated and then edited to suit. This ensures the preservation of the required header params and the pre-request script for token refresh.