#### What Is Reverse Charge VAT?
Under normal VAT rules, the supplier charges VAT on an invoice and pays that VAT to HMRC. Under Reverse Charge VAT, this responsibility shifts from the supplier to the customer.
When reverse charge applies:
- The supplier does not charge VAT on the sales invoice
- The invoice must still state the VAT rate and amount, and clearly note that reverse charge applies
- The customer self-accounts for VAT by declaring both: Output VAT (as if they had made the sale)
- Input VAT (as if they had been charged VAT)
The net VAT effect is usually nil, but the transaction must still be reported correctly.
#### When Reverse Charge VAT Applies
Reverse charge VAT is used in several UK scenarios, the most common being:
### Construction Industry Scheme (CIS)
Reverse charge applies where:
- Both supplier and customer are VAT registered
- The supply falls within CIS-defined construction services
- The customer is not an end user or intermediary
- The customer will make an onward supply of construction services
- If any line on an invoice is subject to CIS reverse charge, the entire invoice (including materials) must follow reverse charge rules.
### Domestic Reverse Charge (Non‑CIS)
Applies to specific goods and services such as:
- Mobile phones
- Computer chips
### Other Reverse Charge Scenarios (Contextual)
- Overseas services purchased by UK businesses
- Postponed VAT accounting on imports
- This document focuses primarily on CIS and domestic UK reverse charge.
#### How Reverse Charge VAT Is Posted (Accounting Treatment)
### Sales Invoices (Supplier Perspective)
When raising a sales invoice subject to reverse charge:
- VAT is calculated but not charged to the customer
Sage Business Cloud Accounting posts:
- Net value only to revenue
- No output VAT liability
In Sage Business Cloud Accounting:
- The customer record must include a VAT registration number
- The “Use VAT reverse charge” flag is enabled on the invoice
VAT is shown for information, but reversed out automatically.
Ledger Effect (Sales):
- Revenue: Posted as normal
- VAT control accounts: No posting
### Purchase Invoices (Customer Perspective)
When processing a purchase invoice with reverse charge:
- The supplier does not charge VAT
- The customer self-accounts for VAT
In Sage Accounting, the system automatically:
- Posts output VAT (as if VAT had been charged)
- Posts an equal input VAT amount
Ledger Effect (Purchases):
- expense or cost: Net amount
- Output VAT: Posted
- Input VAT: Posted
- Net VAT payable: £0.00 (assuming full recovery)
#### Impact on the VAT Return
Important rule: Reverse charge transactions are always reported on an invoice basis, even if the business uses the VAT Cash Accounting Scheme.
### Sales with Reverse Charge VAT
For suppliers issuing reverse charge sales invoices:
VAT Return Box Treatment
- Box 1 (Output VAT) No entry
- Box 4 (Input VAT) No entry
- Box 6 (Sales net value) Includes net sale
- Box 7 No impact
Effectively, reverse charge sales only affect Box 6.
### Purchases with Reverse Charge VAT
For customers receiving reverse charge supplies:
VAT Return Box Treatment
- Box 1 (Output VAT) Self‑accounted VAT
- Box 4 (Input VAT) Reclaimed VAT
- Box 7 (Purchases net) Net purchase value
This ensures VAT is visible to HMRC while remaining VAT‑neutral.
### CIS and Domestic Reverse Charge (UK–UK)
For both CIS and domestic reverse charge within Great Britain or Northern Ireland:
- VAT is reported in Boxes 1, 4, and 7 for purchases
- Sales appear in Box 6 only
### Flat Rate VAT Scheme
Reverse charge sales:
- Included in Box 6
- Excluded from flat rate VAT calculations
Reverse charge purchases:
- Treated as standard VAT (Boxes 1 and 4)
- Outside the flat rate simplification
### Cash Accounting Scheme
Reverse charge transactions:
- Do not follow cash accounting rules
- Always appear on the VAT Return when the invoice is raised, not when payment is made
#### Credit Notes and Allocations
When issuing a credit note related to a reverse charge invoice:
- The credit note must also use reverse charge VAT
- Mixing reverse charge and non‑reverse charge documents will cause: Allocation issues
- VAT Return inaccuracies
- Correct matching ensures accurate VAT reporting and system validation.
#### Key Compliance Points
- Always confirm whether the customer is an end user or intermediary
- Ensure VAT registration numbers are recorded for CIS customers
- Apply reverse charge consistently across invoices and credit notes
Remember: If reverse charge applies to part of an invoice, it applies to the whole invoice
#### Summary
Reverse Charge VAT fundamentally changes who accounts for VAT, not whether VAT exists. While cash flow impacts are removed for suppliers, reporting complexity increases. Correct setup and posting ensure:
- No VAT is paid incorrectly
- VAT Returns remain compliant
- Audit trails clearly show self‑accounted VAT movements
Understanding both the posting logic and the VAT Return impact is essential to staying compliant under CIS and domestic reverse charge rules.