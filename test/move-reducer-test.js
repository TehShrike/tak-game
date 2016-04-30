const test = require('tape')
const p = require('../parse-position')
const apply = require('../move-reducer')

const fewRandomPieces = p(`
	x|  |
	 |  |O
	 |o^|
`)

test('place a new piece', t => {
	const actual = apply(fewRandomPieces, {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'x'
	})

	const expected = p(`
		x|x |
		 |  |O
		 |o^|
	`)

	t.deepEqual(actual, expected)
	t.end()
})

test('place a new standing piece', t => {
	const actual = apply(fewRandomPieces, {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'o',
		standing: true
	})

	const expected = p(`
		x|o^|
		 |  |O
		 |o^|
	`)

	t.deepEqual(actual, expected)
	t.end()
})

test('place a new capstone', t => {
	const actual = apply(fewRandomPieces, {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'X'
	})

	const expected = p(`
		x|X |
		 |  |O
		 |o^|
	`)

	t.deepEqual(actual, expected)
	t.end()
})

test('move a stack', t => {
	const startingStacks = p(`
		xxooxx|oo|X  |
		oox   |O |ooo|o
		xxoo  |o^|x^ |xxo^
		ox    |x |oo |oooo
	`)

	function testMove(message, move, expected) {
		t.deepEqual(apply(startingStacks, move), p(expected), message)
	}

	testMove('moving a stack across the whole row, dropping one piece on every square (x-)', {
		type: 'MOVE',
		y: 0,
		x: 3,
		axis: 'x',
		direction: '-',
		drops: [1, 1, 1, 1]
	}, `
		xxooxx|oo|X  |
		oox   |O |ooo|o
		xxoo  |o^|x^ |xxo^
		oxo   |xo|ooo|o
	`)

	testMove('moving the standing stone off the top of a stack (y+)', {
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [2, 1]
	}, `
		xxooxx|oo|X  |
		oox   |O |ooo|oo^
		xxoo  |o^|x^ |xx
		ox    |x |oo |oooo
	`)

	testMove('moving the carry-limits worth of stones', {
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'x',
		direction: '+',
		drops: [0, 4]
	}, `
		xx  |ooooxx|X  |
		oox |O     |ooo|o
		xxoo|o^    |x^ |xxo^
		ox  |x     |oo |oooo
	`)

	testMove('flattening a standing stone', {
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, `
		xxooxx|oo|X  |
		oox   |  |ooo|o
		xxoo  |oO|x^ |xxo^
		ox    |x |oo |oooo
	`)

	t.end()
})
