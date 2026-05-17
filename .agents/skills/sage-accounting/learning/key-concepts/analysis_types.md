This guide is intended to provide supporting information and guidance in addition to the API reference docs .
### Overview
Analysis Types provide users of Sage Business Cloud Accounting with the ability to add additional analysis to their transactions and for example, closely monitor profitability of departments or run aged reporting for a specific group of customers or vendors.
Once analysis types are setup and in use, management reports can be generated to report upon Profit and Loss, Nominal Activity, Aged Debtors, and Aged Creditors by analysis type.
If your application or integration provides functionality to create or edit transactions and the business or businesses consuming your application rely upon analysis types for reporting or any other purpose, it’s imperative that you provide the ability to maintain existing transactional analysis and to select analysis types for the editing and creation of transactions.
Currently, analysis types are available in the Accounting and Accounting plus tiers of Sage Business Cloud Accounting. If the connecting business was currently using the Start tier there would be no need to provide the ability to add or edit analysis types.
The subscription tier of a business can be identified in the response from a GET request to the businesses/id API. This response includes a subscription array holding an id for the tier. Analysis types are valid for all id’s excluding “START” and “MICRO”.
Sage Business Cloud Accounting supports two different analysis types which include Transaction Analysis and Group Analysis. The different types are defined either by an analysis_type_level attribute returned in the API response, or the selection of Transaction Analysis and Group Analysis in the web UI.
analysis_type_level denotes if the type is a transactional or Group analysis Type. The id is 1 for Transactions and 2 for Group.
To familiarise yourself with Analysis Types, we recommend using the Sage Business Cloud Accounting Web UI to view them. They can be accessed via Business Settings&gt;Financial Settings&gt;Analysis Types.
## Transaction Analysis
Transaction Analysis is the most used of the two types of analysis and covers the following transaction types:
- Sales Invoices
- Sales Credit Notes
- Sales Quick Entry Invoices
- Sales Quick Entry Credits
- Sales Corrective Invoices - Spain only
- Purchase Quick Entry Invoices
- Purchase Quick Entry Credits
- Purchase Invoices
- Purchase Credit Notes
- Purchase Corrective Invoices - Spain only
- Journals
- Bank Other Receipt
- Bank Other Payments
As default there are three Transaction Analysis Types, Department, Cost Centre and Project. The names of which are editable and should not be used as constants. The number of Analysis Types cannot be increased meaning there will only ever be three Analysis Types for Transactions.
For each of the Analysis Types available there are related categories, the categories are selectable to the user in the UI when setting a Department, Cost Centre or Project for a transaction. Unlike the analysis types, the number of categories is unlimited meaning new categories can be added via both the UI and API.
New and existing categories will only show as in use, once the category has been assigned to a transaction.
The Active Areas of an Analysis Type are as default, unset. It is only when the user selects an Active Area that the Analysis Categories will be available for selection against the transactions of that area. The ability to set and unset the Active Areas is also exposed via the API’s.
When deciding on where to offer category selection in your own application’s UI, you will need to obtain the Active Area's currently set for the Analysis Type using a GET request to analysis_types/id. From the response, the active_areas array holds the list of where the Analysis Type Categories should be available. The ids of the Active Areas are shown below:
```
json
Copy
{

    
"active_areas"
:
 
[

        
"SALES"
,

        
"EXPENSES"
,

        
"BANKING"
,

        
"JOURNALS"

    
]

}
```
## Group Analysis
Group Analysis provides the option to add analysis types to customers, suppliers, stock, non-stock, and service records. A popular use case for Group Analysis is the defining of sales agents/representatives assigned to customer contacts to establish the agent’s associated sales turnover.
At present, the API’s provide access to the Group Analysis Type and Group Analysis Type Categories at the same level as that of Transactional Analysis Types/Categories. The current functionality stops short of exposing the analysis_type_category field in the contact, products, services, and stock records which would need to be set in the Sage Business Cloud Accounting UI.
The ids of the Active Areas of Group Analysis Transaction Types are shown below:
- CUSTOMERS
- VENDORS
- PRODUCTS
- SERVICE
- STOCK
### Available API’s
#### GET /analysis_types
The analysis_types API allows GET requests to be made which return a list of the six available Analysis Types. They are made up of three Transactional and three Group analysis types and return the default attributes, id, displayed_as and $path.
```
json
Copy
{

    
"$total"
:
 
6
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
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Department"
,

            
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7076035fdc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Customer Group"
,

            
"$path"
:
 
"/analysis_types/7076035fdc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7078d355dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Cost Centre"
,

            
"$path"
:
 
"/analysis_types/7078d355dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707b8093dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Supplier Group"
,

            
"$path"
:
 
"/analysis_types/707b8093dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707e4a5edc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Project"
,

            
"$path"
:
 
"/analysis_types/707e4a5edc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7080d91cdc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Product Group"
,

            
"$path"
:
 
"/analysis_types/7080d91cdc2a11e8aac702d5719f235e"

        
}

    
]

}
```
#### GET /analysis_types/id
Additional detail relating to individual analysis_types can be obtained by defining the id of the analysis_types in the request - analysis_types/id.
Attribute values specific to that Analysis Type are returned. The attributes include, active_areas, analysis_type_level and the anlysis_type_categories associated with this Analysis Type.
```
json
Copy
{

    
"id"
:
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

    
"displayed_as"
:
 
"Department"
,

    
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"
,

    
"created_at"
:
 
"2022-10-20T09:59:06Z"
,

    
"updated_at"
:
 
"2022-10-20T13:58:20Z"
,

    
"active_areas"
:
 
[

        
"SALES"
,

        
"EXPENSES"
,

        
"BANKING"

    
]
,

    
"analysis_type_level"
:
 
{

        
"id"
:
 
1
,

        
"name"
:
 
"TRANSACTION_LEVEL"
,

        
"identifier"
:
 
"TRANSACTION"

    
}
,

    
"analysis_type_categories"
:
 
[

        
{

            
"id"
:
 
"7073655cdc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Department 1"
,

            
"$path"
:
 
"/analysis_type_categories/7073655cdc2a11e8aac702d5719f235e"
,

            
"created_at"
:
 
"2022-10-19T09:59:06Z"
,

            
"updated_at"
:
 
"2022-10-19T09:59:06Z"
,

            
"code"
:
 
"01"
,

            
"name"
:
 
"Department 1"
,

            
"combined_id"
:
 
"2832223,8604757"
,

            
"analysis_type"
:
 
{

                
"id"
:
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

                
"displayed_as"
:
 
"Department"
,

                
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"

            
}

        
}
,

        
{

            
"id"
:
 
"707417addc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Department 3"
,

            
"$path"
:
 
"/analysis_type_categories/707417addc2a11e8aac702d5719f235e"
,

            
"created_at"
:
 
"2022-10-19T09:59:06Z"
,

            
"updated_at"
:
 
"2022-10-19T09:59:06Z"
,

            
"code"
:
 
"03"
,

            
"name"
:
 
"Department 3"
,

            
"combined_id"
:
 
"2832223,8604759"
,

            
"analysis_type"
:
 
{

                
"id"
:
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

                
"displayed_as"
:
 
"Department"
,

                
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"

            
}

        
}

    
]
,

    
"name"
:
 
"Department"

}
```
#### PUT /analysis_types/id
The analysis_types API also provides the ability to update Analysis Type details through a PUT request.
The PUT request has the ability to set the following attributes:
- activeAreas[“SALES”, “EXPENSES”, “JOURNALS”, “BANKING”]
- name
```
json
Copy
 
{

    
"analysis_type"
:
{

        
"name"
:
"edited analysis type name"
,

        
"active_areas"
:
[
"SALES"
,
 
"EXPENSES"
,
 
"JOURNALS"
,
 
"BANKING"
]

    
}

}
```
#### GET /analysis_type_categories
The analysis_type_categories API provides the ability to GET, PUT and POST records and attributes relating to Analysis Type Categories.
The GET request returns a list of all categories with the default attributes id, displayed_as and $path. The default number of categories returned will be eighteen, three categories for each of the six analysis_types. This number could increase or decrease if categories have been deleted or created.
```
json
Copy
{

    
"$total"
:
 
17
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
 
"7073655cdc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Department 1"
,

            
"$path"
:
 
"/analysis_type_categories/7073655cdc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707417addc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Department 3"
,

            
"$path"
:
 
"/analysis_type_categories/707417addc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707658b5dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Customer Group 1"
,

            
"$path"
:
 
"/analysis_type_categories/707658b5dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"70769733dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Customer Group 2"
,

            
"$path"
:
 
"/analysis_type_categories/70769733dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7076ee05dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Customer Group 3"
,

            
"$path"
:
 
"/analysis_type_categories/7076ee05dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707913c6dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Cost Centre 1"
,

            
"$path"
:
 
"/analysis_type_categories/707913c6dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"70796c27dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Cost Centre 2"
,

            
"$path"
:
 
"/analysis_type_categories/70796c27dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7079a846dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Cost Centre 3"
,

            
"$path"
:
 
"/analysis_type_categories/7079a846dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707bd82adc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Supplier Group 1"
,

            
"$path"
:
 
"/analysis_type_categories/707bd82adc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707c28e9dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Supplier Group 2"
,

            
"$path"
:
 
"/analysis_type_categories/707c28e9dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707c831cdc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Supplier Group 3"
,

            
"$path"
:
 
"/analysis_type_categories/707c831cdc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707e8671dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Project 1"
,

            
"$path"
:
 
"/analysis_type_categories/707e8671dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707ed954dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Project 2"
,

            
"$path"
:
 
"/analysis_type_categories/707ed954dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"707f17c5dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Project 3"
,

            
"$path"
:
 
"/analysis_type_categories/707f17c5dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"708117badc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Product Group 1"
,

            
"$path"
:
 
"/analysis_type_categories/708117badc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"708171d8dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Product Group 2"
,

            
"$path"
:
 
"/analysis_type_categories/708171d8dc2a11e8aac702d5719f235e"

        
}
,

        
{

            
"id"
:
 
"7081ae55dc2a11e8aac702d5719f235e"
,

            
"displayed_as"
:
 
"Product Group 3"
,

            
"$path"
:
 
"/analysis_type_categories/7081ae55dc2a11e8aac702d5719f235e"

        
}

    
]

}
```
#### GET /analysis_type_categories/id
Further detail relating to the analysis_type_categories can be obtained by defining the category id in the GET request analysis_type_categories/id
```
json
Copy
{

    
"id"
:
 
"7073655cdc2a11e8aac702d5719f235e"
,

    
"displayed_as"
:
 
"Department 1"
,

    
"$path"
:
 
"/analysis_type_categories/7073655cdc2a11e8aac702d5719f235e"
,

    
"created_at"
:
 
"2022-10-19T09:59:06Z"
,

    
"updated_at"
:
 
"2022-10-19T09:59:06Z"
,

    
"code"
:
 
"01"
,

    
"name"
:
 
"Department 1"
,

    
"combined_id"
:
 
"2832223,8604757"
,

    
"analysis_type"
:
 
{

        
"id"
:
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

        
"displayed_as"
:
 
"Department"
,

        
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"

    
}

}
```
#### POST /analysis_type_categories
The analysis_type_categories API also provides the ability to CREATE Analysis Type Category details through a POST request.
The following attributes must be set when creating a new analysis type category:
- name – The name of the category
- code – This is unique and numeric and should increment from the last category code available to the analysis type
- analysis_type_id – The id of the analysis_type the category is made available to.
```
json
Copy
{

   
"analysis_type_category"
:
 
   
{

       
"name"
:
"another new category"
,

       
"code"
:
"05"
,

    
"analysis_type_id"
:
 
"7073655cdc2a11e8aac702d5719f235e"

   
}

}
```
#### PUT /analysis_type_categories/id
To update a category, the analysis_type_categories API provides a PUT request.
The PUT request can set only the category name:
```
json
Copy
{

   
"analysis_type_category"
:
 
   
{

       
"name"
:
"edited category name"

   
}

}
```
#### DELETE /analysis_type_categories/id
To delete a category the id of the category must be passed, analysis_type_categories/id. The request will fail if the id of the category cannot be found, or, if the category is in use a 405 error response will be returned with the below message:
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
 
