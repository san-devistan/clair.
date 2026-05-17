Before you start developing for Sage Business Cloud Accounting, we need to make sure you have the following ready to go.
### Set up a trial business for development
You can create trial Sage Business Cloud Accounting businesses for all supported regions(CA, IE, UK) and for multiple subscription tiers of Sage Business Cloud Accounting. If you're unfamiliar with the subscription tiers it's worthwhile familiarising yourself with the differences in functionality to ensure the intended scope of your integration is applicable to the intended subscription tiers. Different Tiers
Below are links to create the trials, including links to the various product pages for further details on features each variant provides.
> TIP:
> You can use email services which support aliasing on the fly such as Google's
> task-specific email addresses
> to help you manage multiple environments from the same email account/inbox.
| Region | Information | Accounting Start | Accounting Standard | Accounting Plus |
| --- | --- | --- | --- | --- |
| United Kingdom | Details | Sign-up | Sign-up | Sign-up |
| Canada | Details | Sign-up | Sign-up | Sign-up |
| Ireland | Details | Sign-up | Sign-up |  |
#### Our API and the variants
Third mid tier released for UK May 2020
As Sage Business Cloud Accounting doesn't impose usage limits on the number of times a specific feature can be used, there are different variants available to better cater to the different needs of our customers. These variants must be considered when you plan for your integration.
We have documented endpoint availability throughout our Open API specification available as the API Reference . In the reference you will find for each endpoint details of both the regions, and variants supported:
#### Checking which variant a customer is using
It is advisable when first handling a new connection in your integration to establish which subscription your customer is using to ensure compatability.
To find this you must make a GET request to businesses endpoint, providing the id of the desired business:
```
url
Copy
GET /businesses{business_id}
```
Part of the response will contain a subscriptions array which will show which variant the business is using. The variants listed below are those which you integration will need to consider:
| Variant | Subscription ID | Notes |
| --- | --- | --- |
| Start | START |  |
| Start | MICRO | Created via Partner Edition |
| Accounting Standard | ACCOUNTS | Businesses created before May 2020 |
| Accounting Standard | ACCOUNTING | Businesses created after May 2020 |
| Accounting Plus | ACCOUNTING_10 | Tier available from May 2020 |
```
json
Copy
"subscriptions"
:
 
[

        
{

            
"created_at"
:
 
"2020-11-317T13:17:55Z"
,

            
"updated_at"
:
 
"2020-11-17T13:18:09Z"
,

            
"displayed_as"
:
 
"Accounting"
,

            
"id"
:
 
"ACCOUNTING"
,

            
"active"
:
 
true
,

            
"status"
:
 
"paying"
,

            
"accountant_pays"
:
 
false

        
}

    
]
,
```
Finally, it's also good practice to ensure you check that the active property is set to true before proceeding with the setup of your integration. If false, display an error to the user advising the business isn't active and handle the error, preventing the connection from proceeding.
### Sign up for a Sage Developer Account
This account allows you to register and manage your applications, obtain your client credentials and specify key details such as callback URLs.
You can sign up here using your GitHub account or an email address.
### Postman
When first starting out with the Accounting API, we recommend you use a client such as Postman to learn and explore.
Sign up for a free Postman account and download the Postman app .
### Looking to develop Sage Business Cloud Accounting in South Africa
The South African version of Sage Business Cloud Accounting is based on a different codebase to the versions availble in CA, IE and UK. We've included available resources for the South African version below:
South African API Spec
South African Developer Support email - api@accounting.sageone.co.za