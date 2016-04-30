const moveIsValid = require('../move-is-valid')
const test = require('tape')
const p = require('../parse-position')

function fewRandomPieces(whoseTurn) {
	return p(`
		x|    |
		 |oX  |O
		 |oxo^|
	`, whoseTurn)
}

test('placing new stones', t => {
	function testSpot(y, x, whoseTurn, piece, standing) {
		return moveIsValid(fewRandomPieces(whoseTurn), {
			type: 'PLACE',
			x,
			y,
			piece,
			standing
		})
	}
	function testEmptySpot(whoseTurn, piece, standing = false) {
		return testSpot(2, 1, whoseTurn, piece, standing)
	}
	function testSpotWithStandingTop(whoseTurn, piece, standing = false) {
		return testSpot(0, 1, whoseTurn, piece, standing)
	}
	function testSpotWithCapstone(whoseTurn, piece, standing = false) {
		return testSpot(1, 2, whoseTurn, piece, standing)
	}

	t.ok(testEmptySpot('x', 'x'), 'placing an x in an empty state is valid')
	t.ok(testEmptySpot('x', 'X'), 'placing a capstone x in an empty state is valid')
	t.ok(testEmptySpot('x', 'x', true), 'placing a standing x in an empty state is valid')
	t.ok(testEmptySpot('o', 'o'), 'placing an o in an empty state is valid')
	t.ok(testEmptySpot('o', 'O'), 'placing a capstone o in an empty state is valid')
	t.ok(testEmptySpot('o', 'o', true), 'placing a standing o in an empty state is valid')

	t.notOk(testEmptySpot('x', 'X', true), 'placing a standing capstone x makes no sense')
	t.notOk(testEmptySpot('o', 'O', true), 'placing a standing capstone o makes no sense')

	t.notOk(testEmptySpot('x', 'o'), `Can't place o when it's not o's turn`)
	t.notOk(testEmptySpot('o', 'x'), `Can't place x when it's not x's turn`)
	t.notOk(testEmptySpot('x', 'o', true), `Can't place standing o when it's not o's turn`)
	t.notOk(testEmptySpot('o', 'x', true), `Can't place standing x when it's not x's turn`)
	t.notOk(testEmptySpot('x', 'O'), `Can't place o capstone when it's not o's turn`)
	t.notOk(testEmptySpot('o', 'x'), `Can't place x capstone when it's not x's turn`)

	t.notOk(testSpotWithStandingTop('x', 'x'), 'placing an x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('x', 'X'), 'placing a capstone x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('x', 'x', true), 'placing a standing x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('o', 'o'), 'placing an o in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('o', 'O'), 'placing a capstone o in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('o', 'o', true), 'placing a standing o in a spot with a standing stone on top is not valid')

	t.notOk(testSpotWithCapstone('x', 'x'), 'placing an x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('x', 'X'), 'placing a capstone x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('x', 'x', true), 'placing a standing x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('o', 'o'), 'placing an o in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('o', 'O'), 'placing a capstone o in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('o', 'o', true), 'placing a standing o in a spot with a capstone on top is not valid')

	t.end()
})

test('only x and o are allowed piece types', t => {
	const empty = { y: 2, x: 1 }
	t.throws(() => {
		moveIsValid(fewRandomPieces, {
			type: 'PLACE',
			x: empty.x,
			y: empty.y,
			piece: 'y',
			standing: false
		})
	})

	t.end()
})

test('invalid types are invalid', t => {
	t.notOk(moveIsValid(fewRandomPieces, {
		type: 'BUTTS',
		y: 0,
		x: 0,
		piece: 'x'
	}))
	t.end()
})

test('Invalid movements', t => {
	function startingStacks(whoseTurn) {
		return p(`
			xxooxx|oo|X  |
			oox   |O |ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whoseTurn)
	}

	const xTurn = startingStacks('x')
	const oTurn = startingStacks('o')

	function moveIsValidExceptFor(board, move, key, value, message) {
		t.ok(moveIsValid(board, move), `Valid portion: ${message}`)
		move[key] = value
		t.notOk(moveIsValid(board, move), message)
	}

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'x',
		direction: '+',
		drops: [0, 1, 3]
	}, 'drops', [1, 0, 2], 'Only the first in the drop list can be 0')

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [1, 2, 2], `Can't move more stones than you can pick up`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 3,
		x: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'x', 3, `Can't move from an empty space`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [3], `Must move onto at least one other square`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 1, 2]
	}, 'drops', [0, 1, 1, 1], `Can't move off the board up`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '-',
		drops: [0, 3]
	}, 'drops', [0, 1, 2], `Can't move off the board down`)

	moveIsValidExceptFor(xTurn, {
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [0, 2]
	}, 'drops', [0, 1, 1], `Can't move off the board right`)

	t.end()
})

// TOASSERT: you can only move a stack that you own
// TOASSERT: no standing blocks or capstones in the path
// TOASSERT: capstone can only move onto a standing stone if it is the only piece being dropped there
