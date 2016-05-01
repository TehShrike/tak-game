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

	t.equal(gameState.gameOver, true, 'game is over')
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

		t.equal(gameState.gameOver, false)
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

	t.equal(gameState.gameOver, true, 'game is over')
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

	t.equal(gameState.gameOver, true, 'game is over')
	t.equal(gameState.winner, 'x', 'x wins')
	t.equal(gameState.ownedSquares.x, 7)
	t.equal(gameState.ownedSquares.o, 6)

	t.end()
})

function xy(x, y) {
	return { x, y }
}

test('Win by vertical road', t => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		 |  |xo|x
		x|xx|xO|
		o|o |o |x
		o|x |  |x
	`))

	t.equal(gameOver, true, 'game is over')
	t.equal(winner, 'o')
	t.deepEqual(winningRoute, {
		x: null,
		o: [xy(0,0), xy(0,1), xy(1,1), xy(2,1), xy(2,2), xy(2,3)]
	})

	t.end()
})

test('Win by horizontal road', t => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		 |  |xo|o
		x|xX|ox|
		o|o |x |o
		o|x |x |x
	`))

	t.equal(gameOver, true, 'game is over')
	t.equal(winner, 'x')
	t.deepEqual(winningRoute, {
		x: [xy(0,2), xy(1,2), xy(2,2), xy(2,1), xy(2,0), xy(3,0)],
		o: null
	})

	t.end()
})

test('Tied winning routes', t => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		o|o |xx|o
		x|xo|xo|o
		x|x |x^|x
		O|x |x |x
	`))

	t.equal(gameOver, true, 'game is over')
	t.equal(winner, null)
	t.deepEqual(winningRoute, {
		x: [xy(0,1), xy(1,1), xy(1,0), xy(2,0), xy(3,0)],
		o: [xy(0,3), xy(1,3), xy(1,2), xy(2,2), xy(3,2)]
	})

	t.end()
})

test('backtracking route on a 7x7 board', t => {
	const { winner, gameOver, winningRoute } = getGameState(p(`
		o|o^|xx|X|  |o|
		x|xo|xo|o|o^|o|
		x|xo|x^|o|ox|o|
		O|xo|x |o|o |o|
		 |o |o | |  | |
		 |  |o | |xx| |
		 |  |o | |  | |
	`))

	t.equal(gameOver, true, 'game is over')
	t.equal(winner, 'o')
	t.deepEqual(winningRoute, {
		x: null,
		o: [xy(2,0), xy(2,1), xy(2,2), xy(1,2), xy(1,3), xy(1,4), xy(1,5), xy(2,5), xy(3,5), xy(3,4), xy(3,3), xy(4,3), xy(5,3), xy(5,4), xy(5,5), xy(5,6)]
	})

	t.end()
})
