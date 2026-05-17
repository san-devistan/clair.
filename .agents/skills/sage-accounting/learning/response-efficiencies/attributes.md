### Attributes
You can control the size of your response with the attributes parameter. To get a richer result even on requests for a list of resources, specify which fields should be included in the response:
```
txt
Copy
GET /sales_invoices?attributes=date,due_date
```
```
json
Copy
{

  
"$total"
:
 
2
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
 
"44a60404cfec4b189f1052be8141d2c8"
,

      
"displayed_as"
:
 
"SI-1"
,

      
"$path"
:
 
"/sales_invoices/44a60404cfec4b189f1052be8141d2c8"
,

      
"date"
:
 
"2019-03-18"
,

      
"due_date"
:
 
"2019-04-01"

    
}
,

    
{

      
"id"
:
 
"01d7ed7b9cf144d0870219e81eee9729"
,

      
"displayed_as"
:
 
"SI-2"
,

      
"$path"
:
 
"/sales_invoices/01d7ed7b9cf144d0870219e81eee9729"
,

      
"date"
:
 
"2019-03-16"
,

      
"due_date"
:
 
"2019-04-01"

    
}

  
]

}
```
To get the full set of attributes, specify attributes=all .
The attributes parameter also works when you fetch a singular resource and allows you to speed up the request.
```
txt
Copy
GET /sales_invoices?attributes=date,total_amount
```
```
json
Copy
{

  
"id"
:
 
"44a60404cfec4b189f1052be8141d2c8"
,

  
"displayed_as"
:
 
"SI-1"
,

  
"$path"
:
 
"/sales_invoices/44a60404cfec4b189f1052be8141d2c8"
,

  
"date"
:
 
"2019-03-18"
,

  
"total_amount"
:
 
"110.0"

}
```
attributes=all is the default when requesting singular resources.
Note: id , displayed_as and $path are always returned and cannot be controlled by the client.
### Nested Attributes
When requesting a single resource, the parameter nested_attributes=all expands the sub-resources:
```
txt
Copy
GET /sales_invoices?nested_attributes=all
```
```
json
Copy
{

  
"id"
:
 
"44a60404cfec4b189f1052be8141d2c8"
,

  
"displayed_as"
:
 
"SI-1"
,

  
"$path"
:
 
"/sales_invoices/44a60404cfec4b189f1052be8141d2c8"
,

  
// ...

  
"transaction"
:
 
{

    
"id"
:
 
"87c9d4b2d7de455197e963320c3a4aa0"
,

    
"displayed_as"
:
 
null
,

    
"$path"
:
 
"/transactions/87c9d4b2d7de455197e963320c3a4aa0"
,

    
"created_at"
:
 
"2019-03-25T15:31:02Z"
,

    
"updated_at"
:
 
"2019-03-25T15:31:02Z"
,

    
"date"
:
 
"2019-03-18"
,

    
"deleted"
:
 
false
,

    
"reference"
:
 
null
,

    
"total"
:
 
"110.0"
,

    
// ...

  
}
,

  
// ...

  
"contact"
:
 
{

    
"id"
:
 
"223f429df1bf4fd88712201345958c6a"
,

    
"displayed_as"
:
 
"Jane Doe (CustRef #0023)"
,

    
"$path"
:
 
"/contacts/223f429df1bf4fd88712201345958c6a"
,

    
"created_at"
:
 
"2019-03-25T15:30:23Z"
,

    
"updated_at"
:
 
"2019-03-25T15:30:23Z"
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
 
"Jane Doe"
,

    
"reference"
:
 
"CustRef #0023"
,

    
// ...

  
}
,

  
// ...

}
```
To avoid circular references, this parameter only works on the first level of nesting.
### Legacy ID
When you are migrating your application from earlier API versions 1 or 2, you will notice the ids have changed. To allow unambiguous matching between those versions, specifying show_legacy_id=true will show this id in the response.
```
txt
Copy
GET /sales_invoices/{id}?show_legacy_id=true
```
```
json
Copy
{

  
"legacy_id"
:
 
2841904
,

  
"id"
:
 
"44a60404cfec4b189f1052be8141d2c8"
,

  
"displayed_as"
:
 
"SI-1"
,

  
"$path"
:
 
"/sales_invoices/44a60404cfec4b189f1052be8141d2c8"
,

  
// ...

}
```
This parameter works on index requests as well as requesting single entities.