### Overview
Termed with the name inventory, Sage Business Cloud Accounting (excluding Start) provides the ability to create, edit and delete records containing the different goods and services which a business buys and sells. Inventory functionality allows a business to maintain key information and activity relative to their products/services and provides essential reporting relative to popularity, profitability and stock value.
There are 3 different types of inventory record:
- Stock records - stock_items endpoint : Returns key information relative to each of the stock records.
- Non-Stock records - products endpoint : Returns all Stock and Non-Stock records. Key information relative to Stock records is not returned by this endpoint.
- Service records - services endpoint : Returns all records of type service.
It is possible to return the different record types with a GET request to the relative endpoint :
```
txt
Copy
GET /products
```
```
txt
Copy
GET /stock_items
```
```
txt
Copy
GET /services
```
```
json
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
 
"92b7697e4a9211e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Product One"
,

      
"$path"
:
 
"/products/92b7697e4a9211e797950a57719b2edb"

    
}
,

    
{

      
"id"
:
 
"8c9ecb543d6111e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Product Two"
,

      
"$path"
:
 
"/products/8c9ecb543d6111e8b45c025132dab352"

    
}
,

    
{

      
"id"
:
 
"42ef9c714a1911e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Stock Item One"
,

      
"$path"
:
 
"/products/42ef9c714a1911e8b45c025132dab352"

    
}

  
]

}
```
### Record types
#### Stock Item
Stock items are used when a business holds stock of a specific product and needs to track and maintain stock levels to ensure customer requirements are efficiently satisfied. Stock items provide key information such as quantity in stock, cost price and weight among other values. Sage Business Cloud Accounting provides reporting functionality to view sales, profit, movements and stock value.
The Accounting API provides key additional product detail for stock items through the 'stock_items' endpoint and includes fields which are not returned via the generic products endpoint . The below list displays the additonal attributes exposed by the stock_items endpoint which are not returned by the products endpoint :
- reorder_level : the minimum stock level a product stock quantity can fall to before being reordered.
- reorder_quantity : the quantity to be reordered if the reorder level is reached.
- location : the physical location where this stock item is stored. e.g. A warehouse or bin number.
- barcode : holds the product associated barcode.
- supplier_part_number : suppliers identifier for the part.
- weight : this is the weight of that product record.
- measurement_unit : the default unit of measurement.
- weight_converted : the weight of the unit of measurement.
- active : a Boolean flag set against the stock item that defines if the product can be used. It will not show in reports or API responses if this is set to false .
- quantity_in_stock : the current level held in stock for this item.
- last_cost_price : the last price paid on the most recent purchase invoice or stock adjustment.
- last_cost_price_stock_value : the stock value based on the last cost price and quantity held in stock.
- average_cost_price : the average price paid for the product. Calculated using the total price paid to date divided by the total quantity purchased.
- average_cost_price_stock_value : the stock value based on the average cost price and quantity held in stock.
- cost_price_last_updated : the date and time of the last purchase or stock adjustment.
```
txt
Copy
GET /stock_items/{id}
```
```
json
Copy
{

  
"id"
:
 
"42ef9c714a1911e8b45c025132dab352"
,

  
"displayed_as"
:
 
"Stock Item One"
,

  
"$path"
:
 
"/stock_items/42ef9c714a1911e8b45c025132dab352"
,

  
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

  
"updated_at"
:
 
"2019-01-22T13:56:05Z"
,

  
"item_code"
:
 
"Stock test"
,

  
"description"
:
 
"Stock test"
,

  
"notes"
:
 
""
,

  
"sales_ledger_account"
:
 
{

    
"id"
:
 
"bf15fce94a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Sales - Products (4000)"
,

    
"$path"
:
 
"/ledger_accounts/bf15fce94a9111e797950a57719b2edb"

  
}
,

  
"sales_tax_rate"
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

  
"purchase_ledger_account"
:
 
{

    
"id"
:
 
"bf15b03d4a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Stock (1000)"
,

    
"$path"
:
 
"/ledger_accounts/bf15b03d4a9111e797950a57719b2edb"

  
}
,

  
"usual_supplier"
:
 
null
,

  
"purchase_tax_rate"
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

  
"cost_price"
:
 
"2.0"
,

  
"sales_prices"
:
 
[

    
{

      
"id"
:
 
"8c9f3d4d3d6111e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Sales Price"
,

      
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

      
"updated_at"
:
 
"2018-10-23T09:37:00Z"
,

      
"price_name"
:
 
"Sales Price"
,

      
"price"
:
 
"11.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf2424844a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Sales Price"
,

        
"$path"
:
 
"/product_sales_price_types/bf2424844a9111e797950a57719b2edb"

      
}

    
}
,

    
{

      
"id"
:
 
"8ca0161c3d6111e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Trade"
,

      
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

      
"updated_at"
:
 
"2018-04-11T08:23:01Z"
,

      
"price_name"
:
 
"Trade"
,

      
"price"
:
 
"3.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf26959b4a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Trade"
,

        
"$path"
:
 
"/product_sales_price_types/bf26959b4a9111e797950a57719b2edb"

      
}

    
}
,

    
{

      
"id"
:
 
"8ca0de5d3d6111e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Wholesale"
,

      
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

      
"updated_at"
:
 
"2018-04-11T08:23:01Z"
,

      
"price_name"
:
 
"Wholesale"
,

      
"price"
:
 
"2.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf2718fe4a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Wholesale"
,

        
"$path"
:
 
"/product_sales_price_types/bf2718fe4a9111e797950a57719b2edb"

      
}

    
}

  
]
,

  
"source_guid"
:
 
null
,

  
"purchase_description"
:
 
""
,

  
"reorder_level"
:
 
"0.0"
,

  
"reorder_quantity"
:
 
"0.0"
,

  
"location"
:
 
""
,

  
"barcode"
:
 
""
,

  
"supplier_part_number"
:
 
""
,

  
"weight"
:
 
0
,

  
"measurement_unit"
:
 
"kg"
,

  
"weight_converted"
:
 
"0.0"
,

  
"active"
:
 
true
,

  
"quantity_in_stock"
:
 
"9.0"
,

  
"last_cost_price"
:
 
"2.0"
,

  
"last_cost_price_stock_value"
:
 
"18.0"
,

  
"average_cost_price"
:
 
"2.0"
,

  
"average_cost_price_stock_value"
:
 
"18.0"
,

  
"cost_price_last_updated"
:
 
"2018-04-11T08:23:52.000Z"

}
```
##### Product sales prices / Service Rates
Included in the response is an array of sales_prices , sales prices provide the ability to create and set new and existing price names and sales prices. As default, there are three different prices returned in the array :
- Sales Price
- Trade
- Wholesale
Each price includes:
- sales_prices_id : the unique identifier of the sales price.
- price_name : the name provided for that rate. The name can be changed by the user and should not be used to identify price types.
- price : the value assigned to the rate.
- price_includes_tax : used to indicate if the unit price is net or gross. Additional details of how to add tax inclusive products to sales artefact item lines can be found here .
- product_sales_price_types : different price types can be created in the settings. This array will list the id and name of the rate type set when the service was created.
Exposing the web application's functionality for Record and Transactions Settings &gt; Products & Services, the product_sales_price_types / service_rate_types endpoints exposes CRUD functionality allowing sales/service rates to be created, read, updated and deleted. In order for a sales/service rate to be deleted there has to be more than one rate available and the rate destined for deletion would first have to be classed as inactive, this requires a PUT request to unset the active flag :
##### Product sales prices
```
txt
Copy
POST /product_sales_price_types
```
```
txt
Copy
GET /product_sales_price_types
```
```
txt
Copy
PUT /product_sales_price_types/id
```
```
txt
Copy
DELETE /product_sales_price_types/id
```
##### Service rates
```
txt
Copy
POST /service_rate_types
```
```
txt
Copy
GET /service_rate_types
```
```
txt
Copy
PUT /service_rate_types/id
```
```
txt
Copy
DELETE /service_rate_types/id
```
#### Non-Stock Item
Products termed non-stock are those which the business may sell but holds no stock for. These may be items despatched directly from the supplier or items which are too expensive or sell too slowly to hold in stock. Non-Stock products can be added to sales and purchase invoices, but no checks are carried out to ensure stock levels are available and no stock movement is recorded.
Non-stock products are returned via a GET request to the products endpoint. It is not safe to assume that all products returned in the response are non-stock as the response includes stock items.
Attributes of specific non stock products are returned via a GET request to the products endpoint followed by the id of the product :
```
txt
Copy
GET /products/{id}
```
`
```
json
Copy
{

  
"id"
:
 
"92b7697e4a9211e797950a57719b2edb"
,

  
"displayed_as"
:
 
"Product used for test purposes"
,

  
"$path"
:
 
"/products/92b7697e4a9211e797950a57719b2edb"
,

  
"created_at"
:
 
"2017-06-06T08:31:44Z"
,

  
"updated_at"
:
 
"2017-06-06T08:31:44Z"
,

  
"item_code"
:
 
"Test Product"
,

  
"description"
:
 
"Product used for test purposes"
,

  
"notes"
:
 
""
,

  
"sales_ledger_account"
:
 
{

    
"id"
:
 
"bf15fce94a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Sales - Products (4000)"
,

    
"$path"
:
 
"/ledger_accounts/bf15fce94a9111e797950a57719b2edb"

  
}
,

  
"sales_tax_rate"
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

  
"purchase_ledger_account"
:
 
{

    
"id"
:
 
"bf1621884a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Cost of sales - goods (5000)"
,

    
"$path"
:
 
"/ledger_accounts/bf1621884a9111e797950a57719b2edb"

  
}
,

  
"usual_supplier"
:
 
null
,

  
"purchase_tax_rate"
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

  
"cost_price"
:
 
"25.0"
,

  
"sales_prices"
:
 
[

    
{

      
"id"
:
 
"92b8b6614a9211e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Sales Price"
,

      
"created_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"updated_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"price_name"
:
 
"Sales Price"
,

      
"price"
:
 
"50.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf2424844a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Sales Price"
,

        
"$path"
:
 
"/product_sales_price_types/bf2424844a9111e797950a57719b2edb"

      
}

    
}
,

    
{

      
"id"
:
 
"92ba66ea4a9211e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Trade"
,

      
"created_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"updated_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"price_name"
:
 
"Trade"
,

      
"price"
:
 
"40.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf26959b4a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Trade"
,

        
"$path"
:
 
"/product_sales_price_types/bf26959b4a9111e797950a57719b2edb"

      
}

    
}
,

    
{

      
"id"
:
 
"92bada8c4a9211e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Wholesale"
,

      
"created_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"updated_at"
:
 
"2017-06-06T08:31:44Z"
,

      
"price_name"
:
 
"Wholesale"
,

      
"price"
:
 
"30.0"
,

      
"price_includes_tax"
:
 
false
,

      
"product_sales_price_type"
:
 
{

        
"id"
:
 
"bf2718fe4a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Wholesale"
,

        
"$path"
:
 
"/product_sales_price_types/bf2718fe4a9111e797950a57719b2edb"

      
}

    
}

  
]
,

  
"source_guid"
:
 
