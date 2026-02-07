# [Tak](http://cheapass.com/games/tak) game rules implementation

A set of JavaScript functions for managing the board state of a Tak game, determining whether or not moves are legal, and determining win states.

Based on the [beta rules](http://cheapass.com/sites/default/files/TakBetaRules3-10-16.pdf) from 2016-03-10.

## API

<!-- js
const { move_is_valid, move_reducer, create_board_state, game_state } = require('.')
-->

```
const { move_is_valid, move_reducer, create_board_state, game_state } = require('tak-game')
```

- `move_is_valid(board_state, move_action)` - returns `true`/`false`.  Will throw errors on bad types.
- `move_reducer(board_state, move_action)` - returns a new board state.  Acceptable action types are `'PLACE'` and `'MOVE'`.  Is a valid [Redux](http://redux.js.org/) reducer.
- `create_board_state(board_size)` - returns a fresh board state for a board with `board_size` rows/columns
- `game_state(board_state)` - returns details about the game derived from the board state:
	- `game_over` - true/false
	- `winner` - `null`/`'x'`/`'o'`
	- `owned_squares` - `{ x: [number], o: [number] }`
	- `winning_route` - `{ x: [array of x/y coordinates], o: [array of x/y coordinates] }`

An example `move_action` for placing a piece:
```js
const placeAction = {
	type: 'PLACE',
	x: 1,
	y: 2,
	piece: 'x',
	standing: false
}
```

An example `move_action` for moving a stack:
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
const board_state = { size: 4,
  whose_turn: 'o',
  y:
   [ [ { top_is_standing: false, pieces: [] },
       { top_is_standing: false, pieces: [] },
       { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: false, pieces: [ 'x', 'o' ] } ],
     [ { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: true, pieces: [ 'x', 'x' ] },
       { top_is_standing: false, pieces: [ 'x', 'o' ] },
       { top_is_standing: false, pieces: [] } ],
     [ { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'x' ] } ],
     [ { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: false, pieces: [] },
       { top_is_standing: false, pieces: [ 'x' ] } ] ],
  pieces_in_hand:
   { x: { pieces: 6, capstones: 0 },
     o: { pieces: 9, capstones: 0 } } }

game_state(board_state) // => { game_over: false, winner: null, owned_squares: { x: 5, o: 6 }, winning_route: { x: null, o: null } }

const move = {
	type: 'MOVE',
	y: 3,
	x: 3,
	axis: 'x',
	direction: '-',
	drops: [1, 1]
}

move_is_valid(board_state, move) // => true

const expected_board_state = { game_over: true,
  winner: 'o',
  owned_squares: { x: 5, o: 6 },
  winning_route:
   { x: null,
     o:
      [ { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 } ] } }

game_state(move_reducer(board_state, move)) // => expected_board_state


const place = {
	type: 'PLACE',
	x: 0,
	y: 3,
	piece: 'o',
	standing: true
}

move_is_valid(board_state, place) // => true

const expected_state_after_place = { size: 4,
  whose_turn: 'x',
  y:
   [ [ { top_is_standing: true, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [] },
       { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: false, pieces: [ 'x', 'o' ] } ],
     [ { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: true, pieces: [ 'x', 'x' ] },
       { top_is_standing: false, pieces: [ 'x', 'o' ] },
       { top_is_standing: false, pieces: [] } ],
     [ { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'x' ] } ],
     [ { top_is_standing: false, pieces: [ 'o' ] },
       { top_is_standing: false, pieces: [ 'x' ] },
       { top_is_standing: false, pieces: [] },
       { top_is_standing: false, pieces: [ 'x' ] } ] ],
  pieces_in_hand:
   { x: { pieces: 6, capstones: 0 },
     o: { pieces: 8, capstones: 0 } } }

move_reducer(board_state, place) // => expected_state_after_place

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
