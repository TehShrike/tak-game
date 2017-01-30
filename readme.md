# [Tak](http://cheapass.com/games/tak) game rules implementation

A set of JavaScript functions for managing the board state of a Tak game, determining whether or not moves are legal, and determining win states.

Based on the [beta rules](http://cheapass.com/sites/default/files/TakBetaRules3-10-16.pdf) from 2016-03-10.

## API

<!-- js
const { moveIsValid, moveReducer, createBoardState, gameState } = require('.')
-->

```
const { moveIsValid, moveReducer, createBoardState, gameState } = require('tak-game')
```

- `moveIsValid(boardState, moveAction)` - returns `true`/`false`.  Will throw errors on bad types.
- `moveReducer(boardState, moveAction)` - returns a new board state.  Acceptable action types are `'PLACE'` and `'MOVE'`.  Is a valid [Redux](http://redux.js.org/) reducer.
- `createBoardState(boardSize)` - returns a fresh board state for a board with `boardSize` rows/columns
- `gameState(boardState)` - returns details about the game derived from the board state:
	- `gameOver` - true/false
	- `winner` - `null`/`'x'`/`'o'`
	- `ownedSquares` - `{ x: [number], o: [number] }`
	- `winningRoute` - `{ x: [array of x/y coordinates], o: [array of x/y coordinates] }`

An example `moveAction` for placing a piece:
```js
const placeAction = {
	type: 'PLACE',
	x: 1,
	y: 2,
	piece: 'x',
	standing: false
}
```

An example `moveAction` for moving a stack:
```js
const moveAction = {
	type: 'MOVE',
	y: 0,
	x: 3,
	axis: 'x',
	direction: '-',
	drops: [1, 1, 1, 1]
}
```

## Examples

```js
const boardState = { size: 4,
  whoseTurn: 'o',
  y:
   [ [ { topIsStanding: false, pieces: [] },
       { topIsStanding: false, pieces: [] },
       { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: false, pieces: [ 'x', 'o' ] } ],
     [ { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: true, pieces: [ 'x', 'x' ] },
       { topIsStanding: false, pieces: [ 'x', 'o' ] },
       { topIsStanding: false, pieces: [] } ],
     [ { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'x' ] } ],
     [ { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: false, pieces: [] },
       { topIsStanding: false, pieces: [ 'x' ] } ] ],
  piecesInHand:
   { x: { pieces: 6, capstones: 0 },
     o: { pieces: 9, capstones: 0 } } }

gameState(boardState) // => { gameOver: false, winner: null, ownedSquares: { x: 5, o: 6 }, winningRoute: { x: null, o: null } }

const move = {
	type: 'MOVE',
	y: 3,
	x: 3,
	axis: 'x',
	direction: '-',
	drops: [1, 1]
}

moveIsValid(boardState, move) // => true

const expectedBoardState = { gameOver: true,
  winner: 'o',
  ownedSquares: { x: 5, o: 6 },
  winningRoute:
   { x: null,
     o:
      [ { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 } ] } }

gameState(moveReducer(boardState, move)) // => expectedBoardState


const place = {
	type: 'PLACE',
	x: 0,
	y: 3,
	piece: 'o',
	standing: true
}

moveIsValid(boardState, place) // => true

const expectedStateAfterPlace = { size: 4,
  whoseTurn: 'x',
  y:
   [ [ { topIsStanding: true, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [] },
       { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: false, pieces: [ 'x', 'o' ] } ],
     [ { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: true, pieces: [ 'x', 'x' ] },
       { topIsStanding: false, pieces: [ 'x', 'o' ] },
       { topIsStanding: false, pieces: [] } ],
     [ { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'x' ] } ],
     [ { topIsStanding: false, pieces: [ 'o' ] },
       { topIsStanding: false, pieces: [ 'x' ] },
       { topIsStanding: false, pieces: [] },
       { topIsStanding: false, pieces: [ 'x' ] } ] ],
  piecesInHand:
   { x: { pieces: 6, capstones: 0 },
     o: { pieces: 8, capstones: 0 } } }

moveReducer(boardState, place) // => expectedStateAfterPlace

```

## Some things to know about the game states

x and y coordinates start at 0,0.  x is horizontal, y is vertical.  These functions do not dictate which "side" of the board is x and which is y.

y coordinates int he game state array are reversed from the y coordinates used on the game board.  This made it easier when coding because I would parse boards from top to bottom.  If this turns out too confusing to me, I will change it later with a major version bump.

A "move" action picks up the whole stack, up to the carry limit.  The first drop count is how many stones to drop back down on that first square (can be 0).

The move reducer functions do not validate moves before they apply them.  Make sure that any move has been validated by calling `moveIsValid` before applying it.

## If you find any issues

The most basic way to help is to [open an issue](https://github.com/TehShrike/tak-game/issues).

If you're able to make a move that you shouldn't be able to, or you can't make a move that seems to be legal, you should make a new failing test in [move-is-valid-test.js](https://github.com/TehShrike/tak-game/blob/master/test/move-is-valid-test.js) and open a pull request.

If a game acts like it's over when it really isn't, or the game isn't detecting that you won, you should make a new failing test in [game-state-test.js](https://github.com/TehShrike/tak-game/blob/master/test/game-state-test.js) and open a pull request.

To download the source code and run the tests (you'll need node):

```sh
git clone https://github.com/TehShrike/tak-game.git
npm install
npm test
```

## License

Code copyright Josh Duff, licensed [WTFPL](http://wtfpl2.com).  Game rules copyright 2016 James Ernest and Cheapass Games.