null
,

  
"purchase_description"
:
 
null
,

  
"active"
:
 
true

}
```
By comparison to the stock item, there are less details to return.
#### Services
If the business sells the same services, it is more efficient to create service item records which can be added to invoices.
You can return services that are available using the following request:
```
txt
Copy
GET /services
```
Attributes belonging to a specific service are returned via a GET request to the services endpoint followed by the id of the service:
```
txt
Copy
GET /services/id
```
```
json
Copy
{

  
"id"
:
 
"a002176d329f11e8b45c025132dab352"
,

  
"displayed_as"
:
 
"Test"
,

  
"$path"
:
 
"/services/a002176d329f11e8b45c025132dab352"
,

  
"created_at"
:
 
"2018-03-28T15:49:40Z"
,

  
"updated_at"
:
 
"2018-03-28T15:49:40Z"
,

  
"item_code"
:
 
"Test Services"
,

  
"description"
:
 
"Test"
,

  
"notes"
:
 
""
,

  
"sales_ledger_account"
:
 
{

    
"id"
:
 
"bf15fce94a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Sales - Products (4000)"
,

    
"$path"
:
 
"/ledger_accounts/bf15fce94a9111e797950a57719b2edb"

  
}
,

  
"purchase_ledger_account"
:
 
{

    
"id"
:
 
"bf1621884a9111e797950a57719b2edb"
,

    
"displayed_as"
:
 
"Cost of sales - goods (5000)"
,

    
"$path"
:
 
"/ledger_accounts/bf1621884a9111e797950a57719b2edb"

  
}
,

  
"sales_tax_rate"
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

  
"purchase_tax_rate"
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

  
"sales_rates"
:
 
[

    
{

      
"id"
:
 
"a0028146329f11e8b45c025132dab352"
,

      
"displayed_as"
:
 
"Rate"
,

      
"created_at"
:
 
"2018-03-28T15:49:40Z"
,

      
"updated_at"
:
 
"2018-03-28T15:49:40Z"
,

      
"rate_name"
:
 
"Rate"
,

      
"rate"
:
 
"2.0"
,

      
"rate_includes_tax"
:
 
false
,

      
"service_rate_type"
:
 
{

        
"id"
:
 
"bf2781184a9111e797950a57719b2edb"
,

        
"displayed_as"
:
 
"Rate"
,

        
"$path"
:
 
"/service_rate_types/bf2781184a9111e797950a57719b2edb"

      
}

    
}

  
]
,

  
"source_guid"
:
 
null
,

  
"purchase_description"
:
 
""
,

  
"usual_supplier"
:
 
null
,

  
"active"
:
 
true

}
```
The major difference is that the sales_prices array is replaced with sales_rates . As default there is only a single sales rate in the array.
Each rate includes:
- rate_name : the name provided for that rate.
- rate : the value assigned to the rate.
- rate_includes_tax : this specifies if any VAT is included or not. If the Boolean value is set to false, any tax will be added to the rate .
- service_rate_type : different rate types can be created in the settings. This array will list the id and name of the rate type set when the service was created.
It is possible to retrieve details of the service_rate_types available using the following request:
```
txt
Copy
GET /service_rate_types
```
`
#### Stock Movement
The stock_movements endpoint provides exposure to the stock item activity. Stock movements occur as a result of both general business processing such as sales and purchase invoices and credit notes containing stock items and manual stock adjustments. Below is a list of stock movement activity and an explanation of when they occur in the business process:
####Stock Movement Types
- Goods In - Purchase Invoice & Purchase Credit note. Stock movements created via purchase credit notes are signed with a negative when viewing in the web app UI but are returned unsigned by the API.
- Goods Out - Sales Invoice & Sales Credit note. Stock movements created via sales credit notes are signed with a negative when viewing in the web app UI but are returned signed by the API.
- Adjustment In - Opening stock balance and Stock take adjustment
- Adjustment Out - Stock take adjustment, Item written off and Item damaged. Quantity needs to be signed with a negative when making an API POST/PUT request
The below JSON response displays the attributes and values returned for a specific stock movement. At present, the Stock Movement Type is not exposed and needs to be identified by quantity. Negatively signed quantities are indicative of a Goods Out movement type as shown in the below response of a sales invoice stock movement. Note, the Sales invoice number is set as the stock movement reference value providing greater traceability.
```
txt
Copy
GET /stock_movements/{id}
```
`
```
json
Copy
{

  
"id"
:
 
"73138075b945401d8640d261e8d5d0b1"
,

  
"displayed_as"
:
 
"Test (Ref: SI-12)"
,

  
"$path"
:
 
"/stock_movements/73138075b945401d8640d261e8d5d0b1"
,

  
"links"
:
 
[

    
{

      
"href"
:
 
null
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

  
"created_at"
:
 
"2019-03-07T13:20:54Z"
,

  
"updated_at"
:
 
"2019-03-07T13:20:54Z"
,

  
"movement_number"
:
 
5
,

  
"date"
:
 
"2019-03-07T13:20:54.000Z"
,

  
"cost_price"
:
 
"2.0"
,

  
"quantity"
:
 
"-8.0"
,

  
"details"
:
 
"Test"
,

  
"reference"
:
 
"SI-12"
,

  
"stock_item"
:
 
{

    
"id"
:
 
"8c9ecb543d6111e8b45c025132dab352"
,

    
"displayed_as"
:
 
"Stock test"
,

    
"$path"
:
 
"/stock_items/8c9ecb543d6111e8b45c025132dab352"
,

    
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

    
"updated_at"
:
 
"2019-03-07T13:20:54Z"
,

    
"item_code"
:
 
"Stock test"
,

    
"description"
:
 
"Stock test"
,

    
"notes"
:
 
""
,

    
"sales_ledger_account"
:
 
{

      
"id"
:
 
"bf15fce94a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Sales - Products (4000)"
,

      
"$path"
:
 
"/ledger_accounts/bf15fce94a9111e797950a57719b2edb"

    
}
,

    
"sales_tax_rate"
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

    
"purchase_ledger_account"
:
 
{

      
"id"
:
 
"bf15b03d4a9111e797950a57719b2edb"
,

      
"displayed_as"
:
 
"Stock (1000)"
,

      
"$path"
:
 
"/ledger_accounts/bf15b03d4a9111e797950a57719b2edb"

    
}
,

    
"usual_supplier"
:
 
null
,

    
"purchase_tax_rate"
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

    
"cost_price"
:
 
"2.0"
,

    
"sales_prices"
:
 
[

      
{

        
"id"
:
 
"8c9f3d4d3d6111e8b45c025132dab352"
,

        
"displayed_as"
:
 
"Sales Price"
,

        
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

        
"updated_at"
:
 
"2018-10-23T09:37:00Z"
,

        
"price_name"
:
 
"Sales Price"
,

        
"price"
:
 
"11.0"
,

        
"price_includes_tax"
:
 
false
,

        
"product_sales_price_type"
:
 
{

          
"id"
:
 
"bf2424844a9111e797950a57719b2edb"
,

          
"displayed_as"
:
 
"Sales Price"
,

          
"$path"
:
 
"/product_sales_price_types/bf2424844a9111e797950a57719b2edb"

        
}

      
}
,

      
{

        
"id"
:
 
"8ca0161c3d6111e8b45c025132dab352"
,

        
"displayed_as"
:
 
"Trade"
,

        
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

        
"updated_at"
:
 
"2018-04-11T08:23:01Z"
,

        
"price_name"
:
 
"Trade"
,

        
"price"
:
 
"3.0"
,

        
"price_includes_tax"
:
 
false
,

        
"product_sales_price_type"
:
 
{

          
"id"
:
 
"bf26959b4a9111e797950a57719b2edb"
,

          
"displayed_as"
:
 
"Trade"
,

          
"$path"
:
 
"/product_sales_price_types/bf26959b4a9111e797950a57719b2edb"

        
}

      
}
,

      
{

        
"id"
:
 
"8ca0de5d3d6111e8b45c025132dab352"
,

        
"displayed_as"
:
 
"Wholesale"
,

        
"created_at"
:
 
"2018-04-11T08:23:01Z"
,

        
"updated_at"
:
 
"2018-04-11T08:23:01Z"
,

        
"price_name"
:
 
"Wholesale"
,

        
"price"
:
 
"2.0"
,

        
"price_includes_tax"
:
 
false
,

        
"product_sales_price_type"
:
 
{

          
"id"
:
 
"bf2718fe4a9111e797950a57719b2edb"
,

          
"displayed_as"
:
 
"Wholesale"
,

          
"$path"
:
 
"/product_sales_price_types/bf2718fe4a9111e797950a57719b2edb"

        
}

      
}

    
]
,

    
"source_guid"
:
 
null
,

    
"purchase_description"
:
 
""
,

    
"reorder_level"
:
 
"0.0"
,

    
"reorder_quantity"
:
 
"0.0"
,

    
"location"
:
 
""
,

    
"barcode"
:
 
""
,

    
"supplier_part_number"
:
 
""
,

    
"weight"
:
 
0
,

    
"measurement_unit"
:
 
"kg"
,

    
"weight_converted"
:
 
"0.0"
,

    
"active"
:
 
true
,

    
"quantity_in_stock"
:
 
"1.0"
,

    
"last_cost_price"
:
 
"2.0"
,

    
"last_cost_price_stock_value"
:
 
"2.0"
,

    
"average_cost_price"
:
 
"2.0"
,

    
"average_cost_price_stock_value"
:
 
"2.0"
,

    
"cost_price_last_updated"
:
 
"2018-04-11T08:23:52.000Z"

  
}

}
```
#### Considerations
At present, Sage Business Cloud Accounting does not support negative stock and as such the API will prevent the POSTing of sales invoices if the quantities on the invoice reduce the available quantity to less than zero. Estimates and quotations do not rely on their being sufficient stock quantity at the point of creation, but they would be prevented from converting to a sales invoice if there is insufficient quantity available for any one of the item lines. The error response You cannot fulfil this invoice as you do not have enough stock. will be returned in the API response. The response falls short of determining which stock items have caused the failure meaning a GET request to each of the invoice stock items would be required to find the item(s) with insufficient quantity.
A further consideration relates to sales_prices . When a contact (Customer) is created a price default is set to one of the predetermined sales prices. If an application is accessing these details, it is important that all price options are considered and the choice to select a different sales_price_type is made available, if required.