const moveIsValid = require('../move-is-valid')
const test = require('tape')
const p = require('../parse-position')

const fewRandomPieces = p(`
	x|    |
	 |oX  |O
	 |oxo^|
`)

test('placing new stones', t => {
	function testSpot(y, x, piece, standing) {
		return moveIsValid(fewRandomPieces, {
			type: 'PLACE',
			x,
			y,
			piece,
			standing
		})
	}
	function testEmptySpot(piece, standing = false) {
		return testSpot(2, 1, piece, standing)
	}
	function testSpotWithStandingTop(piece, standing = false) {
		return testSpot(0, 1, piece, standing)
	}
	function testSpotWithCapstone(piece, standing = false) {
		return testSpot(1, 2, piece, standing)
	}

	t.ok(testEmptySpot('x'), 'placing an x in an empty state is valid')
	t.ok(testEmptySpot('X'), 'placing a capstone x in an empty state is valid')
	t.ok(testEmptySpot('x', true), 'placing a standing x in an empty state is valid')
	t.ok(testEmptySpot('o'), 'placing an o in an empty state is valid')
	t.ok(testEmptySpot('O'), 'placing a capstone o in an empty state is valid')
	t.ok(testEmptySpot('o', true), 'placing a standing o in an empty state is valid')

	t.notOk(testEmptySpot('X', true), 'placing a standing capstone x makes no sense')
	t.notOk(testEmptySpot('O', true), 'placing a standing capstone o makes no sense')

	t.notOk(testSpotWithStandingTop('x'), 'placing an x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('X'), 'placing a capstone x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('x', true), 'placing a standing x in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('o'), 'placing an o in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('O'), 'placing a capstone o in a spot with a standing stone on top is not valid')
	t.notOk(testSpotWithStandingTop('o', true), 'placing a standing o in a spot with a standing stone on top is not valid')

	t.notOk(testSpotWithCapstone('x'), 'placing an x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('X'), 'placing a capstone x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('x', true), 'placing a standing x in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('o'), 'placing an o in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('O'), 'placing a capstone o in a spot with a capstone on top is not valid')
	t.notOk(testSpotWithCapstone('o', true), 'placing a standing o in a spot with a capstone on top is not valid')

	t.end()
})

test('only x and o are allowed piece types', t => {
	const empty = { y: 2, x: 1 }
	t.notOk(moveIsValid(fewRandomPieces, {
		type: 'PLACE',
		x: empty.x,
		y: empty.y,
		piece: 'y',
		standing: false
	}))

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

