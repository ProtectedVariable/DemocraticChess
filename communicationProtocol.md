# Communication Protocol

The encapsulation of the communication has not been decided yet but will either be of the form:

```
{
	id: <client-id / server>,
	message: <textMessage>
}
```
or of the more flexible form:
```
{
	id: <client-id / server>,
	message:
	{
			actionType : <type>,
			parameters : <params>
	}

}
```

## Client to Server communication

The following types of messages will be available:

|Description	|Syntax|
|----------		|------|
|Name announcement	| `NAME_<name>`|
|Vote for movement | `MOVE_<StartCell>_<EndCell>` |
|Chat message | `CHAT_<message>`|

## Server to Client communication
|Description	|Syntax|Scope|
|----------		|------|------|
|Team assignment | `TEAM_<white/black>`| Single user|
|Board state | `BOARD_<board>` | Single user|
|Player list | `LIST_<players>` | Single user|
|Vote for movement | `VOTE_<StartCell>_<EndCell>` | Team|
| New Chat | `CHAT_<source>_<message>` | Team |
| Move done | `MOVED_<StartCell>_<EndCell>` | All players|
|Result / End of game | `RESULT_<winner>` | All players|
| Change of team to play (timeout) | `CHANGE_<nextTeamToPlay>` | All players |
| New Player Joined | `PLAYER_<name><white/black>` | All players |
