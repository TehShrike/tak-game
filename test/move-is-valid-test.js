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

// test('Invalid movements', t => {
// 	function startingStacks(whoseTurn) {
// 		return p(`
// 			xxooxx|oo|X  |
// 			oox   |O |ooo|o
// 			xxoo  |o^|x^ |xxo^
// 			ox    |x |oo |oooo
// 		`, whoseTurn)
// 	}

// 	const xTurn = startingStacks('x')
// 	const oTurn = startingStacks('o')

// 	t.notOk(moveIsValid(oTurn, {
// 		type: 'MOVE',
// 		y: 3,
// 		x: 0,
// 		axis: 'x',
// 		direction: '+',
// 		drops: [0, 1, 2]
// 	}), 'the first in the drop list can be 0')

// 	t.notOk(moveIsValid(oTurn, {
// 		type: 'MOVE',
// 		y: 3,
// 		x: 0,
// 		axis: 'x',
// 		direction: '+',
// 		drops: [1, 0, 2]
// 	}), 'only the first in the drop list can be 0')

// 	// testMove(, {
// 	// 	type: 'MOVE',
// 	// 	x:
// 	// })

// 	t.end()
// })


// TOASSERT: can't move from an empty square
// TOASSERT: can't move from a square that you don't own
// TOASSERT: no standing blocks or capstones in the path
// TOASSERT: no moving stacks off the edge of the board
// TOASSERT: moving exactly as many stones as could be picked up
// TOASSERT: only axis x and y are valid
// TOASSERT: only direction - and + are valid
// TOASSERT: must drop on >1 square
// TOASSERT: capstone can only move onto a standing stone if it is the only piece being dropped there
