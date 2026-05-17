Payments and Receipts refer to the income and expenditure of a business. Receipts account for the money flowing in to the business from sales and other income streams and Payments account for the money flowing out of the business for payment of supplier invoices and other expenses.
The Sage Business Cloud Accounting API provides two endpoints exposing CRUD functionality to account for the different income and expenditure transaction types :
- contact_payments handles all income and expenditure types which require a contact as a parameter.
- other_payments handles all adhoc income and expenditure (transactions not requiring an invoice) such as one off purchases for travel and entertainment.
In addition to receipts and payments money can flow both in and out of a business via customer or supplier refunds. Refund transactions are handled by the contact_payments endpoint by setting the transaction_type_id as CUSTOMER_REFUND or VENDOR_REFUND .
A third endpoint, transactions exposes all audit trail activity including payments and receipts and can be used to filter and return associated payment and receipt transactions.
### Examples
The below examples detail how the contact_payments and other_payments endpoints are used to POST payments and return filtered lists of differing transaction types:
1. Contact payments a payment, receipt or refund associated with a specific contact which may be allocated to any number of invoices or credit notes, and may be unallocated (payment on account).
### Return a filtered list of contact payments
```
txt
Copy
GET /contact_payments?transaction_type_id=CUSTOMER_RECEIPT
GET /contact_payments?transaction_type_id=CUSTOMER_REFUND
GET /contact_payments?transaction_type_id=VENDOR_PAYMENT
GET /contact_payments?transaction_type_id=VENDOR_REFUND
```
2. Other payment a payment or receipt that is directly recorded against an income/expense ledger account and allows an optional contact and attachment to be added.
```
txt
Copy
GET /other_payments?attributes?transaction_type_id=OTHER_PAYMENT
GET /other_payments?attributes?transaction_type_id=OTHER_RECEIPT
```
### Return the payment allocations of an individual artefact
The parameter show_payments_allocations=true allows the payment allocation details of an artefact to be returned in the response.
```
txt
Copy
GET /sales_invoices/{id}?show_payments_allocations=true
GET /sales_credit_notes/{id}?show_payments_allocations=true
GET /sales_quick_entries/{id}?show_payments_allocations=true
GET /purchase_invoices/{id}?show_payments_allocations=true
GET /purchase_credit_notes/{id}?show_payments_allocations=true
GET /purchase_quick_entries/{id}?show_payments_allocations=true
```
### Creating a Payment for a Sales Invoice
#### Required Parameters:
- amount The allocated artefact amount dictates how much of the payment is allocated to this specific artefact.
- artefact_id ID of the sales invoice or sales invoices (multiple allocations) you wish to record the payment against.
- bank_account_id The ID of the bank or cash account where the money is going to.
- contact_id ID of the customer contact.
- date The date the payment was received.
- total_amount The total value of the payment being made. This cannot be less than the allocated artefact amount. If the greater than the allocated amount the unallocated value will be saved as a payment on account (excluding Start).
- transaction_type_id The transaction type allows the type to be defined CUSTOMER_RECEIPT , SUPPLIER_PAYMENT etc. See Banking
#### Optional Parameters
- base_currency_currency_charge Post charges for foreign currency transactions.
- discount It is possible to apply a discount amount during payment.
- exchange_rate The exchange rate applicable in a non base currency payment. Will default to 1 if no value is set.
- payment_method_id If a payment_method is not specified a default method will be passed.
- reference The reference added to the payment. Max char length of 25.
#### Example: the full amount goes onto one invoice
```
txt
Copy
POST /contact_payments
Content-Type: application/json

{
  "contact_payment": {
    "transaction_type_id": "CUSTOMER_RECEIPT",
    "payment_method_id": "CREDIT_DEBIT",
    "contact_id": "7dfc261d51eb9c107bff7273862f6e80",
    "bank_account_id": "27cf77a0e56b4c420345893cfc404c94",
    "date": "2018-04-06",
    "total_amount": "55.55",
    "allocated_artefacts": [
      {
        "artefact_id": "ba0473ae7201b61bc1d820059ff69551",
        "amount": "55.55"
      }
    ]
  }
}
```
#### Example: the payment is not fully allocated
```
txt
Copy
POST /contact_payments
Content-Type: application/json

{
  "contact_payment": {
    "transaction_type_id": "CUSTOMER_RECEIPT",
    "payment_method_id": "CREDIT_DEBIT",
    "contact_id": "7dfc261d51eb9c107bff7273862f6e80",
    "bank_account_id": "27cf77a0e56b4c420345893cfc404c94",
    "date": "2018-04-06",
    "total_amount": "99.99",
    "allocated_artefacts": [
      {
        "artefact_id": "ba0473ae7201b61bc1d820059ff69551",
        "amount": "77.77"
      }
    ]
  }
}
```
#### Example: the payment is not allocated at all
```
txt
Copy
POST /contact_payments
Content-Type: application/json

{
  "contact_payment": {
    "transaction_type_id": "CUSTOMER_RECEIPT",
    "payment_method_id": "CREDIT_DEBIT",
    "contact_id": "7dfc261d51eb9c107bff7273862f6e80",
    "bank_account_id": "27cf77a0e56b4c420345893cfc404c94",
    "date": "2018-04-06",
    "total_amount": "33.33"
  }
}
```
## Users of Sage Accounting Start
When integrating with a Sage Accounting Start business it is important to understand the subtle functionality differences. Unlike Accounting, Start does not support the creation of fully or partially unallocated payments. There are also transaction types which are unsupported in Start such as customer and vendor refunds. A complete list of banking transactions and their scope are available here .
#### Allocating contact artefacts
The contact_allocations endpoint provides the ability to create, read, update and delete transactional allocations. Allocations hold key relationship details of the debit and credit transactions used to pay or partially pay an artefact. Further information relative to artefacts and their statuses can be found here .
A contact_allocations POST request is used to allocate unallocated or partially allocated contact payments. For example, allocating an outstanding sales invoice to an unallocated customer payment.
A contact_allocations POST request will fail if it is unable to locate the artefact or either of the artefacts are fully paid. In the event of a fully paid artefact_id being passed as a parameter, a 422 error response is returned with the message "You can only pay unpaid or part-paid invoices.". It is not possible to decipher from the message which artefact_id is fully paid, as the same message is returned for both the debit and the credit(credit note, payment or receipt).
#### Required Parameters:
- artefact_id Artefact of the sales invoice (debit).
- amount The sales invoice allocation amount cannot be greater than the amount set for the payment on account.
- artefact_id The id of the payment_on_account (credit). This is not to be mistaken for the transaction id.
- amount The contact payment allocation amount needs to be signed with a minus and agree with the amount entered for the sales invoice allocation or allocations.
- contact_id The contact id of the customer contact.
- transaction_type_id This relates to the contact type being allocated and is either CUSTOMER_ALLOCATION or VENDOR_ALLOCATION .
#### Example: allocating a single sales invoice to a customer payment on account
```
txt
Copy
POST /contact_allocations
Content-Type: application/json

{
  "contact_allocation": {
    "allocated_artefacts": [
      {
        "artefact_id": "ba0473ae7201b61bc1d820059ff69551",
        "amount": 5
      },
      {
        "artefact_id": "9c1256cefba066ce0c71ab5f9f26558e",
        "amount": -5
      }
    ]
  }
}
```
#### Example: allocating multiple sales invoices to a customer payment on account
```
txt
Copy
POST /contact_allocations
Content-Type: application/json

{
  "contact_allocation": {
    "allocated_artefacts": [
      {
        "artefact_id": "ba0473ae7201b61bc1d820059ff69551",
        "amount": 33.32
      },
      {
        "artefact_id": "9c1256cefba066ce0c71ab5f9f26558e",
        "amount": 33.32
      },
      {
        "artefact_id": "2350910c91274ba1afef3c2ab9bbffb0",
        "amount": 33.32
      },
      {
        "artefact_id": "a6b9e4e712999b2fc99b6ec86e4a2a2a",
        "amount": -99.96
      }
    ]
  }
}
```
#### Example Customer and Supplier/Vendor refunds
Sage Business Cloud Accounting allows Customer and Supplier/Vendor Refunds to be created for different types of scenarios:
- A sales_credit_note with an outstanding_amount can be refunded using a contact_payment of type CUSTOMER_REFUND.
- An unallocated contact_payment(payment_on_account) of type CUSTOMER_RECEIPT can be refunded using a contact_payment of type CUSTOMER_REFUND.
- An other_payment of type OTHER_RECEIPT_REFUND can be created to record money being returned to a customer where the transaction was originally recorded as an OTHER_RECEIPT
- A purchase_credit_note with an outstanding_amount can be refunded using a contact_payment of type VENDOR_REFUND.
- An unallocated contact_payment(payment_on_account) of type VENDOR_PAYMENT can be refunded using a contact_payment of type VENDOR_REFUND.
- An other_payment of type OTHER_PAYMENT_REFUND can be created to record money being returned from a supplier/vendor where the transaction was originally recorded as an OTHER_PAYMENT
##### Refunding an outstanding or part outstanding sales_credit_note
Note the total_amount maximum value cannot be greater than the sum of the amounts in the listed allocated_artefacts array. The artefact_id is the id of the sales_credit_note with the outstanding amount.
```
txt
Copy
POST /contact_payments
Content_type: application-json

{
    "contact_payment": {
        "transaction_type_id": "CUSTOMER_REFUND",
        "payment_method_id": "CREDIT_DEBIT",
        "contact_id": "521229b29af04f3682d85b0d43ef5361",
        "bank_account_id": "19e5f9768c9542ef840ab7532e231215",
        "date": "2024-10-31",
        "total_amount": "100.00",
        "allocated_artefacts": [
            {
                "artefact_id": "c92fcddc14ea41e7b01476cd413cc8ae",
                "amount": "100.00"
            }
        ]
    }
}
```
##### Refunding an unallocated CUSTOMER_RECEIPT(payment on account)
Note It's not possible to refund a fully or partially allocated CUSTOMER_RECEIPT. The allocations will need to be cleared before the refund can be applied.
Removing CUSTOMER_RECEIPT allocations
```
txt
Copy
PUT /contact_payments/id
Content_type: application-json

{
    "contact_payment": {
        "allocated_artefacts": []
    }
}
```
Creating the CUSTOMER_REFUND and allocating to the CUSTOMER_RECEIPT
Note If the CUSTOMER_RECEIPT was unallocated prior to this you need to ensure the payment_on_account_id returned from the PUT request is used as the artefact_id in this scenario.
```
txt
Copy
POST /contact_payments
Content_type: application-json

{
    "contact_payment": {
        "transaction_type_id": "CUSTOMER_REFUND",
        "payment_method_id": "CREDIT_DEBIT",
        "contact_id": "521229b29af04f3682d85b0d43ef5361",
        "bank_account_id": "19e5f9768c9542ef840ab7532e231215",
        "date": "2024-10-31",
        "total_amount": "100.00",
        "allocated_artefacts": [
            {
                "artefact_id": "c92fcddc14ea41e7b01476cd413cc8ae",(payment_on_account_id)
                "amount": "100.00"
            }
        ]
    }
}
```
##### Refunding an OTHER_RECEIPT with an OTHER_RECEIPT_REFUND
Note This scenario may arise if the transaction was classed as a one off sale. There is no allocation for this type of transaction.
```
txt
Copy
POST /other_payments
Content_type: application-json

{
    "other_payment": {
        "transaction_type_id": "OTHER_RECEIPT_REFUND",
        "payment_method_id": "CREDIT_DEBIT",
        "contact_id": "521229b29af04f3682d85b0d43ef5361",
        "bank_account_id": "19e5f9768c9542ef840ab7532e231215",
        "date": "2024-10-31",
        "total_amount": "100.00",
        "payment_lines": [
            {
                "ledger_account_id": "7a5ecfcf884911ed84fa0252b90cda0d",
                "tax_rate_id": "GB_STANDARD",
                "net_amount": "83.33",
                "tax_amount": "16.67",
                "total_amount": "100.00"
            }
        ]
    }
}
```