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
