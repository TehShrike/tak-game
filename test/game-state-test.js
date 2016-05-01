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

	t.ok(gameState.gameOver, 'game is over')
	t.equal(gameState.winner, 'x', 'x wins')
	t.equal(gameState.ownedSquares.x, 3)
	t.equal(gameState.ownedSquares.o, 2)

	t.end()
})

test(`The game's not over unless someone has used up all their pieces`, t => {
	const boardState = p(`
		x|oo|xx
		 |x |
		 |oo|
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

test('the game is over once all squares are filled: tie', t => {
	const boardState = p.pieces(p(`
		xo |oox |xo^ |x
		o  |x   |oxo |o
		xx |oo  |ox^ |x
		o  |xX  |o^  |ox
	`), {
		x: 1,
		o: 1,
		X: 1,
		O: 1
	})

	const gameState = getGameState(boardState)

	t.ok(gameState.gameOver, 'game is over')
	t.equal(gameState.winner, null, 'nobody wins')
	t.equal(gameState.ownedSquares.x, 6)
	t.equal(gameState.ownedSquares.o, 6)

	t.end()
})

test('the game is over once all squares are filled: x wins', t => {
	const boardState = p.pieces(p(`
		xo |oox |xo^ |x
		o  |x   |oxo |o
		xx |oo  |ox  |x
		o  |xX  |o^  |ox
	`), {
		x: 1,
		o: 1,
		X: 1,
		O: 1
	})

	const gameState = getGameState(boardState)

	t.ok(gameState.gameOver, 'game is over')
	t.equal(gameState.winner, 'x', 'x wins')
	t.equal(gameState.ownedSquares.x, 7)
	t.equal(gameState.ownedSquares.o, 6)

	t.end()
})

// game end:
// a road is made from one side to another
