const test = require('tape')
const p = require('../parse-position')
const apply = require('../move-reducer')
const moveIsValid = require('../move-is-valid')

function fewRandomPieces(whoseTurn = 'x') {
	return p(`
		x|  |
		 |  |O
		 |o^|
	`, whoseTurn)
}

test('place a new piece', t => {
	const move = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'x',
		standing: false
	}
	t.ok(moveIsValid(fewRandomPieces('x'), move))
	const actual = apply(fewRandomPieces('x'), move)

	const expected = p(`
		x|x |
		 |  |O
		 |o^|
	`, 'o')

	t.deepEqual(actual, expected)
	t.end()
})

test('place a new standing piece', t => {
	const move = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'o',
		standing: true
	}
	t.ok(moveIsValid(fewRandomPieces('o'), move))
	const actual = apply(fewRandomPieces('o'), move)

	const expected = p(`
		x|o^|
		 |  |O
		 |o^|
	`, 'x')

	t.deepEqual(actual, expected)
	t.end()
})

test('place a new capstone', t => {
	const move = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'X',
		standing: false
	}
	t.ok(moveIsValid(fewRandomPieces('x'), move))
	const actual = apply(fewRandomPieces('x'), move)

	const expected = p(`
		x|X |
		 |  |O
		 |o^|
	`, 'o')

	t.deepEqual(actual, expected)
	t.end()
})

test('move a stack', t => {
	function startingStacks(whoseTurn) {
		return p(`
			xxooxx|oo|X  |
			oox   |O |ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whoseTurn)
	}

	function testMove(message, move, whoseTurn, expected) {
		t.ok(moveIsValid(startingStacks(whoseTurn), move), `VALID: ${message}`)
		t.deepEqual(apply(startingStacks(whoseTurn), move), expected, message)
	}

	testMove('moving a stack across the whole row, dropping one piece on every square (x-)', {
		type: 'MOVE',
		y: 0,
		x: 3,
		axis: 'x',
		direction: '-',
		drops: [1, 1, 1, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |O |ooo|o
		xxoo  |o^|x^ |xxo^
		oxo   |xo|ooo|o
	`, 'x'))

	testMove('moving the standing stone off the top of a stack (y+)', {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [2, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |O |ooo|oo^
		xxoo  |o^|x^ |xx
		ox    |x |oo |oooo
	`, 'x'))

	testMove('moving the carry-limits worth of stones', {
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'x',
		direction: '+',
		drops: [0, 4]
	}, 'x', p(`
		xx  |ooooxx|X  |
		oox |O     |ooo|o
		xxoo|o^    |x^ |xxo^
		ox  |x     |oo |oooo
	`, 'o'))

	testMove('flattening a standing stone', {
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |  |ooo|o
		xxoo  |oO|x^ |xxo^
		ox    |x |oo |oooo
	`, 'x'))

	t.end()
})
