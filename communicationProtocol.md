# Communication Protocol

The encapsulation of the communication has not been decided yet but will be of the form:
```
{
	id: <client-id / server>,
	message:
	{
			type : <type>,
			params : <params>
	}

}
```

## Client to Server communication

The following types of messages will be available:

|Description	|Type| Parameters |
|----------		|------|--------|
|Name announcement	| `NAME`| Name as a string|
|Vote for movement | `MOVE` | Move object `{StartCell, EndCell}`|
|Chat message | `CHAT`| Message as a string|

## Server to Client communication
|Description	|Type|Parameters|Scope|
|----------		|------|------|-------|
|Team assignment | `TEAM`| id of the team | Single user|
|Board state | `BOARD` | The board as an array| Single user|
|Player list | `LIST` | The players list | Single user|
|ID transmission | `ID` | ID as number | Single user|
|Vote for movement | `NEW_VOTE` |Move object `{StartCell, EndCell}`| Team|
| New Chat | `INCOMING_CHAT` | Chat object `{Source, message}`| Team |
| Move done | `MOVED` |Move object `{StartCell, EndCell}` | All players|
|Result / End of game | `RESULT` | id of winner team | All players|
| Change of team to play (timeout) | `CHANGE` | id of the next team to play | All players |
| New Player Joined | `NEW_PLAYER` | Player object |All players |
| Player left | `PLAYER_LEFT` | Player object | All players |
|Pseudo already taken   | `PSEUDO_TAKEN`  | nothing  | Single user  |
|Pseudo OK   | `PSEUDO_OK`  | nothing  | Single user  |
|Vote removed by other player   | `DEL_VOTE`  |  Move object `{StartCell, EndCell}` |  Team|
|Player can start playing from now on   | `PLAY`   | nothing   | Single user  |
