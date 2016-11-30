# D3 Final test pass rate: 100%


##1 Commit on Oct 29, 2016. Link: https://github.com/CS310-2016Fall/cpsc310project_team82/commit/6bd9a33bc8aef2c9a61d7ba365d14739fa787c09

For the first commit, I implemented DatasetController.ts and so that it can handle data structures from the HTML files(with parse5). Then, I finished add new valid keys(all done except lat/lon). 
Two functions I wrote:
1. findDoc(): use recursion to search through all the child nodes until it finds the matching one and return it.
2. compareDoc(): helper function for findDoc(), check to see if the current element matches the criteria. 
With these two functions, I can now get all the information I need from the HTML files and store them in "room" JSON file on the both memory and disk.
------------------------------------------------

##2 Commit on Nov 6, 2016. Link: 

For the second commit, I finsihed the implementation for getting the location of the buildings(lat/lon). By using the suggested interface GeoRespond, I wrote a function, getLatLon(), which returns a promise and make sure Lat/lon is obtained before others in "More Info" web page. 
I also implement a new case for sorting in QueryController.ts.
After the second commit, my code now can pass 22/25(~88%) of the private test.
------------------------------------------------

##3 Commit on Nov 6, 2016. Link:

For the thrid commit, I fixed the code and it can pass the last 3 private tests.
Fixing the two 424 problem: changed getDataset(). (don't do readFile on disk anymore).
Fixing bug Revolution: Should not be possible to query multiple datasets at the same time by adding the check in isValid() function and make sure the query statement in GET only has one id.