# Democratic Chess

# What is it?

It's a game of multiplayer chess, where each team is composed of multiple players that vote on the next move to make. There will be time for each team to vote and then the move which has the most votes will be played. A chatbox will be available on the side of the chessboard to discuss the options within a team.

When a new player comes to the site, he will automatically join the current game in one of the two teams.

# How is it build?

We're running the game engine server-side, written in JavaScript, and all communications are made using websockets in a format that is still being defined at the moment, available [here](https://github.com/ProtectedVariable/DemocraticChess/blob/master/communicationProtocol.md). For the server part, we're using Node JS to run our server.

The client will draw the game UI using Canvas and will have access to the game engine to check valid moves before sending them to the server.

# Who will work on what?
 - Maxime Lovino will work on the client-server communication, parsing of the messages and interaction with the game engine and client.
 - Vincent Tournier will write the game engine.
 - Thomas Ibanez will take care of the frontend.
 
 # Dependencies
 All dependencies for the server part are saved in the `package.json` file of the server app. This has been tested with Node v8.2.1.
 
 The modules are:
 - [ip NPM module](https://www.npmjs.com/package/ip), to display the IP of the server when launching it
 - [log NPM module](https://www.npmjs.com/package/log), a package to more clearly log our program
 - [nodemon NPM module](https://www.npmjs.com/package/nodemon), used to refresh the server when updating the code
 - [uuid NPM module](https://www.npmjs.com/package/uuid), used to create unique client identifiers
 - [ws NPM module](https://www.npmjs.com/package/ws), the websocket server package
 
 # Deployment instructions
 You can deploy the websocket server for the game by using the following commands when in the server folder:
 ```
 npm install
 npm start
 ```
 This will run the websocket server and will listen for websocket connections on port 8080.
 
 To use the client with the server, you need to change the IP of the server in the file `client/scripts/socketClient.js` to match the IP of the server and then you can launch the `client/index.html` file or run an apache/nginx server to distribute the client website.
