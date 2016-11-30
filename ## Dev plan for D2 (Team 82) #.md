## Dev plan for Team 82 #

Yang(Carey) Liu: 

Tasks I completed:

1. I finished implementing the three new functions required in the interface of IInsightFacade. Basically, for the new three functions in InsightFacade.ts: addDataset(), removeDataset(), PerformDataset(), I implemented by move most of the code I wrote for D1 in the RouteHandler.ts and adding a lot of imports to connect InsighFacade.ts with other files. 

2. I also worked on query and implemented APPLY, GROUP, and ORDER. 
For APPLY and GROUP, I added them after the GET and has to three for loop to get the actual keys inside the query.(It's slow, but I think it is the best way.) 
I also added two helper function to make GROUP better and now it can take in multiple key to compare and sort. I wrote all the helper function inside the main body at this moment, will move them out later and make them into functions that can be tested. 
Last, make ORDER can sort result in increasing or decreasing order(added the direction by setting a varaable called upOrDown = -1, if sort "UP" so make it equal to 1, else make it -1). 

3. Will work on writing some tests to cover as much code as I could

Benton Robertson

1. I finished validating queries making sure that they have all required fields. Some of this as left over from d1 but now that we can see the tests we can make the changes.
2. Working on the writing tests for queries to increase test coverage
3. Debugging APPLY and GROUP as Carey wrote them before I had the chance to (next deliverable I hope to beat him in writing the functions)