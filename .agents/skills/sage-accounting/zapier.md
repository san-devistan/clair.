## What is Zapier
Zapier is a no code platform which allows many different applications to be integrated through automated workflows. The scope of any zapier integration is controlled by the actions and events exposed by the individual zapier applications. We'll cover actions and events in a little more detail further into the guide.
The Sage Business Cloud Accounting(SBCA) Zapier application was created using our public API's and uses the same required fields as that of the associated API.
At present the Sage Zapier application works only for the Start, Accounting and Accounting Plus tiers of the Sage Business Cloud Accounting native web application in Canada, France, Ireland, Spain, United Kingdom and USA. The authentication will fail if you are using a different Sage product or the Sage Business Cloud Accounting product for a different locale.
Zapier does not provide the ability to replace the niche, deeply integrated applications created by our 3rd party developer community. If you require a niche solution for your business our Sage Marketplace is a great place to start.
### Use cases
The use cases of Zapier are endless and maybe simple or complex depending on the requirement and the scope of the connecting zapier applications. Below is a list of the most popular uses for the Sage Accounting Zapier application:
- Transfer customer and vendor contacts created in an e-commerce platform to Sage Business Cloud Accounting
- Update changes to customer and vendor contacts created in an e-commerce platform to Sage Business Cloud Accounting
- Transfer sales and vendor invoices/transactions created in an e-commerce platform to Sage Business Cloud Accounting
- Update changes to sales and vendor invoices/transactions created in an e-commerce platform to Sage Business Cloud Accounting
- Create payments in Sage Business Cloud Accounting and allocate them to outstanding invoices
The use cases could also be used in the opposing direction where Sage Business Cloud Accounting data is transferred to consuming applications.
#### Sage Business Cloud Accounting Events and Actions
The below links contain information specific to the field mapping of the actions and events applicable to:
- Contacts
- Sales Artefacts
- Purchase Artefacts
- Payments
- Products and services
- Search Options
#### Zapier API Request
Zapier provides an action to use existing auth tokens to make requests to any of the Sage Business Cloud Accounting public API's to Create, Read, Update and Delete data. This provides limitless options for anyone wanting to integrate with Sage Business Cloud Accounting. If the events and actions provided in the Sage Accounting Zapier application do not support your required scope you can customise requests to your liking.
- Api Request
### Test Accounts
We strongly recommend that any discovery and or testing of the Zapier platform is performed away from your live data and in the safety of a trial business. We've provided links which will allow you to create a trial account for all of the regions covered by Sage Business Cloud Accounting.
### What is a Zap
A zap is the term used in the Zapier platform for mapping out an event/trigger in one application which then triggers an action in the other connected application. For example, the event/trigger could be a new sales invoice in Sage Business Cloud Accounting which then invokes the creation of a new spreadsheet row in a connected Google Sheets.
#### Field Mapping
Let's look at how we can map out the fields in the above example. The simplest way is to ensure we have a sales invoice within the Sage Business Cloud Accounting trial Business. This will allow zapier to obtain the sales invoice data as an example for ease of field mapping.
You'll need to upload the available Google Sheet to your Google Drive.
| Googlesheet Field Name | SBCA Field Name |
| --- | --- |
| Invoice No | Invoice Number |
| Contact Ref | Contact Reference |
| Contact Id | Contact Id |
| Date | Date |
| Due Date | Due Date |
| Reference | Reference |
| Delivery AddressLine 1 | Delivery Address Address Line 1 |
| Delivery AddressLine 2 | Delivery Address Address Line 2 |
| City | Delivery Address City |
| Postal Code | Delivery Address Postal Code |
| Invoice Line Description | Invoice Lines Description |
| Invoice Line Quantity | Invoice Lines Quantity |
| Invoice Line Unit Price | Invoice Lines Unit Price |
| Invoice Line Net Amount | Invoice Lines Net Amount |
| Invoice Line Tax Rate | Invoice Lines Tax Rate Id |
| Invoice Line Tax Amount | Invoice Lines Tax Amount |
| Invoice Line Total Amount | Invoice Lines Total Amount |
| Invoice Line Ledger Account ID | Invoice Lines Ledger Account Id |
With the Googlesheet created we can move on to creating the zap:
Step 1 - Select the Sage Accounting app and the New Sales Invoice trigger event from the available Events.
Step 2 - Connect to the Sage Business Trial Account.
Step 3 - Test your trigger, a failure at this stage indicates that there isn't a sales_invoice in the test data to return.
Step 4 - Select the Google Sheets app and then the Create Spreadsheet Row Event from the drop down.
Step 5 - Continue and connect to your google drive and the Google Sheet template you uploaded earlier.
Step 6 - With the Google Sheet connected, we can begin mapping out the fields as per the above table.
Step 7 - Complete the field mapping and Test the action. A successful test will add the mapped invoice details to the connected Google Sheet in a new row.