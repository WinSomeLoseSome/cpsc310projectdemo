\usepackage{graphicx}
# CPSC 310 Project Repository

A project completed in 2016 for UBC's CPSC 310 Software Engineering class. This was the end product of the class and is a website with the ability to search for classes and rooms at UBC and schedule specific classes to rooms.

## Configuring your environment

To start using this project you need to get your computer configured so you can build and execute the code. This process should be largely similar to the ```cpsc310starter``` repo used during the first lab. To do this, follow these steps; the specifics of each step (especially the first two) will vary based on which operating system your computer has:

1. Install git (you should be able to execute ```git -v``` on the command line).

1. Install Node, which will also install NPM (you should be able to execute ```node -v``` and ```npm -v``` the command line).

## Project commands

Once your project is configured you need to further prepare the project's tooling and dependencies. In the ```cpsc310project``` folder:

1. ```npm run clean```

1. ```npm run configure```

1. ```npm run build```

If you use Windows; instead try:

1. ```npm run cleanwin```

1. ```npm run configurewin```

1. ```npm run build```


### Starting the server

* ```npm run start```

You can then open the sample UI in your web browser by visiting [http://localhost:4321](http://localhost:4321). Alternatively, you can invoke the server using curl or some other tool that can hit your REST endpoints once the server is started.

\begin{figure}
  \caption{The Upload Page.}
  \centering
    \includegraphics[width=0.5\textwidth]{img/Screen Shot 2017-05-18 at 9.27.15 PM}
\end{figure}
