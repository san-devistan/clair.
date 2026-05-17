You would use a journal to record non-regular transactions such as the depreciation of a fixed asset or when writing off bad debt. It may also be used for something as simple as transferring balances between nominal ledger accounts.
When creating a journal, it is vital that you appreciate the principles of double-entry bookkeeping, that is that for every debit balance, there must be a corresponding credit balance. It doesn’t matter how many lines this is made up of, for example you could have a debit balance of 1000 offset by 2 credit balances of 500. This will work as long as the total balances.
Find a nominal ledger account for each journal line:
When posting journal entries, you are required to choose ledger accounts for each of the lines you are going to set. In this example we want to create a journal with 2 lines, one to set the account we are debiting, and the other to credit.
To find the ids for the appropriate ledger accounts we will need to perform a GET request which will return all relevant accounts as follows:
```
txt
Copy
GET /ledger_accounts?visible_in=journals&items_per_page=200
```
```
json
Copy
{

  
"$total"
:
 
69
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
 
200
,

  
"$items"
:
 
[

    
{

      
"id"
:
 
"be8e01824a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Current (1200)"
,

      
"$path"
:
 
"/ledger_accounts/be8e01824a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"beb1cfd44a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Cash (1210)"
,

      
"$path"
:
 
"/ledger_accounts/beb1cfd44a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf14b5304a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Assets - Cost (0001)"
,

      
"$path"
:
 
"/ledger_accounts/bf14b5304a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf1586614a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Office equipment and IT - Cost (0030)"
,

      
"$path"
:
 
"/ledger_accounts/bf1586614a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf15a3854a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Office equipment and IT - Accumulated Depreciation (0031)"
,

      
"$path"
:
 
"/ledger_accounts/bf15a3854a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf15a6664a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Fixtures and fittings - Cost (0040)"
,

      
"$path"
:
 
"/ledger_accounts/bf15a6664a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf15a9124a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Fixtures and fittings - Accumulated Depreciation (0041)"
,

      
"$path"
:
 
"/ledger_accounts/bf15a9124a9111e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"bf15ab254a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Motor Vehicles - Cost (0050)"
,

      
"$path"
:
 
"/ledger_accounts/bf15ab254a9111e797950a57719b2edb"

    
}
,

    ...
  
]

}
```
It is recommended that you cache data like nominal ledger accounts as whilst they can change it is not likely that they will change often. Querying the ledger accounts a lot (potentially before every transaction) is an unnecessary use of resources.
### Nominal Ledger Accounts
If the required nominal ledger account doesn’t yet exist, you will need to create it.
This can be achieved by making a POST request to:
```
txt
Copy
POST /ledger_accounts
```
Using the minimum required fields, you can create a ledger_account with just the following:
```
json
Copy
{

  
"ledger_account"
:
 
{

    
"ledger_account_type_id"
:
 
"SALES"
,

    
"included_in_chart"
:
 
true
,

    
"name"
:
 
"Sales Test"
,

    
"display_name"
:
 
"Test account for Sales (4002)"
,

    
"nominal_code"
:
 
4002

  
}

}
```
Now that we have a list of the ledger accounts and their associated ids we can proceed to making our POST request. When adding details for the Journal you must add:
- The date of the journal – this can be retrospective, today or in the future.
- Reference – an appropriate reference you would like to use for the transaction.
- Description – an optional description of the transaction
In the journal_lines array the ledger_account_id is taken from the response above.
```
json
Copy
{

  
"journal"
:
 
{

    
"date"
:
 
"2018-12-10"
,

    
"reference"
:
 
"TEST JOURNAL"
,

    
"description"
:
 
"This is a test journal"
,

    
"total"
:
 
100
,

    
"journal_code"
:
 
null
,

    
"journal_lines"
:
 
[

      
{

        
"ledger_account_id"
:
 
"bf14b5304a9111e797950a57719b2edb"
,

        
"debit"
:
 
100
,

        
"credit"
:
 
0
,

        
"details"
:
 
"Asset side"
,

        
"include_on_tax_return"
:
 
true
,

        
"tax_reconciled"
:
 
true
,

        
"cleared"
:
 
true
,

        
"bank_reconciled"
:
 
true

      
}
,

      
{

        
"ledger_account_id"
:
 
"bf15ab254a9111e797950a57719b2edb"
,

        
"debit"
:
 
0
,

        
"credit"
:
 
100
,

        
"details"
:
 
"Motor Vehicle Cost side"
,

        
"include_on_tax_return"
:
 
true
,

        
"tax_reconciled"
:
 
true
,

        
"cleared"
:
 
true
,

        
"bank_reconciled"
:
 
true

      
}

    
]
,

    
"migrated"
:
 
true

  
}

}
```
There are 4 Boolean properties to consider on each line when looking at journal_lines :
- include_on_tax_return : true, - is this transaction to appear on your VAT return or not?
- tax_reconciled : true, - has this transaction already been included in a previous VAT return?
It’s important to understand the affect including a journal in a VAT return will have, for more information please seek out help here: How journal entries affect the VAT Return
- cleared : true, - has this transaction cleared the bank account?
- bank_reconciled : true – has this transaction been included in a bank reconciliation?
As you would expect, each of these Boolean properties can be set to true or false.
Once the post request has been made successfully with a status 201 Created, you will receive a potentially long response back which includes a lot of detail specific to the nominal ledger accounts that were affected as a result of the POST, for example:
```
json
Copy
{

  
"id"
:
 
"cc2211bacb094f19b50ca6b105c32936"
,

  
"displayed_as"
:
 
"TEST JOURNAL"
,

  
"$path"
:
 
"/journals/cc2211bacb094f19b50ca6b105c32936"
,

  
"transaction"
:
 
{

    
"id"
:
 
"0d4c85250bd74d20b29ac9e20b72c7f2"
,

    
"displayed_as"
:
 
"TEST JOURNAL"
,

    
"$path"
:
 
"/transactions/0d4c85250bd74d20b29ac9e20b72c7f2"

  
}
,

  
"transaction_type"
:
 
{

    
"id"
:
 
"JOURNAL"
,

    
"displayed_as"
:
 
"Journal"
,

    
"$path"
:
 
"/transaction_types/JOURNAL"

  
}
,

  
"created_at"
:
 
"2018-12-12T19:34:22Z"
,

  
"updated_at"
:
 
"2018-12-12T19:34:22Z"
,

  
"date"
:
 
"2018-12-10"
,

  
"reference"
:
 
"TEST JOURNAL"
,

  
"description"
:
 
"This is a test journal"
,

  
"total"
:
 
"100.0"
,

  
"journal_code"
:
 
null
,

  
"journal_lines"
:
 
[

    
{

      
"id"
:
 
"b74439499cd64904ba25b91e30ab29a5"
,

      
"ledger_account"
:
 
{

        
"id"
:
 
"bf14b5304a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Assets - Cost (0001)"
,

        
"$path"
:
 
"/ledger_accounts/bf14b5304a9111e797950a57719b2edb"
,

        
"created_at"
:
 
"2017-06-06T08:25:49Z"
,

        
"updated_at"
:
 
"2017-06-06T08:25:49Z"
,

        
"ledger_account_group"
:
 
{

          
"id"
:
 
"ASSET"
,

          
"displayed_as"
:
 
"Asset"

        
}
,

        
"name"
:
 
"Assets - Cost"
,

        
"display_name"
:
 
"Assets - Cost"
,

        
"included_in_chart"
:
 
true
,

        
"nominal_code"
:
 
1
,

        
"ledger_account_type"
:
 
{

          
"id"
:
 
"FIXED_ASSETS"
,

          
"displayed_as"
:
 
"Fixed Assets"
,

          
"$path"
:
 
"/ledger_account_types/FIXED_ASSETS"

        
}
,

        
"ledger_account_classification"
:
 
null
,

        
"tax_rate"
:
 
{

          
"id"
:
 
"GB_STANDARD"
,

          
"displayed_as"
:
 
"Standard 20.00%"
,

          
"$path"
:
 
"/tax_rates/GB_STANDARD"

        
}
,

        
"fixed_tax_rate"
:
 
true
,

        
"visible_in_banking"
:
 
false
,

        
"visible_in_expenses"
:
 
true
,

        
"visible_in_journals"
:
 
true
,

        
"visible_in_other_payments"
:
 
true
,

        
"visible_in_other_receipts"
:
 
true
,

        
"visible_in_reporting"
:
 
true
,

        
"visible_in_sales"
:
 
false
,

        
"balance_details"
:
 
{

          
"balance"
:
 
"186.7"
,

          
"credit_or_debit"
:
 
"debit"
,

          
"credits"
:
 
"100.0"
,

          
"debits"
:
 
"286.7"
,

          
"from_date"
:
 
null
,

          
"to_date"
:
 
null

        
}
,

        
"is_control_account"
:
 
false
,

        
"control_name"
:
 
null
,

        
"display_formatted"
:
 
"0001 - Assets - Cost"

      
}
,

      
"details"
:
 
"Asset side"
,

      
"debit"
:
 
"100.0"
,

      
"credit"
:
 
"0.0"
,

      
"include_on_tax_return"
:
 
true
,

      
"tax_reconciled"
:
 
false
,

      
"cleared"
:
 
false
,

      
"bank_reconciled"
:
 
false

    
}
,

    
{

      
"id"
:
 
"e95a01ac9ad94489a25d4aadfe3f2d39"
,

      
"ledger_account"
:
 
{

        
"id"
:
 
"bf15ab254a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Motor Vehicles - Cost (0050)"
,

        
"$path"
:
 
"/ledger_accounts/bf15ab254a9111e797950a57719b2edb"
,

        
"created_at"
:
 
"2017-06-06T08:25:49Z"
,

        
"updated_at"
:
 
"2017-06-06T08:25:49Z"
,

        
"ledger_account_group"
:
 
{

          
"id"
:
 
"ASSET"
,

          
"displayed_as"
:
 
"Asset"

        
}
,

        
"name"
:
 
"Motor Vehicles - Cost"
,

        
"display_name"
:
 
"Motor Vehicles - Cost"
,

        
"included_in_chart"
:
 
true
,

        
"nominal_code"
:
 
50
,

        
"ledger_account_type"
:
 
{

          
"id"
:
 
"FIXED_ASSETS"
,

          
"displayed_as"
:
 
"Fixed Assets"
,

          
"$path"
:
 
"/ledger_account_types/FIXED_ASSETS"

        
}
,

        
"ledger_account_classification"
:
 
null
,

        
"tax_rate"
:
 
{

          
"id"
:
 
"GB_STANDARD"
,

          
"displayed_as"
:
 
"Standard 20.00%"
,

          
"$path"
:
 
"/tax_rates/GB_STANDARD"

        
}
,

        
"fixed_tax_rate"
:
 
true
,

        
"visible_in_banking"
:
 
false
,

        
"visible_in_expenses"
:
 
false
,

        
"visible_in_journals"
:
 
true
,

        
"visible_in_other_payments"
:
 
true
,

        
"visible_in_other_receipts"
:
 
true
,

        
"visible_in_reporting"
:
 
true
,

        
"visible_in_sales"
:
 
false
,

        
"balance_details"
:
 
{

          
"balance"
:
 
"0.0"
,

          
"credit_or_debit"
:
 
"debit"
,

          
"credits"
:
 
"100.0"
,

          
"debits"
:
 
"100.0"
,

          
"from_date"
:
 
null
,

          
"to_date"
:
 
null

        
}
,

        
"is_control_account"
:
 
false
,

        
"control_name"
:
 
null
,

        
"display_formatted"
:
 
"0050 - Motor Vehicles - Cost"

      
}
,

      
"details"
:
 
"Motor Vehicle Cost side"
,

      
"debit"
:
 
"0.0"
,

      
"credit"
:
 
"100.0"
,

      
"include_on_tax_return"
:
 
true
,

      
"tax_reconciled"
:
 
false
,

      
"cleared"
:
 
false
,

      
"bank_reconciled"
:
 
false

    
}

  
]
,

  
"migrated"
:
 
false

}
```
### Edit a Journal
It is not currently possible to edit a journal or its lines using a PUT request via the API. It would therefore be recommended that a user was to delete the journal in question with a DELETE request, and re-POST a new one with the corrects/alterations made, or use the Accounting application to make amendments.
### Delete a Journal
It is very straightforward to perform a DELETE request to delete a journal, all you are required to do is ensure you know the id of the journal and make a request as follows:
```
txt
Copy
DELETE /journals/{id}
```
This will return an empty response of status 204 – No content.