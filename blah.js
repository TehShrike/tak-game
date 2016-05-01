const inspect = require('util').inspect
function log(o) {
  console.log(inspect(o, { depth: null }))
}

const { moveIsValid, moveReducer, gameState } = require('.')

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

const place = {
  type: 'PLACE',
  x: 0,
  y: 3,
  piece: 'o',
  standing: true
}

log(moveReducer(boardState, place))

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