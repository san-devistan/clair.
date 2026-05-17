### Overview
The term banking may conjure up thoughts of Gordon Gekko, annuities and hedge funds but in Sage Business Cloud Accounting the meaning is far more grounded. Banking refers to the day to day processes and transactional activity seen through the businesses bank accounts. As default, there are two system generated bank accounts created, one of type CHECKING and the other of type CASH_IN_HAND . It is possible to create additional bank accounts, edit existing, and, if there is no associated activity, delete accounts.
### Bank Account Types
The Bank Account Type plays an important role in defining which bank transactions are supported by the account. For example, it is not possible to POST a bank deposit to an account type other than CASH_IN_HAND . The following list provides an overview of those bank Account types. Anyone familiar with the content returned in the 'bank_account_types' response may notice that one of the listed bank account types ( STRIPE ), is not returned in the 'bank_account_types' response.
##### CHECKING
The checking account, also known as the current account is the account generally used for day to day business transactions used for banking income and paying bills. A checking account can be either an asset (positive balance) or a liability (overdrawn) which are sometimes referred to as a floating category.
##### SAVINGS
Savings accounts may be a bank or business society account that is likely to accrue interest on the balance. It would be unlikely for a savings account to offer an overdraft facility which allowed negative balances and will generally appear as a balance sheet asset.
##### CREDIT_CARD
Credit cards allow the holder to purchase goods or services on credit and will generally appear as a balance sheet liability, the only time they would not show as a liability is if the card holder is in credit with the provider.
##### CASH_IN_HAND
Allows the payment of goods or services in cash. Commonly used within a businesses as petty cash for the purposes of low value purchases and appears as an asset on the balance sheet.
##### LOAN
Loan account represents monies borrowed to finance the business and will appear as a liability on the balance sheet.
##### OTHER
If an account cannot be categorized by the available types, the OTHER category is used to define those miscellaneous types.
##### STRIPE
Stripe bank accounts are system generated if a business makes the decision to accept credit and debit card payments via the stripe service. The account is read only with only stripe transactions appearing in the activity. The account should have a positive balance and will appear as a balance sheet asset. Additional information relating to the stripe service can be found here .
### Transaction Types
The following list contains a subset of transaction types relative to bank account activity:
##### BANK_OPENING_BALANCE
Alternative endpoint: /bank_opening_balances The Bank opening balance is a transaction type generally recorded at the point of opening the bank account or when the business begins trading. It is uncommon for there to be more than one opening balance for each bank account. GET /bank_opening_balances
##### BANK_PAYMENT
Created during the bank reconciliation process when recording interest paid and other bank charges. Would need to be returned via a filtered collection of transactions. GET /transactions?transaction_type_id=BANK_PAYMENT
##### BANK_RECEIPT
Created during the bank reconciliation process when recording interest earned and other income. Would need to be returned via a filtered collection of transactions. GET /transactions?transaction_type_id=BANK_RECEIPT
##### BANK_TRANSFER
Alternative endpoint: /bank_transfers Records the transfer of monies between bank accounts. The response from the bank_transfers endpoint provides richer data relating to the transaction including the Bank Accounts the money came from and went to. GET /bank_transfers
##### CUSTOMER_RECEIPT
Alternative endpoint: /contact_payments Customer receipts are payments received from a customer in payment of an invoice. It is possible (excluding Sage Accounting Start) to create a customer receipt which sits as an unallocated credit value on the customer's account until it is allocated against an invoice or refunded to the customer at a later date. GET /contact_payments
##### CUSTOMER_REFUND
Alternative endpoint: /contact_payments Customer refunds are created when a sales credit is refunded. It is not possible to create a customer refund without allocating it to a sales credit note. GET /contact_payments
##### DEPOSIT
Alternative endpoint: /bank_deposits Created when cash or checks are paid from a cash holding account. GET /bank_deposits
##### OTHER_RECEIPT
Alternative endpoint: /other_payments Created when making a receipt for a business income and may have an associated contact. Sage Business Cloud Accounting Start displays the transaction in the web app as Money In and is returned by the API as OTHER_RECEIPT . GET /other_payments
##### OTHER_RECEIPT_REFUND
Alternative endpoint: /other_payments Created when refunding a sales receipt, which may have an associated contact. Not available in Sage Business Cloud Accounting Start. GET /other_payments
##### OTHER_PAYMENT
Alternative endpoint: /other_payments Created when making a payment for a business expense and may have an associated contact. Sage Business Cloud Accounting Start displays the transaction in the web app as Money Out and is returned via the API as OTHER_PAYMENT . GET /other_payments
##### OTHER_PAYMENT_REFUND
Alternative endpoint: /other_payments Generated when refunding a sales receipt which may have an associated contact. Transaction not available in Sage Business Cloud Accounting Start. GET /other_payments
##### PENSION_PROVIDER_PAYMENT
Payment made to pension provider created through Sage Business Cloud payroll integration. There is no alternative endpoint and this transaction would need to be filtered from transactions. GET /transactions?transaction_type_id=PENSION_PROVIDER_PAYMENT
##### REVENUE_PAYMENT
Payment made for national insurance liability and is created through Sage Business Cloud payroll integration. There is no alternative endpoint and this transaction would need to be filtered from transactions. GET /transactions?transaction_type_id=REVENUE_PAYMENT
##### STAFF_PAYMENT
Payment made for staff wages/salary and is created through Sage Business Cloud payroll integration. There is no alternative endpoint and this transaction would need to be filtered from transactions. GET /transactions?transaction_type_id=STAFF_PAYMENT
##### TAX_SCHEME_TRANSFER_PAYMENT
GET /transactions?transaction_type_id=TAX_SCHEME_TRANSFER_PAYMENT
##### VENDOR_PAYMENT
Alternative endpoint: /contact_payments Vendor payments are payments made to a supplier in payment of an invoice. It is possible (excluding Sage Accounting Start) to create a vendor payment which sits as an unallocated debit value on the suppliers account until it is allocated against an invoice or refunded from the supplier at a later date. GET /contact_payments
##### VENDOR_REFUND
Alternative endpoint: /contact_payments Vendor refunds are created when a purchase credit is refunded. It is not possible to create a vendor refund without allocating it to a purchase credit note. GET /contact_payments
##### VOID_PAYMENT
Void payments are created when a cheque transaction is deleted and has had a hard copy of the cheque printed. There is no alternative endpoint and this transaction would need to be filtered from transactions. GET /transactions?transaction_type_id=VOID_PAYMENT
##### TAX_PAYMENT
The tax payment is created when Paying a tax or vat return via the web app UI. There is no alternative endpoint and this transaction would need to be filtered from transactions. GET /transactions?transaction_type_id=TAX_PAYMENT
### Foreign Currency Transactions
Sage Business Cloud Accounting (excluding Start) provides the functionality to trade with customers and vendors using different currencies to that of the operating business. Non base customers and vendors are defined by setting the 'currency' on the individual contact record.
Unlike contacts, the currency of a bank account cannot be changed. If a business has separate bank accounts for any of the currencies it deals in, it is possible to create a bank account specifically for the processing of payments and receipts in that currency, but all exchange rate variances would need to be accounted for manually. Further information is available from the foreign currency transactions help document.