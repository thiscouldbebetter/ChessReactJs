Chess ReactJS
=============

A simple chess set for two human players implemented in ReactJS as a learning exercise.

<img src="Screnshot.png"/>

The pieces can be moved around the board by clicking a square containing a piece
and then clicking on any other square.

As of this writing, the system enforces no rules on whose turn it is to move,
nor places any restrictions on the squares to which a selected piece can move.
Any piece can move to any other square on the board, and,
if there is another piece already occupying the destination square,
the target piece will be removed from the board, even if it belongs to the same player.


Origin
------

The application was intially created using the "create-react-app" command,
by running the following commands within the "Source" directory
of this repository (assuming that npm was installed beforehand):

	npm install -g create-react-app
	create-react-app react-app

Then the automatically generated .git directory was deleted to make it possible
to create a different Git repository in a containing directory.


Running
-------

The repository does not include all the many NPM packages it needs to run,
because including them makes the repository quite unwieldy, adding over 70 mebibytes.
The missing packages can be added by running the command "npm update" from within the react-app directory.
Then the program can be run by running the command "npm start" from within the react-app directory,
and, if it is not done automatically, by navigating to http://localhost:3000 in a web browser.


