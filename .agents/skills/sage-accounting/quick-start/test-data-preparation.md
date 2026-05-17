To help developers get up and running with their integration as quickly as possible, we have created a method of quickly importing test data into your development Accounting business using Postman.
This process should only take around 15-20 minutes to set up, and will provide hundreds of transactions across many of the modules available, saving you significant time and effort.
### Pre-requisites
Before you can begin the process, you will need a few things:
- A Sage Business Cloud Accounting UK VAT registered business/trial account - this must be either the Standard or Plus variants.
- The Postman environment file.
- The data creation collection.
- The JSON files containing the data you will import.
If you already have a business that you wish to use that isn't currently set as a VAT registered one, you can enable VAT for your businesses using:
Settings - Financial Settings - Accounting Dates & VAT - VAT Details - change VAT Scheme to Standard, accepting the defaults and enter a GB VAT number of 123456789.
Using Postman, you can import the collection and environment file required by clicking 'Run in Postman'. We recommend using the Postman desktop app.
Alternatively, perform a manual import of the Postman files
1. Download the Postman collection and environment that will add your test data here here and unzip the contents.
2. Open Postman and click Import file or go to the File menu - Import.
3. Select the Accounting Postman collection file and either drag it into the window that appears, or choose Upload Files .
4. The collection is now ready to use in Postman
5. Repeat steps 2 and 3 for the environment file.
#### The data to import
Now we have the files that configure Postman, you can download the JSON data files that contain the test data for import here .
#### Preparing Postman
First you need to look to the top right and select the drop down box for Environment. You should now see an option called SBC Accounting Data Creation , which you should select. Almost everything has been pre-populated so there's minimal setup required.
Next, go to the collections tab on the left, simply open the SBC Accounting Data Creation collection. In order to authenticate initially with Postman we will select Initial Auth Request . This request will be used soley to obtain a valid refresh token for your business that will be used to maintain a connection throughout using the collection runner.
In the top right corner of the request screen its adviseable at this stage to clear any cookies you may already have in Postman. Click Cookies and at the right hand side (under Add ) if you hover your mouse you will see a grey 'X', click that for any cookies listed.
Next close the cookies screen and choose the Auth tab, scroll down and ensure the registered Callback URL of http://localhost:8080/auth/callback is present in the Callback URL field (Postman removes its in some instances).
Finally move down to the bottom and click Get New Access Token .
You will be presented with the Sage Accounting authentication screen, asking for an email address and password. Enter the details you used to create your Accounting trial account in the previous steps.
If successfully entered, you will need to provide authorisation for the Sage Accounting Test Data application to access your business. Choose Allow .
If your credentials were entered correctly, Postman will show you that authentication has been successful, now click Proceed . Here you will see a manage tokens screen displaying a new access token, expiry times and a refresh token.
We need to click and highlight all of the refresh token (this is very important) and then right click, choosing Set as SBC Accounting Data Creation > refreshToken . Now close the Manage tokens window.
Please ensure there isn't a linebreak inserted after the refresh token, as Postman can add one when setting the variable value:
If you click the preview button, then edit the environment:
Next, select the current value field next to refreshToken , and delete the line break character and any space after the token characters.
We are now ready to use a Postman Runner to create some data to work with in our Accounting Business.