"MethodNotAllowed"
,

        
"$message"
:
 
"You cannot delete an Analysis Type Category that is in use."
,

        
"$source"
:
 
""

    
}

]
```
#### GET /sales_invoices?show_analysis_types=true
Analysis Type Categories in transactions are identified by passing the show_analysis_types=true query parameter when returning the following transaction types:
- Sales Invoices
- Sales Credit Notes
- Sales Quick Entry Invoices
- Sales Quick Entry Credits
- Sales Corrective Invoices - Spain only
- Purchase Quick Entry Invoices
- Purchase Quick Entry Credits
- Purchase Invoices
- Purchase Credit Notes
- Purchase Corrective Invoices - Spain only
- Journals
- Bank Other Receipt
- Bank Other Payments
If there are categories associated with the transaction they will be visible in the analysis_type_categories array where the id, displayed_as and $path attributes will be visible. If there are no categories associated the array will be empty.
```
json
Copy
"invoice_lines"
:
 
[

        
{

            
"id"
:
 
"8ca6e3b0d0e9450bb38e70530ec7d311"
,

            
"displayed_as"
:
 
"Test department category"
,

            
"analysis_type_categories"
:
 
[

                
{

                    
"id"
:
 
"7073655cdc2a11e8aac702d5719f235e"
,

                    
"displayed_as"
:
 
"Department 1"
,

                    
"$path"
:
 
"/analysis_type_categories/7073655cdc2a11e8aac702d5719f235e"
,

                    
"analysis_type"
:
 
{

                        
"id"
:
 
"7072e8c8dc2a11e8aac702d5719f235e"
,

                        
"displayed_as"
:
 
"Department"
,

                        
"$path"
:
 
"/analysis_types/7072e8c8dc2a11e8aac702d5719f235e"

                    
}

                
}
,

                
{

                    
"id"
:
 
"707913c6dc2a11e8aac702d5719f235e"
,

                    
"displayed_as"
:
 
"Cost Centre 1"
,

                    
"$path"
:
 
"/analysis_type_categories/707913c6dc2a11e8aac702d5719f235e"
,

                    
"analysis_type"
:
 
{

                        
"id"
:
 
"7078d355dc2a11e8aac702d5719f235e"
,

                        
"displayed_as"
:
 
"Cost Centre"
,

                        
"$path"
:
 
"/analysis_types/7078d355dc2a11e8aac702d5719f235e"

                    
}

                
}
,

                
{

                    
"id"
:
 
"707e8671dc2a11e8aac702d5719f235e"
,

                    
"displayed_as"
:
 
"Project 1"
,

                    
"$path"
:
 
"/analysis_type_categories/707e8671dc2a11e8aac702d5719f235e"
,

                    
"analysis_type"
:
 
{

                        
"id"
:
 
"707e4a5edc2a11e8aac702d5719f235e"
,

                        
"displayed_as"
:
 
"Project"
,

                        
"$path"
:
 
"/analysis_types/707e4a5edc2a11e8aac702d5719f235e"

                    
}

                
}

            
]
,
```
#### POST /sales_invoices
To set analysis type categories on a transaction type which supports them, you must first ensure that the analysis type active_area array contains the relevant area. For example, if you wanted to add an analysis type category to a purchase_invoice you must ensure EXPENSES is contained in the active_area array of the analysis type the category belongs to.
Once this has been confirmed the analysis type category is set as in the below example.
```
json
Copy
{

    
"sales_invoice"
:
 
{

        
"contact_id"
:
 
"544b9ab947494ae489b083509d485e25"
,

        
"date"
:
 
"2022-10-24"
,

        
"reference"
:
 
"November Electric"
,

        
"sent"
:
 
false
,

        
"sent_by_email"
:
 
false
,

        
"due_date"
:
 
"2022-11-24"
,

        
"invoice_lines"
:
 
[
{

            
"description"
:
 
"15.09.2022 - 15.10.2022 | Electric | Unit 33 Clear Space"
,

            
"ledger_account_id"
:
 
"6caa28c940c14416b98b25877a7d89d3"
,

            
"unit_price"
:
 
142.52
,

            
"quantity"
:
 
1
,

            
"tax_rate_id"
:
 
"GB_STANDARD"
,

            
"tax_amount"
:
 
28.50
,

            
"analysis_type_categories"
:
 
[
{

                    
"id"
:
 
"707417addc2a11e8aac702d5719f235e"

                
}
,

                
{

                    
"id"
:
 
"707e8671dc2a11e8aac702d5719f235e"

                
}
,

                
{

                    
"id"
:
 
"70796c27dc2a11e8aac702d5719f235e"

                
}

            
]

        
}
]

    
}

}
```
Note The three analysis_type_categories set in the above example show a category being set for each of the available transaction group analysis types, Department, Cost Centre and Project. It’s not essential to set all three but no more than three can be set.
if any of the stated categories were not active for the transaction type posted, a 422 error response with the message “analysis_type_categories are not enabled for Active Area X” would be returned.
#### Querying Analysis Types
If your app or integration is maintaining the analysis_types and analysis_type_categories, the following query parameters have been provided to allow changes made by a user or another integrating app to be identified via the API's:
- GET /analysis_types?updated_or_created_since=2022-10-24T00:00:00Z - returns analysis types updated in the date range
- GET /analysis_type_categories?updated_or_created_since=2022-10-24T00:00:00Z - returns the analysis type categories updated or created in the date range