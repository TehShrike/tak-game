const { test } = require('node:test')
const assert = require('node:assert')
const p = require('../parse-position')
const getGameState = require('../game-state')

test('game over when someone runs out of pieces', () => {
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

	assert.strictEqual(gameState.gameOver, true, 'game is over')
	assert.strictEqual(gameState.winner, 'x', 'x wins')
	assert.strictEqual(gameState.ownedSquares.x, 3)
	assert.strictEqual(gameState.ownedSquares.o, 2)
})

test(`The game's not over unless someone has used up all their pieces`, () => {
	const boardState = p(`
		x|oo|xx
		 |x |
		 |oo|
	`)

	function assertNotOver(pieces) {
		const gameState = getGameState(p.pieces(boardState, pieces))

		assert.strictEqual(gameState.gameOver, false)
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
})

test('the game is over once all squares are filled: tie', () => {
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

	assert.strictEqual(gameState.gameOver, true, 'game is over')
	assert.strictEqual(gameState.winner, null, 'nobody wins')
	assert.strictEqual(gameState.ownedSquares.x, 6)
	assert.strictEqual(gameState.ownedSquares.o, 6)
})

test('the game is over once all squares are filled: x wins', () => {
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

	assert.strictEqual(gameState.gameOver, true, 'game is over')
	assert.strictEqual(gameState.winner, 'x', 'x wins')
	assert.strictEqual(gameState.ownedSquares.x, 7)
	assert.strictEqual(gameState.ownedSquares.o, 6)
})

function xy(x, y) {
	return { x, y }
}

test('Win by vertical road', () => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		 |  |xo|x
		x|xx|xO|
		o|o |o |x
		o|x |  |x
	`))

	assert.strictEqual(gameOver, true, 'game is over')
	assert.strictEqual(winner, 'o')
	assert.deepStrictEqual(winningRoute, {
		x: null,
		o: [xy(0,0), xy(0,1), xy(1,1), xy(2,1), xy(2,2), xy(2,3)]
	})
})

test('Win by horizontal road', () => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		 |  |xo|o
		x|xX|ox|
		o|o |x |o
		o|x |x |x
	`))

	assert.strictEqual(gameOver, true, 'game is over')
	assert.strictEqual(winner, 'x')
	assert.deepStrictEqual(winningRoute, {
		x: [xy(0,2), xy(1,2), xy(2,2), xy(2,1), xy(2,0), xy(3,0)],
		o: null
	})
})

test('Tied winning routes', () => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		o|o |xx|o
		x|xo|xo|o
		x|x |x^|x
		O|x |x |x
	`))

	assert.strictEqual(gameOver, true, 'game is over')
	assert.strictEqual(winner, null)
	assert.deepStrictEqual(winningRoute, {
		x: [xy(0,1), xy(1,1), xy(1,0), xy(2,0), xy(3,0)],
		o: [xy(0,3), xy(1,3), xy(1,2), xy(2,2), xy(3,2)]
	})
})

test('backtracking route on a 7x7 board', () => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		o|o^|xx|X|  |o|
		x|xo|xo|o|o^|o|
		x|xo|x^|o|ox|o|
		O|xo|x |o|o |o|
		 |o |o | |  | |
		 |  |o | |xx| |
		 |  |o | |  | |
	`))

	assert.strictEqual(gameOver, true, 'game is over')
	assert.strictEqual(winner, 'o')
	assert.deepStrictEqual(winningRoute, {
		x: null,
		o: [xy(2,0), xy(2,1), xy(2,2), xy(1,2), xy(1,3), xy(1,4), xy(1,5), xy(2,5), xy(3,5), xy(3,4), xy(3,3), xy(4,3), xy(5,3), xy(5,4), xy(5,5), xy(5,6)]
	})
})
