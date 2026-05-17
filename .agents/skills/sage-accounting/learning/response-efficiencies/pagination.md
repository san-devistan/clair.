### Overview
Pagination is used in order to provide the best performance possible when making requests that will likely return a large amount of data.
This allows a user to set parameters to state the number of items shown on each page of results in the response, but also the specific page to return.
The main parameters are:
##### items_per_page
```
txt
Copy
GET /ledger_accounts?items_per_page=4
```
##### page
```
txt
Copy
GET /ledger_accounts?page=3
```
The maximum value for items_per_page is 200. If the value for page is greater than the actual number of pages, the last page will be returned automatically.
Both parameters can be used in conjunction with each other, for example if the user wanted to return page 2 and only show 25 items on each page the following request could be used:
```
txt
Copy
GET sales_quotes?page=2&items_per_page=25
```
```
json
Copy
{

    
"$total"
:
 
97
,

    
"$page"
:
 
2
,

    
"$next"
:
 
"/sales_quotes?page=3&items_per_page=25"
,

    
"$back"
:
 
"/sales_quotes?page=1&items_per_page=25"
,

    
"$itemsPerPage"
:
 
25
,

    
"$items"
:
 
[

        
{

            
"id"
:
 
"401aa0e1424242ea98de55608dacf869"
,

            
"displayed_as"
:
 
"SQ-2"
,

            
"$path"
:
 
"/sales_quotes/401aa0e1424242ea98de55608dacf869"

        
}
,

        ...
    
]

}
```
When using pagination the response has different properties that give more information or allow for easier navigation through the data returned from the given endpoint.
- $total - This shows the total number of items available.
- $page - This shows the page of the returned data that is currently being displayed.
- $next - If the user wanted to easily navigate to the next page of results, the path for next page is provided. If the value of this is null, there are no more pages available.
- $back - If the user wanted to easily navigate to the previous page of results, the path back to the previous page is provided. If the value of this is null, the page of results shown will be the first.
- $itemsPerPage - The number of items to be displayed per page is shown. This is set by either a parameter passed in the request or the default value of 20.
- $items - The items returned are then listed, restricted by the items_per_page parameter.