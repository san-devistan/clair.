Invoicing, both sales and purchase, is the hot spot of Accounting. Chances are you will need to read them or create them.
## Sales vs. Purchase Invoices
You can create invoices for sales and purchases using the API. Both share many attributes, you just have to use different types of objects. For instance, in a purchase invoice, the contact you'll be using will have the contact_type_id VENDOR , while for a sales invoice, you'll be using a CUSTOMER . The other difference are the ledger accounts being used on the invoice items. For purchase invoices, the ledger accounts will have to be from the EXPENSE ledger account group, for sales invoices from the INCOME ledger account group.
## Creating an Invoice
An invoice references many other objects: A contact, a ledger account per invoice item, one or more tax rates and maybe a product or a service. Some of those objects have already been created or are present by default, some of them you have to create before you can build the invoice.
### Create Or Find A Contact
First, you'll need a contact the invoice gets assigned to. To create one, send a POST request to the contacts endpoint:
```
txt
Copy
POST /contacts
Content-Type: application/json

{
  "contact": {
    "contact_type_ids": ["CUSTOMER"],
    "name": "Great Example Inc",
    "main_address": {
      "address_type_id": "ACCOUNTS",
      "address_line_1": "Some Where",
      "city": "LA",
      "region": "US-CA",
      "postal_code": "90210",
      "country_group_id": "US"
    }
  }
}
```
This creates a very simple customer contact account. To create a vendor account, use VENDOR in the contact_type_ids array. Please note that you cannot assign more than one contact_type_id .
The beginning of the server response will look like this:
```
json
Copy
{

  
"id"
:
 
"14d93840783b11e8990a122c8428e4b2"
,

  
"displayed_as"
:
 
"Great Example Inc"
,

  
"$path"
:
 
"/contacts/14d93840783b11e8990a122c8428e4b2"
,

  
"created_at"
:
 
"2018-06-25T05:46:18Z"
,

  
"updated_at"
:
 
"2018-06-25T05:46:18Z"
,

  
"links"
:
 
[

    
{

      
"href"
:
 
"https://accounting.na.sageone.com/contacts/customers/3887951"
,

      
"rel"
:
 
"alternate"
,

      
"type"
:
 
"text/html"

    
}

  
]
,

  
"contact_types"
:
 
[

    
{

      
"id"
:
 
"CUSTOMER"
,

      
"displayed_as"
:
 
"Customer"
,

      
"$path"
:
 
"/contact_types/CUSTOMER"

    
}

  
]
,

  
"name"
:
 
"Great Example Inc"

}
```
You will need the id from the response. It makes sense to store that ID in your system so that you do not have to look it up via the API each time you need it.
To lookup an existing customer, you can use the following query:
```
txt
Copy
GET /contacts?contact_type_id=CUSTOMER&search=Great%20Example%20Inc
```
This will search for Great Example Inc with the user's customers. To search for a vendor, use VENDOR as contact_type_id . You can also search for an email address by adding &email=person%40greatexample.inc . The result will contain all matching contacts in the items array. Choose the appropriate one (or let the user choose) and memorize the ID for using it in the invoice.
### Find A Ledger Account For Each Invoice Item
For each invoice item, you (or the user) have to select an appropriate ledger account. For sales, there is a default_sales_ledger_account attribute on the contact, which you might want to use. Alternatively, you can use an API request to get a list of suitable accounts for sales invoices:
```
txt
Copy
GET /ledger_accounts?visible_in=sales&items_per_page=200
```
This will return a list like this:
```
json
Copy
{

  
"$total"
:
 
7
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
 
"4195173e75db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Professional Fees (4000)"
,

      
"$path"
:
 
"/ledger_accounts/4195173e75db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"4195196a75db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Sales of Materials (4050)"
,

      
"$path"
:
 
"/ledger_accounts/4195196a75db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"41951b8675db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Interest Income (4100)"
,

      
"$path"
:
 
"/ledger_accounts/41951b8675db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"41951dae75db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Finance Charge Income (4200)"
,

      
"$path"
:
 
"/ledger_accounts/41951dae75db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"41951fc875db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Other Income (4300)"
,

      
"$path"
:
 
"/ledger_accounts/41951fc875db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"419521fd75db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Uncategorized Income (4400)"
,

      
"$path"
:
 
"/ledger_accounts/419521fd75db11e8990a122c8428e4b2"

    
}
,

    
{

      
"id"
:
 
"4195240d75db11e8990a122c8428e4b2"
,

      
"displayed_as"
:
 
"Sales/Fees Discounts (4900)"
,

      
"$path"
:
 
"/ledger_accounts/4195240d75db11e8990a122c8428e4b2"

    
}

  
]

}
```
Please cache this kind of data. The ledger accounts for a user may change, but they're not expected to change often. It doesn't make much sense to query for ledger accounts every minute.
For getting a list of suitable ledger accounts on purchase invoices, use the following query:
```
txt
Copy
GET /ledger_accounts?visible_in=expenses&items_per_page=200
```
This will return all expense ledger accounts. On vendor contacts, there is also a default_purchase_ledger_account attribute.
### Find A Tax Rate For Each Item
Now that you have contact and ledger account IDs, you will need to find a tax rate for each invoice item. For sales invoices, you might be able to use the default_sales_tax_rate attribute from the contact, but this is not set on each contact.
The following API request will list available tax rates for the user:
```
txt
Copy
GET /tax_rates?attributes=name,percentage&items_per_page=200
```
The attributes=name,percentage will make sure that the name and the percentage are included in the collection response. By default, only id , displayed_as and $path are present in collection responses. items_per_page allows you to get up to 200 items per request. By default, the API returns 20 items per request.
For some countries, there are region specific tax rates. You can filter for them using the address_region_id query param:
```
txt
Copy
GET /tax_rates?attributes=name,percentage&address_region_id=CA-QC
```
For a list of available tax regions, use
```
txt
Copy
GET /address_regions?items_per_page=200
```
As with the ledger accounts, it is advisable to cache the results. In any case, you need to memorize the tax rate id and percentage for each invoice item.
### Optional: Find Or Create A Product Or Service For Each Item
In Accounting, users can create products and services. Those objects have a name, a price and reference ledger accounts and tax rates. In sales invoices, products and services should be used when applicable so that the user can track the sales on his products and services. In purchase invoices, products can be referenced. This allows users to see their products' profits and it also helps keeping track of their inventory.
There are API requests to list existing products
```
txt
Copy
GET /products?active=true
```
and services
```
txt
Copy
GET /services?active=true
```
When creating a product, you will need a ledger account ID that is used for sales and one that is used when purchasing the product. See above for obtaining those. You can also add prices to the product, for this, you will need product sales price type ids. To get those, use GET /product_sales_price_types . For convenience, you can set a tax rate that is used when selling the product.
Then, you can create the product:
```
txt
Copy
POST /products
Content-Type: application/json

{
  "product": {
    "description": "An example product",
    "item_code": "PRODUCT-01",
    "sales_ledger_account_id": "4195196a75db11e8990a122c8428e4b2",
    "sales_tax_rate_id": "584793ca75db11e8990a122c8428e4b2",
    "purchase_ledger_account_id": "4194d2b875db11e8990a122c8428e4b2",
    "sales_prices": [
      {
        "product_sales_price_type_id": "41a77be375db11e8990a122c8428e4b2",
        "price": "9.99",
        "price_includes_tax": true
      }
    ]
  }
}
```
When creating a service, you need a ledger account and a description. Optionally, you can add sales prices and a tax rate. For the prices, you need to get service rate type ids from GET /service_rate_type_ids . You can add different prices for each service rate type ID on a service.
```
txt
Copy
POST /services
Content-Type: application/json

{
  "service": {
    "description": "An example service",
    "item_code": "SERVICE-01",
    "sales_ledger_account_id": "4195173e75db11e8990a122c8428e4b2",
    "sales_tax_rate_id": "584793ca75db11e8990a122c8428e4b2",
    "sales_prices": [
      {
        "service_rate_type_id": "41ab074075db11e8990a122c8428e4b2",
        "rate": "19.99",
        "price_includes_tax": false
      }
    ]
  }
}
```
### Build The Invoice
Now, you have all the objects that are required for creating the invoice via the API and we can start building the JSON body that will be used.
There are three required attributes: The contact_id , the invoice's date and the invoice_lines .
For the contact_id , see above to learn how to get one. Make sure to use a contact with a contact_type_id of CUSTOMER for sales invoices and VENDOR for purchase invoices.
The date is the date on the invoice. This can be the current date, but this is not required — you can also create an invoice for the previous year (but not before the financial_settings.accounts_start_date of the business).
The invoice_lines attribute is an array of invoice line objects, which we will describe now:
#### Building An Invoice Line
An entry in the invoice_lines array has the following required attributes:
- description : A string that describes the item
- ledger_account_id : An ID that identifies the ledger account for this item
- quantity
- unit_price
- tax_rate_id : The tax rate used for this invoice line
- tax_amount : The tax amount (not for tax rates 'zero', 'no tax', and 'exempt'; not allowed for Spanish businesses) Your application has to calculate the tax amount (if there is no other source, ie. on purchase invoices) and send in a value. If optional and omitted, the tax amount will be set to zero. To calculate the tax amount, you will need the percentage value of the tax rate for the line item. The formula then is tax_amount = net_amount * tax_percentage / 100 Ensure you round the result to two decimal places. This is the only precision supported by Accounting. Attention: Floating point representations in JSON can be tricky. Please send decimal values as strings!
The following attributes are optional (there are even more, but let's concentrate on the most important ones):
- product_id : An ID that identifies the product that has been sold or purchased
- service_id : The ID that identifies the service that has been sold (only on sales invoices)
- net_amount : The net amount
- total_amount : The total amount for the invoice line
- discount_amount : The discount amount for the invoice line
Let's have a look at some examples:
A minimal invoice item:
```
json
Copy
{

  
"description"
:
 
"A Minimal Invoice Item"
,

  
"ledger_account_id"
:
 
"4195173e75db11e8990a122c8428e4b2"
,

  
"quantity"
:
 
"1"
,

  
"unit_price"
:
 
"0.99"
,

  
"tax_rate_id"
:
 
"584793ca75db11e8990a122c8428e4b2"

}
```
An invoice item that contains pre-calculated values for tax amount and discount:
```
json
Copy
{

  
"description"
:
 
"An Invoice Item With Pre-Calculated Tax"
,

  
"ledger_account_id"
:
 
"4195173e75db11e8990a122c8428e4b2"
,

  
"quantity"
:
 
"1"
,

  
"unit_price"
:
 
"110.00"
,

  
"tax_rate_id"
:
 
"584793ca75db11e8990a122c8428e4b2"
,

  
"discount_amount"
:
 
"10.00"
,

  
"tax_amount"
:
 
"9.95"

}
```
An invoice item that references a service:
```
json
Copy
{

  
"description"
:
 
"An Invoice Item For A Service"
,

  
"ledger_account_id"
:
 
"4195173e75db11e8990a122c8428e4b2"
,

  
"quantity"
:
 
"1"
,

  
"unit_price"
:
 
"19.99"
,

  
"tax_rate_id"
:
 
"584793ca75db11e8990a122c8428e4b2"
,

  
"service_id"
:
 
"086b655f785411e8990a122c8428e4b2"

}
```
And finally one that references a product:
```
json
Copy
{

  
"description"
:
 
"An Invoice Item For A Product"
,

  
"ledger_account_id"
:
 
"4195173e75db11e8990a122c8428e4b2"
,

  
"quantity"
:
 
"1"
,

  
"unit_price"
:
 
"9.99"
,

  
"tax_rate_id"
:
 
"584793ca75db11e8990a122c8428e4b2"
,

  
"product_id"
:
 
"a083714f784c11e8990a122c8428e4b2"

}
```
You have to build such on object for each item on the invoice. Once you have that array, you can add optional attributes to your invoice.
#### Adding Optional Attributes To The Invoice
Optional attributes can be used to add more data to the invoice and to deviate from defaults that would be used without them. Let's concentrate on the most important ones:
- invoice_number : Especially important for purchase invoices, where the vendor will have included a number on his invoice. Can be used for sales invoices as well, but be careful, as Accounting tries to auto-number all the invoices it created. The next invoice number created will be the last one's plus 1 by default. If you send in your own value which differs from that, this might result in a gap between invoice numbers, which should be avoided, as the numbering must be consistent. You can check the next invoice number to be used by fetching GET /invoice_settings in the next_invoice_number attribute.
- due_date : A specific due date for this invoice. If not set on sales invoices, defaults to date plus contact.credit_days , or, if this is not present, the business' default number of credit days.
- reference : A random string that you can use to reference any other, even external entity, for instance a quote.
- supplier_reference : This attribute, which is only available on purchase invoices, is a string that takes any reference the supplier provided, so that the user can find the invoice easily.
- notes : A string that is kept internally, only visible to the Accounting user(s).
- terms_and_conditions : A string that may be printed on the invoice.
- currency_id : This is used for the multi-currency feature, which will be covered in another guide in the future. Stay tuned!
#### Adding Shipping Costs (Only On Sales)
There are some attributes you can use on the sales invoice object to add shipping costs:
- shipping_net_amount : The net amount paid for shipping
- shipping_tax_rate_id : The tax rate ID
- shipping_tax_amount : The tax amount. Will be calculated when omitted.
For purchase invoices, please add a separate invoice line for shipping costs.
#### Creating Draft Or Pro Forma Invoices
You can create draft and pro forma sales invoices using the status_id attribute. Those invoices are handled like normal invoices, but they do not affect the accounts, ie., no transaction gets created when those invoices are saved. To create a draft invoice, set status to DRAFT , for pro forma invoices, use PRO_FORMA .
### Send The POST Request
Now that we've built the request body, we can send it to the API:
```
txt
Copy
POST /sales_invoices
Content-Type: application/json

{
  "sales_invoice": {
    "contact_id": "14d93840783b11e8990a122c8428e4b2",
    "date": "2018-06-24",
    "invoice_lines": [
      {
        "description": "A Minimal Invoice Item",
        "ledger_account_id": "4195173e75db11e8990a122c8428e4b2",
        "quantity": "1",
        "unit_price": "0.99",
        "tax_rate_id": "584793ca75db11e8990a122c8428e4b2"
      },
      {
        "description": "An Invoice Item With Pre-Calculated Tax",
        "ledger_account_id": "4195173e75db11e8990a122c8428e4b2",
        "quantity": "1",
        "unit_price": "110.00",
        "tax_rate_id": "584793ca75db11e8990a122c8428e4b2",
        "discount_amount": "10.00",
        "tax_amount": "9.95"
      },
      {
        "description": "An Invoice Item For A Service",
        "ledger_account_id": "4195173e75db11e8990a122c8428e4b2",
        "quantity": "1",
        "unit_price": "19.99",
        "tax_rate_id": "584793ca75db11e8990a122c8428e4b2",
        "service_id": "086b655f785411e8990a122c8428e4b2"
      }
    ]
  }
}
```
The server will respond with a 201 Created status code on success. The response body will contain a full representation of the created invoice object.
### Side Effects Of An Invoice Creation
When creating an invoice that is not a draft or pro forma, a transaction will be created that updates the balances of all the ledger accounts referenced in the invoice lines. The transaction will be against a holding account, as each newly created invoice is unpaid. If you want to record a payment against an invoice, you will have to create an additional contact_payment object .
Depending on the business' accounting type and tax scheme, tax entries will be created as soon as the invoice is created or as soon as there's a payment on it.
## Understanding Invoice Representations
For understanding the API representation of an invoice, let's have a look at a draft invoice that has been created in the Web UI. Here you can see how the elements in the UI map to attributes in the JSON representation.
When using GET /sales_invoices/{id} , a very long response is returned. Don't be afraid, we'll explain the important parts bit by bit. Let's begin with the first part:
```
json
Copy
  
"id"
:
 
"e5aff2cd745011e8863412a7e3287944"
,

  
"displayed_as"
:
 
"SI-DRAFT"
,

  
"$path"
:
 
"/sales_invoices/e5aff2cd745011e8863412a7e3287944"
,

  
"transaction"
:
 
null
,

  
"transaction_type"
:
 
{

    
"id"
:
 
"SALES_INVOICE"
,

    
"displayed_as"
:
 
"Sales Invoice"
,

    
"$path"
:
 
"/transaction_types/SALES_INVOICE"

  
}
,

  
"created_at"
:
 
"2018-06-20T06:12:23Z"
,

  
"updated_at"
:
 
"2018-06-20T06:12:23Z"
,

  
"links"
:
 
[

    
{

      
"href"
:
 
"https://accounting.na.sageone.com/invoicing/sales_invoices/e5aff2cd745011e8863412a7e3287944"
,

      
"rel"
:
 
"alternate"
,

      
"type"
:
 
"text/html"

    
}

  
]
,

  
"tax_calculation_method"
:
 
null
,

  
"invoice_number"
:
 
"SI-DRAFT"
,
```
id , displayed_as and $path are attributes that are common to most endpoints in the Accounting API. displayed_as will always contain a representation of the object that is suitable for displaying to an end user.
transaction is null here, because the invoice has been created as draft.
transaction_type references the type of the transaction that would have been created if the invoice wasn't draft.
created_at and updated_at are very common throughout the API as well.
links is an array of relevant links for this object. In this case, there is a link to the invoice's representation in the Accounting web UI.
tax_calculation_method is not applicable for this invoice, so it is set to null . Possible values are invoice , cash and retailer .
The invoice_number contains the string DRAFT , this would be replaced by the next free invoice number when converting to a real invoice.
### The Contact
Let's continue with the next few lines:
```
json
Copy
  
"contact_name"
:
 
"A Really nice customer Inc"
,

  
"contact_reference"
:
 
null
,

  
"contact"
:
 
{

    
"id"
:
 
"3a1d5799745011e8863412a7e3287944"
,

    
"displayed_as"
:
 
"A Really nice customer Inc"
,

    
"$path"
:
 
"/contacts/3a1d5799745011e8863412a7e3287944"

  
}
,
```
The contact to which the invoice is assigned to is not only referenced by its id , also, the contact's name is copied over to the invoice. This is important as a contact's name can change, but it must not change on any issued invoice. When displaying the contact of an existing invoice, always prefer to display the attributes directly on the invoice for that reason.
### Invoice Dates And Reference
```
json
Copy
  
"date"
:
 
"2018-06-20"
,

  
"due_date"
:
 
"2018-07-20"
,

  
"reference"
:
 
"AB-123"
,
```
The date is not the creation date of the invoice, but the date when the invoice is issued at. It is printed on the invoice and is the date that is used on the transaction. The due_date informs the customer about the date when they should have paid the invoice and reference is a string the user can assign to the invoice to help them identify it.
### Address
```
json
Copy
  
"main_address_free_form"
:
 
"Some Where\nOver The Rainbow CA 90210"
,

  
"main_address"
:
 
{

    
"id"
:
 
"e5ba36cb745011e8863412a7e3287944"
,

    
"displayed_as"
:
 
"Some Where\nOver The Rainbow CA 90210"
,

    
"$path"
:
 
"/contacts/e5ba36cb745011e8863412a7e3287944"
,

    
"address_type"
:
 
{

      
"id"
:
 
"SALES"
,

      
"displayed_as"
:
 
"Sales"
,

      
"$path"
:
 
"/address_types/SALES"

    
}
,

    
"address_line_1"
:
 
"Some Where"
,

    
"address_line_2"
:
 
""
,

    
"city"
:
 
"Over The Rainbow"
,

    
"region"
:
 
"CA"
,

    
"postal_code"
:
 
"90210"
,

    
"country"
:
 
{

      
"id"
:
 
"US"
,

      
"displayed_as"
:
 
"United States (US)"
,

      
"$path"
:
 
"/countries/US"

    
}
,

    
"country_group"
:
 
{

      
"id"
:
 
"US"
,

      
"displayed_as"
:
 
"US"
,

      
"$path"
:
 
"/country_groups/US"

    
}

  
}
,
```
Like the contact_name , its main address gets copied over to the invoice in the main_address_free_form attribute. The complete representation of the main_address is also included in the invoice. The same is true for the delivery address, so we'll skip that section and go to:
### Notes And Terms
```
json
Copy
  
"notes"
:
 
"Comments are internal, only you see them"
,

  
"terms_and_conditions"
:
 
"Terms and Conditions will be printed on the invoice PDF."
,
```
notes and terms_and_conditions are attributes directly visible to the user, with the latter being printed on the invoice, while the former is internal.
### Shipping Amounts
```
json
Copy
  
"shipping_net_amount"
:
 
"0.0"
,

  
"shipping_tax_rate"
:
 
{

    
"id"
:
 
"95670c34738211e8863412a7e3287944"
,

    
"displayed_as"
:
 
"No Tax"
,

    
"$path"
:
 
"/tax_rates/95670c34738211e8863412a7e3287944"

  
}
,

  
"shipping_tax_amount"
:
 
"0.0"
,

  
"shipping_tax_breakdown"
:
 
[

  
]
,

  
"shipping_total_amount"
:
 
"0.0"
,
```
These attributes describe the shipping net, tax and total amounts and the tax rate used to calculate the tax amount. They are only available on sales invoices.
### Totals
```
json
Copy
  
"net_amount"
:
 
"294.0"
,

  
"tax_amount"
:
 
"27.2"
,

  
"total_amount"
:
 
"321.2"
,

  
"total_quantity"
:
 
"10.0"
,

  
"total_discount_amount"
:
 
"6.0"
,
```
You'll get the totals for the complete invoice in net_amount , tax_amount and total_amount .
### Payments And Allocations
```
json
Copy
  
"payments_allocations_total_amount"
:
 
"0.0"
,

  
"payments_allocations_total_discount"
:
 
"0.0"
,

  
"total_paid"
:
 
"0.0"
,

  
"outstanding_amount"
:
 
"0.0"
,
```
These attributes show you how much money has been paid or allocated for this invoice. As it is a draft invoice, there cannot be any payments, so all of them are zero here.
### Multi-Currency
```
json
Copy
  
"currency"
:
 
{

    
"id"
:
 
"USD"
,

    
"displayed_as"
:
 
"US Dollar (USD)"
,

    
"$path"
:
 
"/currencies/USD"

  
}
,

  
"exchange_rate"
:
 
"1.0"
,

  
"inverse_exchange_rate"
:
 
"1.0"
,

  
"base_currency_shipping_net_amount"
:
 
"0.0"
,

  
"base_currency_shipping_tax_amount"
:
 
"0.0"
,

  
"base_currency_shipping_tax_breakdown"
:
 
[

  
]
,

  
"base_currency_shipping_total_amount"
:
 
"0.0"
,

  
"base_currency_total_discount_amount"
:
 
"6.0"
,

  
"base_currency_net_amount"
:
 
"294.0"
,

  
"base_currency_tax_amount"
:
 
"27.2"
,

  
"base_currency_total_amount"
:
 
"321.2"
,

  
"base_currency_outstanding_amount"
:
 
"0.0"
,
```
Above attributes are relevant when using the multi-currency feature, which will be covered in a future guide.
### Status
```
json
Copy
  
"status"
:
 
{

    
"id"
:
 
"DRAFT"
,

    
"displayed_as"
:
 
"Draft"
,

    
"$path"
:
 
"/artefact_statuses/DRAFT"

  
}
,

  
"sent"
:
 
false
,

  
"void_reason"
:
 
null
,
```
The status attribute describes the state of the invoice. See below in the section "Change The State Of An Invoice" for details on this.
The sent attribute is just a marker if the invoice has been sent to the customer, so it is only relevant for sales documents.
The void_reason is only present when the status id is VOID . It is a user provided string that describes the reason why the invoice has been voided.
### Invoice Lines
And then, there are the invoice_lines . Let's have a look at one of them, step after step:
```
json
Copy
    
{

      
"id"
:
 
"e5c61f6b745011e8863412a7e3287944"
,

      
"displayed_as"
:
 
"The first invoice item"
,

      
"description"
:
 
"The first invoice item"
,
```
Each invoice line has its own ID, this allows updating any line without having to care for the lines order.
```
json
Copy
      
"product"
:
 
null
,

      
"service"
:
 
null
,
```
If the line has been associated with a product or service, this would be referenced here.
```
json
Copy
      
"ledger_account"
:
 
{

        
"id"
:
 
"95c4353c738211e8863412a7e3287944"
,

        
"displayed_as"
:
 
"Professional Fees (4000)"
,

        
"$path"
:
 
"/ledger_accounts/95c4353c738211e8863412a7e3287944"

      
}
,
```
The ledger account which is used for the invoice line. When the invoice is taken into account, there is a transaction with a ledger entry against this account.
```
json
Copy
      
"trade_of_asset"
:
 
false
,

      
"quantity"
:
 
"1.0"
,

      
"unit_price"
:
 
"10.0"
,

      
"net_amount"
:
 
"9.0"
,
```
Of those attributes, the Boolean trade_of_asset needs some explanation. When this is set to true , the item is meant for resale. This is important for flat tax rates in some countries.
```
json
Copy
      
"tax_rate"
:
 
{

        
"id"
:
 
"adac0c97738211e8863412a7e3287944"
,

        
"displayed_as"
:
 
"Beverly Hills, CA 9.25%"
,

        
"$path"
:
 
"/tax_rates/adac0c97738211e8863412a7e3287944"

      
}
,

      
"tax_amount"
:
 
"0.83"
,

      
"tax_breakdown"
:
 
[

        
{

          
"tax_rate"
:
 
{

            
"id"
:
 
"adac0c97738211e8863412a7e3287944"
,

            
"displayed_as"
:
 
"Beverly Hills, CA 9.25%"
,

            
"$path"
:
 
"/tax_rates/adac0c97738211e8863412a7e3287944"

          
}
,

          
"percentage"
:
 
"9.25"
,

          
"amount"
:
 
"0.83"

        
}

      
]
,

      
"total_amount"
:
 
"9.83"
,

      
"base_currency_unit_price"
:
 
"10.0"
,

      
"unit_price_includes_tax"
:
 
false
,
```
These attributes provide information about the tax amount and how it has been calculated.
```
json
Copy
      
"base_currency_net_amount"
:
 
"9.0"
,

      
"base_currency_tax_amount"
:
 
"0.83"
,

      
"base_currency_tax_breakdown"
:
 
[

        
{

          
"tax_rate"
:
 
{

            
"id"
:
 
"adac0c97738211e8863412a7e3287944"
,

            
"displayed_as"
:
 
"Beverly Hills, CA 9.25%"
,

            
"$path"
:
 
"/tax_rates/adac0c97738211e8863412a7e3287944"

          
}
,

          
"percentage"
:
 
"9.25"
,

          
"amount"
:
 
"0.83"

        
}

      
]
,

      
"base_currency_total_amount"
:
 
"9.83"
,
```
This is relevant for the multi-currency feature, which will be covered in a future guide.
```
json
Copy
      
"eu_goods_services_type"
:
 
null
,

      
"discount_amount"
:
 
"1.0"
,

      
"base_currency_discount_amount"
:
 
"1.0"
,

      
"discount_percentage"
:
 
"10.0"
,

      
"eu_sales_description"
:
 
null

    
}
,
```
As you can see, the first invoice line has been created using a discount percentage of 10%, which is an amount of 1.0.
### Tax Analysis
After the invoice_lines , there are a couple of other attributes:
```
json
Copy
  
"tax_analysis"
:
 
[

    
{

      
"tax_rate"
:
 
{

        
"id"
:
 
"adac0c97738211e8863412a7e3287944"
,

        
"displayed_as"
:
 
"Beverly Hills, CA 9.25%"
,

        
"$path"
:
 
"/tax_rates/adac0c97738211e8863412a7e3287944"

      
}
,

      
"net_amount"
:
 
"294.0"
,

      
"tax_amount"
:
 
"27.2"
,

      
"total_amount"
:
 
"321.2"
,

      
"goods_amount"
:
 
"0.0"
,

      
"service_amount"
:
 
"0.0"

    
}

  
]
,
```
### Other Attributes
There are some more attributes, but those were the most important ones.
## Changing The State Of An Invoice
Each invoice can have one of at the moment eight statuses. You can get a full list of them by requesting GET /artefact_statutes . Here is a list of the present statuses and their meanings:
| Status | Meaning |
| --- | --- |
| UNPAID | The invoice is taken into account, but no payments or allocations have been recorded. |
| PART_PAID | The invoice is taken into account, there are payments or allocations, but there is an outstanding amount on the invoice. |
| PAID | The invoice is taken into account and has been fully paid. |
| VOID | The invoice has been cancelled. |
| DRAFT | The invoice is not taken into account. There cannot be any payments or allocations on it. |
| DISPUTED | The invoice has been marked as disputed. This status is only available on purchases. |
| DECLINED | The artefact has been marked as declined. It is only available on sales quotes. |
| PRO_FORMA | The invoice is not taken into account. There cannot be any payments or allocations on it. |
Directly after creation, invoices can only be UNPAID , DRAFT or PRO_FORMA . The following sections describe how the status can be changed via the API.
### From Draft Or Pro Forma To Unpaid
To change the status from DRAFT or PRO_FORMA to unpaid, you have to send a POST request to the invoice's path plus /release . You do not have to send a POST body. For example, for a sales invoice:
```
txt
Copy
POST /sales_invoices/{id}/release
```
This will return a full representation of the invoice and change its status ID to UNPAID .
### From Unpaid To Part Paid Or Paid
You cannot change the status of an invoice to PART_PAID or PAID by updating the invoice itself. Instead, you'll have to create either a contact_payment or a contact_allocation object. For the former, please see the Payments Concept guide for details. A contact allocation can be used to allocate one or more invoices against one or more credit notes/payments on account:
```
txt
Copy
POST /contact_allocations
Content-Type: application/json

{
  "contact_allocation": {
    "contact_id": "14d93840783b11e8990a122c8428e4b2",
    "allocated_artefacts": [
      {
        "artefact_id": "c2bab86f786f11e8990a122c8428e4b2",
        "amount": "100.0"
      },
      {
        "artefact_id": "108973dc787311e8990a122c8428e4b2",
        "amount": "-100.0"
      }
    ],
    "transaction_type_id": "CUSTOMER_ALLOCATION"
  }
}
```
The contact_id includes the vendor's or customer's ID, the transaction_type_id needs to be CUSTOMER_ALLOCATION for allocating sales artefacts and VENDOR_ALLOCATION for purchase artefacts. The allocated_artefacts attribute is an array with objects referencing credit notes, unallocated payments and invoices. The sum of the amounts must to be zero - you always remove credit and add debit here. In other words: For a customer allocation, the amount on the credit note is negative and the amount on the invoice is positive. For a vendor allocation, it is the other way round: The credit note gets a positive value, the invoice a negative.
You can create payments or allocations until the invoice is fully paid.
### From Unpaid To Void (Sales Invoices)
Cancelling a sales invoice is done by a DELETE request against the invoice's $path :
```
txt
Copy
DELETE /sales_invoices/{id}
Content-Type: application/json

{
  "void_reason": "Invoice was created by accident"
}
```
Please note that you have to submit a body with the DELETE request. The body must include a single param: void_reason . This is a random string that describes why the invoice has been voided.
Cancelling an invoice also voids the transaction that has been created for the invoice, ie., the balances of the ledger accounts are updated with that operation.
### From Part Paid Or Paid To Void
You cannot directly void any invoice that has payments or allocations. Instead, you have to delete all the payments and allocations first. The invoice's status will change to UNPAID , which will allow you to void the invoice as described above.
This may seem a bit complicated, but if you could void an invoice without removing the payments, the accounts would get incorrect balances and this must not happen in accounting.
### From Any State To Disputed
This is currently not possible using the API. Sorry for that.
### Deleting Invoices (Purchases)
Purchase invoices without payments or allocations can be deleted without passing a void_reason :
```
txt
Copy
DELETE /purchase_invoices/{id}
```
This will return a 204 No Content response. The transaction that was created together with the invoice will be voided automatically.
## Other Document Types
Invoicing is not just about invoices. For instance, when an Accounting user gets or issues a refund, a credit note can be created to represent that. The following document types are available in Accounting. The endpoints for them use the same data representations as the invoice endpoints, so using them is very similar.
### Credit Notes
Credit notes can be created for sales and purchases. They represent refunds received or issued. To get all existing purchase credit notes, you can use GET /purchase_credit_notes . The sales credit notes are available at GET /sales_credit_notes .
Credit notes affect the balances of the involved ledger accounts, ie., when a credit note is created, a transaction is created as well.
### Quotes And Estimates
Quotes and estimate documents can be created for sales. They do not affect the balances of the ledger accounts, after all, they are about business opportunities, no liabilities exist. Those are the endpoints for these two document types:
- GET /sales_quotes
- GET /sales_estimates
The only differences between them are the name and their invoice settings.
## Fetching The PDF Representation Of A Sales Document
For all sales documents, Accounting creates a PDF file. To fetch this PDF, set the Accept: HTTP header to application/pdf :
```
txt
Copy
GET /sales_invoices/{id}
Accept: application/pdf
```
This will return the PDF file in the response body.