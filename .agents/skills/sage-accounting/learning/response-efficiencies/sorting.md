Aiding the efficiency of API requests, sort offers a robust method of obtaining the data you require. Sorting functionality is limited to the API's commonly requested endpoints and is determined through the use of the sort query string parameter. The value of the parameter should be set to one of the supported attribute keys listed in the below table. An optional sort direction can be appended to each supported sort key and is separated by a colon : character.
```
txt
Copy
GET /sales_invoices?sort=date:desc
```
The supported sort directions are either asc for ascending or desc for descending.
If a sort direction is not specified, the response will be sorted in ascending order.
### Supported Endpoints and Keys
|||
| Endpoint | Parameters |
| --- | --- |
| /sales_invoices | created_at updated_at date due_date |
| /sales_credit_notes | created_at updated_at date |
| /sales_quick_entries | created_at updated_at date |
| /sales_quotes | created_at updated_at date expiry_date |
| /purchase_invoices | created_at updated_at date due_date |
| /purchase_credit_notes | created_at updated_at date |
| /purchase_quick_entries | created_at updated_at date |
| /contact_payments | created_at updated_at date |
| /contact_allocations | created_at updated_at date |
| /other_payments | created_at updated_at date |
| /bank_deposits | created_at updated_at date |
| /bank_transfers | created_at updated_at date |