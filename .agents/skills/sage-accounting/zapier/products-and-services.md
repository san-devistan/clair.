#### Overview of Products, Services and Stock Items
The Sage Accounting Zapier application was created using the publicly available API's for Sage Business Cloud Accounting. The API's support the 6 different regions this version of Sage Business Cloud Accounting is available in. The regions are Canada, France, Ireland, Spain, United Kingdom and USA.
The Public API's use separate endpoints for Products, Services and Stock Items meaning there is some variation of available fields. For simplicity, separate events have been created to cater for the 3 different types. There is crossover between Products and Stock Items, for example the Find Product event will search for a match in both the products and stock items where as the Find Stock Item event will look for a match in Stock Items only.
#### Zapier Fields available for Create Product Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Description | The description of the product | * |
| Item Code | The item code for the product |  |
| Notes | Any notes relating to the product |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Product Sales Price Name | choose |  |
| [Sales prices] Price | The sales price of the product |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the product |  |
| Description on purchase forms | Purchase Description |  |
| Active | choose |  |
#### Zapier Fields available for Update Product Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Product Key | The id used in the Sage Business Cloud Database Search Options | * |
| Description | The description of the product |  |
| Item Code | The item code for the product |  |
| Notes | Any notes relating to the product |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Product Sales Price Name | choose |  |
| [Sales prices] Price |  |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the product |  |
| Description on purchase forms | Purchase Description |  |
| Active | choose |  |
#### Zapier Fields available for Create Service Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Description | The description of the service |  |
| Item Code | The item code for the service |  |
| Notes | Any notes relating to the service |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Service Sales Price Name | choose |  |
| [Sales prices] Price |  |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the service |  |
| Description on purchase forms | Purchase Description |  |
| Active | choose |  |
#### Zapier Fields available for Update Service Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Service Key | The id used in the Sage Business Cloud Database [Search Options]./search-options/) | * |
| Description | The description of the Service |  |
| Item Code | The item code for the Service |  |
| Notes | Any notes relating to the Service |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Service Sales Price Name | choose |  |
| [Sales prices] Price |  |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the Service |  |
| Description on purchase forms | Purchase Description |  |
| Active | choose |  |
#### Zapier Fields available for Create Stock Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Description | The description of the Stock Item | * |
| Item Code | The item code for the Stock Item |  |
| Notes | Any notes relating to the Stock Item |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Stock Item Sales Price Name | choose |  |
| [Sales prices] Price | The sales price of the Stock Item |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the Stock Item |  |
| Description on purchase forms | Purchase Description |  |
| Supplier Item Code | The Supplier/Vendor Item Code |  |
| Reorder Level | The stock level at which the item is re-ordered |  |
| Reorder Quantity | The number to re-order |  |
| Location | The location of where the item is located |  |
| Barcode | The barcode of the item |  |
| Weight | the weight of the item |  |
| Measurement Unit | The unit of measurement the item is held in |  |
| Active | choose |  |
#### Zapier Fields available for Update Stock Item
| Required Fields | Field Description | Is Required |
| --- | --- | --- |
| Stock Item Key | The id used in the Sage Business Cloud Database Search Options | * |
| Description | The description of the Stock Item | * |
| Item Code | The item code for the Stock Item |  |
| Notes | Any notes relating to the Stock Item |  |
| Sales Ledger Account | choose | * |
| Sales Tax Rate | choose |  |
| [Sales prices] Stock Item Sales Price Name | choose |  |
| [Sales prices] Price | The sales price of the Stock Item |  |
| Purchase Ledger Account | choose | * |
| Usual Supplier | choose |  |
| Purchase Tax Rate | choose |  |
| Cost Price | The cost price of the Stock Item |  |
| Description on purchase forms | Purchase Description |  |
| Supplier Item Code | The Supplier/Vendor Item Code |  |
| Reorder Level | The stock level at which the item is re-ordered |  |
| Reorder Quantity | The number to re-order |  |
| Location | The location of where the item is located |  |
| Barcode | The barcode of the item |  |
| Weight | the weight of the item |  |
| Measurement Unit | The unit of measurement the item is held in |  |
| Active | choose |  |