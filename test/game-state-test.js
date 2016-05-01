const test = require('tape')
const p = require('../parse-position')
const getGameState = require('../game-state')

test('game over when someone runs out of pieces', t => {
	const boardState = p(`
		xxx|ooo|xxx
		   |x  |
		   |ooo|
	`)

	const gameState = getGameState(p.pieces(boardState, {
		x: 0,
		X: 0,
		o: 1,
		O: 0
	}))

	t.ok(gameState.gameOver)
	t.equal(gameState.winner, 'x')
	t.equal(gameState.ownedSquares.x, 3)
	t.equal(gameState.ownedSquares.o, 2)

	t.end()
})

test(`The game's not over unless someone has used up all their pieces`, t => {
	const boardState = p(`
		xxx|ooo|xxx
		   |x  |
		   |ooo|
	`)

	function assertNotOver(pieces) {
		const gameState = getGameState(p.pieces(boardState, pieces))

		t.notOk(gameState.gameOver)
	}

	assertNotOver({
		x: 1,
		X: 0,
		o: 1,
		O: 0
	})
	assertNotOver({
		x: 0,
		X: 1,
		o: 0,
		O: 1
	})
	assertNotOver({
		x: 1,
		X: 0,
		o: 0,
		O: 1
	})
	assertNotOver({
		x: 0,
		X: 1,
		o: 1,
		O: 0
	})

	t.end()
})

// game end:
// 1. someone is out of pieces
// 2. every spot is filled
// 3. a road is made from one side to another