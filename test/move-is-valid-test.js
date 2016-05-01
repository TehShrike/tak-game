const moveIsValid = require('../move-is-valid')
const test = require('tape')
const p = require('../parse-position')

function fewRandomPieces(whoseTurn) {
	const boardState = p(`
		x|    |
		 |oX  |O
		 |oxo^|
	`, whoseTurn)

	boardState.piecesInHand.x.capstones = 1
	boardState.piecesInHand.x.pieces = 1
	boardState.piecesInHand.o.capstones = 1
	boardState.piecesInHand.o.pieces = 1

	return boardState
}

function assertMoveIsValidExceptFor(t, move, key, value, message) {
	t.ok(moveIsValid(move.board, move), `Valid portion: ${message}`)
	move[key] = value
	t.notOk(moveIsValid(move.board, move), message)
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

test(`During the first turn you can only place an opponent's piece`, t => {
	function placementMove(piece) {
		return {
			type: 'PLACE',
			x: 0,
			y: 0,
			piece,
			standing: false
		}
	}

	function placementAssertions(board) {
		board.whoseTurn = 'o'

		t.ok(moveIsValid(board, placementMove('x')), `o can place x on first turn`)

		t.notOk(moveIsValid(board, placementMove('o')), `o can't place o on first turn`)

		board.whoseTurn = 'x'

		t.ok(moveIsValid(board, placementMove('o')), `x can place o on first turn`)

		t.notOk(moveIsValid(board, placementMove('x')), `x can't place x on first turn`)
	}

	placementAssertions(p(`
		|||
		|||
		|||
		|||
	`))

	placementAssertions(p(`
		|||
		|||
		|||x
		|||
	`))

	placementAssertions(p(`
		|||
		|||
		|||
		|||o
	`))

	t.end()
})

test(`during the first turn, you can't move that one piece`, t => {
	const singlePieceBoard = p(`
		x||
		 ||
		 ||
	`)
	const severalPieceBoard = p(`
		x|o|x
		 | |
		 | |
	`)

	assertMoveIsValidExceptFor(t, {
		board: severalPieceBoard,
		type: 'MOVE',
		x: 0,
		y: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'board', singlePieceBoard, `Can't move during the first turn`)

	t.end()
})

test(`can't place when all your pieces are used up`, t => {
	const allPiecesUsedUp = p(`
		xxxxx|xxxxx|xxxxx
		ooooo|ooooo|ooooo
		     |     |
	`, 'x')

	allPiecesUsedUp.piecesInHand.x.pieces = 0
	allPiecesUsedUp.piecesInHand.x.capstones = 0
	allPiecesUsedUp.piecesInHand.o.pieces = 0
	allPiecesUsedUp.piecesInHand.o.capstones = 0

	allPiecesUsedUp.whoseTurn = 'o'

	t.notOk(moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'o',
		standing: false
	}), `Can't place an o stone after they're all used up`)

	t.notOk(moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'O',
		standing: false
	}), `Can't place an o capstone after they're all used up`)

	allPiecesUsedUp.whoseTurn = 'x'

	t.notOk(moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'x',
		standing: false
	}), `Can't place an x stone after they're all used up`)

	t.notOk(moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'X',
		standing: false
	}), `Can't place an x capstone after they're all used up`)

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
			oox   |oO|ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whoseTurn)
	}

	const xTurn = startingStacks('x')
	const oTurn = startingStacks('o')

	function moveIsValidExceptFor(...args) {
		args.unshift(t)
		assertMoveIsValidExceptFor.apply(null, args)
	}

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [0, 1, 3]
	}, 'drops', [1, 0, 2], 'Only the first in the drop list can be 0')

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [1, 2, 2], `Can't move more stones than you can pick up`)

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up`)

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'x', 3, `Can't move from an empty space`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up, even with a standing stone`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [3], `Must move onto at least one other square`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 1, 2]
	}, 'drops', [0, 1, 1, 1], `Can't move off the board up`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '-',
		drops: [0, 3]
	}, 'drops', [0, 1, 2], `Can't move off the board down`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [0, 2]
	}, 'drops', [0, 1, 1], `Can't move off the board right`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [1, 1]
	}, 'board', xTurn, `Can't move an o-owned stack when it's x's turn`)

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 0,
		x: 0,
		axis: 'y',
		direction: '+',
		drops: [1, 1]
	}, 'board', oTurn, `Can't move an x-owned stack when it's o's turn`)

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'board', oTurn, `Can't move an x-capped stack when it's o's turn`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '+',
		drops: [0, 2]
	}, 'board', xTurn, `Can't move an o-capped stack when it's x's turn`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [0, 2]
	}, 'axis', 'y', `Can't move onto a standing stone`)

	moveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 2,
		x: 0,
		axis: 'y',
		direction: '+',
		drops: [1, 2]
	}, 'axis', 'x', `Can't move onto a capstone`)

	moveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '-',
		drops: [1, 1]
	}, 'drops', [0, 2], `Can't flatten a standing stone with anything but a single capstone`)


	t.end()
})
