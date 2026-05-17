### Overview
In addition to the business owner, Sage Business Cloud Accounting has the ability to allow access for additional users. It is probable that different users will be performing tasks specific to their job role and do not require access to all areas of the data. For example, a warehouse person responsible for goods received may only require access to add additional stock items and would not require access to bank transactions or management accounts.
When creating an application or integration for Sage Business Cloud Accounting it is important to understand the experience of users with limited access to data and functionality. The API adheres to the same access rights as the UI meaning users of 3rd party apps may be limited to functionality if the user does not have full access.
For this purpose, Sage Business Cloud Accounting allows user access rights to be set based on the level of access required.
### Business Owner
The business owner is an attribute adorned to the user who signed up for the Sage Business Cloud Accounting subscription.
### System Manager
The system manager is an attribute the business owner can choose to enhance user access. A user with the system manager attribute has full access to all areas of the data, reporting and user access. A user with the system manager attribute is able to invite new users and modify existing user access rights and roles including adding the system manager attribute.
#### Roles
As an efficient means of setting access levels for new and existing users it is possible to set a global role for a user.
| FullAccess |User is able to view, edit, create and delete all data. They are restricted to amending user access, only the business owner or system manager is able to add and modify user access | Restricted Access |User is able to view, edit and create all data. They are unable to delete data or run management reports. | Read Only |User is able to view data only. They are unable to run management reports. | No Access |User is unable to view data or run reports. | Custom |Allows different access levels to be granted for different areas of data. See below table for options.
#### Access Rights
Access rights are granted to users based on the access level they require to the area of business function. The below table shows how the applied access rights effect what information the user is able to view for the each business area:
|  |  |  |  |
| --- | --- | --- | --- |
| Business Area | Restricted Access | Read Only Access | No Access |
| Sales | Users with Restricted access are unable to delete sales artefact records | Blocks access to the creation, editing and deletion of Sales Artefacts but not Other Receipt/Money In. API extends this behaviour and returns a 403 MultiUserAccessDenied error response. | Users are unable to view any sales artefacts and are unable to create new entities. Sales reports require access to sales and contacts, and won't be available to this user. The API extends this behaviour returning a 403 MultiUserAccessDenied error response. |
| Purchases | Users with Restricted access are unable to delete purchase artefact records | Blocks access to the creation, editing and deletion of Purchase Artefacts but not Other Payment/Money Out. API extends this behaviour and returns a 403 MultiUserAccessDenied error response. | Users are unable to view any purchase artefacts and are unable to create new entities. Purchases reports require access to purchases and contacts, and won't be available to this user. The API extends this behaviour returning a 403 MultiUserAccessDenied error response for any attempted GET request. |
| Bank | Users with Restricted access are unable to delete bank records | Blocks access to the creation, editing and deletion of Bank Accounts. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted PUT or POST request. | Users are unable to view bank accounts. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted GET request. |
| Contacts | Users with Restricted access are unable to delete contact records | Blocks access to the creation, editing and deletion of contact records. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted PUT or POST request. | The user is blocked from accessing contacts in the contact list and contact related reports. This behaviour is not extended to the API as Contacts are required for the creation of Sales, Purchases, Receipts and payments |
| Products and Services | N/A | Blocks access to the creation, editing and deletion of product & service records. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted PUT or POST request. | The user is blocked from accessing Products, Services and associated reports. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted GET request. |
| Settings | N/A | Blocks access to the editing of settings. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted PUT request. Bug, Email settings can be edited | Users are unable to view settings. API extends this behaviour and returns a 403 MultiUserAccessDenied error response for any attempted GET request. Bug, Email settings can be viewed and edited |
#### Access Denied
The 403 Forbidden response always has the following body:
```
json
Copy
[

  
{

    
"$severity"
:
 
"error"
,

    
"$dataCode"
:
 
"MultiUserAccessDenied"
,

    
"$message"
:
 
"The current user is not allowed to access that resource with that method."
,

    
"$source"
:
 
""

  
}

]
```
