### Overview

The introduction of v3.1 of the Sage Accounting API provided opportunity to reevaluate and improve the documentation available to our third party developers. The documentation now provides reference and detail of all available endpoints along with overviews of regional differences, accounting terminology and consumption.

A [full guide to Authorizing](https://developer.sage.com/accounting/docs/v1.0.0/guides/learning/authenticating/authentication) is available to ensure the OAuth2 flow required by the app is followed. We highly recommend using the `state` parameter documented in the guide to ensure that the OAuth2 spec is closely followed and implemented.

### Multi Business and Business GUIDs

It is probable that users of your intended application or integration may have access to more than a single business (multi business) and require functionality to select from a list of available businesses. It is not possible to determine if the user has access to multiple businesses from the authentication response and an additional request to the `businesses` endpoint is required. Below is a `businesses` endpoint response for a user with access to multiple businesses:

json

```
{
  "$total": 3,
  "$page": 1,
  "$next": null,
  "$back": null,
  "$items_per_page": 2147483647,
  "$items": [
    {
      "displayed_as": "Business One",
      "id": "0d40342d0287cd6b13555c54afca6c90",
      "$path": "/businesses/0d40342d0287cd6b13555c54afca6c90"
    },
    {
      "displayed_as": "Business Two",
      "id": "49c196153fb1524b7d888cece84e8b12",
      "$path": "/businesses/49c196153fb1524b7d888cece84e8b12"
    },
    {
      "displayed_as": "Business Three",
      "id": "b88ee3a4ebb47c0c515d7ae56dc0bccf",
      "$path": "/businesses/b88ee3a4ebb47c0c515d7ae56dc0bccf"
    }
  ]
}
```

The id of the user selected business should then be passed as a `X-Business` header parameter for all future requests made for this business. Should the user wish to swap between businesses the `X-Business` id should be changed to that of the newly selected business.

If your application or integration maintains a localised representation of the Sage Accounting data it is important that the architecture used allows data to be identified and related by business id. This will ensure data from two or more different businesses cannot be morphed into a single representation.

In the event of an `X-Business` header parameter not being present in a request, the API will return or post data with the lead business `X-Business` id. The lead business is defined as the first business the user created and is returned using the below request:

txt

```
GET /businesses/lead
```

It is unlikely but possible that a lead business may change. The below scenarios are two of the possible ways in which a lead business may change:

*   The users first created business is deleted.
*   The user was previously invited to a business or businesses and subsequently creates their own business.

You can always identify the business that has been used for a request, as the API sets a `X-Business` header with the business id in its responses. This can be used to detect a lead business change: Store the lead business id upon user registration. On subsequent requests, compare the stored value to the value of the `X-Business` header in the response.

The `X-Business` response header is returned on every endpoint but `/businesses` and `/user`.

Best practice is to always send a `X-Business` header with your requests. Using the lead business feature is great for development, you can try the API quickly without having to deal with multi business. In production, it is safer to explicitly define the request's business context.

### Storing Tokens

Storing authorization and refresh tokens generated from the OAuth 2.0 flow is a topic widely discussed online. Solutions and guidance vary depending on the type of application you have created, the [OAuth 2.0](https://oauth.net/2/) docs are a good reference to the flows and patterns your flow should follow and are based on app type. Wherever possible try to reduce the number of times a user is required to re-authenticate in your app. For example, a native web app with its own backend storage should be able to securely store tokens and allow users access without having to re-authenticate after every session.

Sage Business Cloud Accounting associates user initials against transactions created by the authenticated user making it possible to trace transactional activity to an individual. The API relies on the access_token passed in the header params of the API request to determine the authorised user and associate the initials to the transaction. If you maintain only tokens for a single user in a multi user integration, each transaction created via your application will have the same user initials making it very difficult to trace transactional activity.

In multi user integrations, this raises the requirement of each individual user of the connecting application authenticating and maintaining individual user access and refresh tokens to ensure each API request sent from the application uses the correct user token to ensure the resulting transactional activity shows the correct user initials.

#### Our API and the variants

Third mid tier released for UK May 2020

As Sage Business Cloud Accounting doesn't impose usage limits on the number of times a specific feature can be used, there are different variants available to better cater to the different needs of our customers. These variants must be considered when you plan for your integration.

We have documented endpoint availability throughout our Open API specification available as the [API Reference](https://developer.sage.com/accounting/apis/sagebusinesscloudaccounting/3.1.0/accounting). In the reference you will find for each endpoint details of both the regions, and variants supported:

![Image 1: Endpoint availability](https://assets.devx.sage.com/assets/accounting/images/resources/endpoint-availability.png)

#### Checking which variant a customer is using

It is advisable when first handling a new connection in your integration to establish which subscription your customer is using to ensure compatability.

To find this you must make a GET request to businesses endpoint, providing the id of the desired business:

url

```
GET /businesses{business_id}
```

Part of the response will contain a subscriptions array which will show which variant the business is using. The variants listed below are those which you integration will need to consider:

| **Variant** | **Subscription ID** | **Notes** |
| --- | --- | --- |
| Start | START |  |
| Start | MICRO | Created via Partner Edition |
| Accounting Standard | ACCOUNTS | Businesses created before May 2020 |
| Accounting Standard | ACCOUNTING_10 | Businesses created after May 2020 |
| Accounting Plus | ACCOUNTING | Tier available from May 2020 |

json

```
"subscriptions": [
		{
			"created_at": "2020-11-317T13:17:55Z",
			"updated_at": "2020-11-17T13:18:09Z",
			"displayed_as": "Accounting",
			"id": "ACCOUNTING",
			"active": true,
			"status": "paying",
			"accountant_pays": false
		}
	],
```

It's also good practice to ensure you check that the `active` property is set to `true` before proceeding with the setup of your integration. If false, display an error to the user advising the business isn't active and handle the error, preventing the connection from proceeding.

### HTTP 4xx Client Errors

Client errors are raised due to invalid data in the request. In most cases the error message should help to figure out the issue.

#### HTTP 403 Forbidden

HTTP 403 errors will be returned on Accounting API endpoints when the user does not have sufficient permissions to execute the requested action. This usually happens when the user is not owner of the business and does not have the required role to access this area.

It is good practice to track 403 errors: When your client receives a 403 response on each and every request, it should discard the access and refresh token and request a new authorization from the user.

#### HTTP 400 Bad Request Response on the Token Endpoint

The token endpoint will return HTTP 400 Bad Request responses when the client is using invalid client credentials, an invalid authorization code or an invalid refresh token. The error response has an `error` attribute, which will be `invalid_client` when the client did not use correct credentials and `invalid_grant` when using an expired authorization code or refresh token. The `error_description` attribute in the response will give you more information about the reason for the failure.

### API Idempotency

By default idempotency is not supported in the API and needs to be invoked within the request. If your app or integration is posting data to Sage Accounting we highly recommend its implementation, our fully documented implementation guide can be found [here](https://developer.sage.com/accounting/docs/v1.0.0/guides/learning/key-concepts/best-practices).

If there is ever an issue which results in an unhandled 500 error on a POST request, it is possible that the request completed successfully and the transaction exists in the data

### Rate Limiting

To ensure the availability and integrity of the Accounting API at all times, a request rate limit has been set. The rate limit is set against each single client application with the following limitations:

*   Rate limit of 1,296,000 requests per app per day
*   Maximum of 150 concurrent requests at any time (per app)

In the event of the rate limit being exceeded, the Accounting API will return a HTTP 429 error response. We recommend wait and repeat functionality to be implemented in your app in order to handle any 429 response.

### Caching Data

Exceeding API rate limits can be problematic for any application or user experience. To ensure your application is as efficient as possible, consideration of the types of data you are obtaining and maintaining should help highlight static or seldom updated data types. Static data is constant and can be shared for all users of the same language.

Consider excluding requests to the following API endpoints in frequent data synchronization events:

*   address_regions
*   address_types (Static)
*   artefact_statuses
*   attachment_context_types (Static)
*   bank_account_types (Static)
*   business_exchange_rates
*   business_types (Static)
*   catalog_item_types (Static)
*   contact_person_types (Static)
*   contact_types (Static)
*   corrective_reason_codes
*   countries (Static)
*   countries_of_registration
*   country_groups (Static)
*   currencies (Static)
*   email_settings
*   eu_goods_services_types (Static)
*   eu_sales_descriptions (Static)
*   financial_settings
*   invoice_settings
*   journal_code_types (Static)
*   product_sales_price_types (Static)
*   service_rate_types (Static)
*   tax_schemes
*   tax_types (Static)
*   transaction_types (Static)

### Attributes All

The `attributes=all` request parameter returns all attributes and nested attributes belonging to a record. Due to the amount of data that may be returned, we recommend not to passing the `attributes=all` parameter as default in your requests. Impressive performance gains can be seen by requesting only the data you need to maintain or display. For example, if you required the delivery address and credit limit of your contacts, the specific attributes should be passed in the request in place of the 'attributes=all' parameter.

txt

```
GET /contacts?attributes=delivery_address,credit_limit
```

### Concurrency

To aid and maintain data integrity, additional attention should be paid when parallel `POST` requests are being made. We recommend not to use parallel requests when creating data that may have unique references or use system generated sequential numbering.

Avoid making parallel POST requests to the following endpoints:

*   contacts
*   products
*   purchase_corrective_invoices
*   purchase_credit_notes
*   purchase_invoices
*   purchase_quick_entries
*   sales_corrective_invoices
*   sales_credit_notes
*   sales_estimates
*   sales_invoices
*   sales_quick_entries
*   sales_quotes
*   services
*   stock_items

### Type mismatching

Type mismatching can be frustrating to the user and also could be a factor of hitting API rate limits. The most common misuse of types is among contacts and their supported artefact and transaction types. For example, you have a list of contacts which could be of type customer or vendor, the user attempts to create a sales invoice and inadvertantly selects a vendor contact. The API will return a 422 error response "can't find customer" which you will need to handle and then re submit the request with a valid contact id.

When making requests which are likely to contain a large amount of data it is important to consider the performance and potential latency your application may experience. The use of pagination allows a user to set parameters to state the number of items shown (200 max) on each page of results in the response, but also the specific page to return. This allows data to be called and rendered in a view as and when it is required.

For example, you may have 2000+ results in a GET request for transactions, the user may only be able to see 50 of those transactions listed at anyone time and may only ever wish to see the most recent transactions, if you only asked for 100 items and page 1, it is possible to return and render the data far quicker than trying to obtain 2000+ transactions at any one time. Should the user scroll towards the end of the first 100 items a second call can be made to obtain page 2 and another 100 items.

A full guide to pagination can be found [here](https://developer.sage.com/accounting/docs/v1.0.0/guides/learning/response-efficiencies/pagination).

### Data synch efficiencies

Maintaining localized representations of client data can be costly in terms of the number off calls your application may need to make. For example, if your integration maintains sales and purchase artefacts you may require to call a number of endpoints. An alternative to obtainiing all of the data for each of the endpoints is to pass the `updated_or_created_since` query parameter along with a date time stamp. Ideally the date time stamp would be that of the last successful data synch. Depending on the data shown in the integration, further efficiencies could be made to the above scenario. Instead of calling all of the endpoints individually, a single call to the 'transactions' endpoint with the same query parameter would allow us to obtain all transactional records created or modified during that time frame.

txt

```
GET /transactions?updated_or_created_since=2019-05-22T13:00:00Z
```

### Localization

At the time of writing, API error responses are returned in English and require developer intervention to translate and localise to the language of the user.

### Field length for string attributes

At the time of writing we are currently working our way through adding the supported string lengths to all of our documented [API_References](https://developer.sage.com/accounting/apis/sagebusinesscloudaccounting/3.1.0/accounting). This will allow you to easily add validation to your applications and prevent rejected API calls.

### Troubleshooting

To aid the support and service we offer consumers of our API's, we recommend logging the unique identifier of each request made. Found in the response headers of the request, the 'x_request_id' helps us pin point API requests without having to filter tens of thousands of entries. It also allows us to be 100% certain that we have the correct request without having to rely on date and time stamps. In addition, it also helps speed up the response times of our support service.

### Test Accounts

To ensure the integrity of Sage Business Cloud Accounting customer data, we strongly recommend that live business data is not used to develop against and new accounts are created for the sole purpose of development. Currently, only 30 day trial accounts are available to developers. If you intend for your application or integration to be available to multiple regions, you will need to create trial accounts for each of those regions.

Trial accounts are created using the links in the [Quick Start Guide](https://developer.sage.com/accounting/docs/v1.0.0/guides/quick-start).
