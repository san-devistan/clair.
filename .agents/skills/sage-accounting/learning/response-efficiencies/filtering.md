Filters can be used on many index endpoints to narrow the response to only those entities you are concerned about. While some filters are applicable on a wide range of endpoints, many apply only to specific resources. Please refer to the API Reference for details on each endpoint.
### General Filters
#### Changed Entities
To get all resources that have changed since a certain point in time, you can use the updated_or_created_since filter.
```
txt
Copy
GET /sales_invoices?updated_or_created_since=2019-03-19
GET /sales_invoices?updated_or_created_since=2019-03-21T09:23:00Z
```
This can help you if your applications wants to keep the data in sync with the Accounting servers.
#### Deleted Entities
Often it's not enough to just fetch updates on modified resources, but you also need to know which resources are no longer usable in your application.
```
txt
Copy
GET /sales_invoices?deleted_since=2019-03-19
GET /sales_invoices?deleted_since=2019-03-21T09:23:00Z
```
#### Date Range Filtering
All accounting operations have a specific date assigned to it. To limit your results only to those resources which fall into a certain time range, you can use one or both of from_date and to_date .
```
txt
Copy
GET /sales_invoices?from_date=2019-03-25
GET /sales_invoices?from_date=2019-02-01&to_date=2019-02-28
```
### Endpoint Specific Filters
Many index endpoints offer filters, which are only usable in the context of the specific endpoint. An example is the visible_in filter for ledger accounts, which lets you narrow the result to only those ledger accounts, which are valid in a certain situation. Please refer to the query parameters section of each index endpoint of the API Reference to see the full list of available filters.