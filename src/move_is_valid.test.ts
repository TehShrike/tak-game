import { test } from 'node:test'
import assert from 'node:assert'
import moveIsValid from './move_is_valid.ts'
import p from './util/parse_position.ts'
import type { BoardState, Player, Piece, PlaceMove, MoveMove } from './types.ts'

function fewRandomPieces(whoseTurn: Player): BoardState {
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

type MoveWithBoard = MoveMove & {
	board: BoardState
}

function assertMoveIsValidExceptFor(move: MoveWithBoard, key: keyof MoveWithBoard, value: unknown, message: string) {
	assert.ok(moveIsValid(move.board, move), `Valid portion: ${message}`)
	;(move as unknown as Record<string, unknown>)[key] = value
	assert.ok(!moveIsValid(move.board, move), message)
}



test('placing new stones', () => {
	function testSpot(y: number, x: number, whoseTurn: Player, piece: Piece, standing: boolean) {
		return moveIsValid(fewRandomPieces(whoseTurn), {
			type: 'PLACE',
			x,
			y,
			piece,
			standing
		})
	}
	function testEmptySpot(whoseTurn: Player, piece: Piece, standing = false) {
		return testSpot(2, 1, whoseTurn, piece, standing)
	}
	function testSpotWithStandingTop(whoseTurn: Player, piece: Piece, standing = false) {
		return testSpot(0, 1, whoseTurn, piece, standing)
	}
	function testSpotWithCapstone(whoseTurn: Player, piece: Piece, standing = false) {
		return testSpot(1, 2, whoseTurn, piece, standing)
	}

	assert.ok(testEmptySpot('x', 'x'), 'placing an x in an empty state is valid')
	assert.ok(testEmptySpot('x', 'X'), 'placing a capstone x in an empty state is valid')
	assert.ok(testEmptySpot('x', 'x', true), 'placing a standing x in an empty state is valid')
	assert.ok(testEmptySpot('o', 'o'), 'placing an o in an empty state is valid')
	assert.ok(testEmptySpot('o', 'O'), 'placing a capstone o in an empty state is valid')
	assert.ok(testEmptySpot('o', 'o', true), 'placing a standing o in an empty state is valid')

	assert.ok(!testEmptySpot('x', 'X', true), 'placing a standing capstone x makes no sense')
	assert.ok(!testEmptySpot('o', 'O', true), 'placing a standing capstone o makes no sense')

	assert.ok(!testEmptySpot('x', 'o'), `Can't place o when it's not o's turn`)
	assert.ok(!testEmptySpot('o', 'x'), `Can't place x when it's not x's turn`)
	assert.ok(!testEmptySpot('x', 'o', true), `Can't place standing o when it's not o's turn`)
	assert.ok(!testEmptySpot('o', 'x', true), `Can't place standing x when it's not x's turn`)
	assert.ok(!testEmptySpot('x', 'O'), `Can't place o capstone when it's not o's turn`)
	assert.ok(!testEmptySpot('o', 'x'), `Can't place x capstone when it's not x's turn`)

	assert.ok(!testSpotWithStandingTop('x', 'x'), 'placing an x in a spot with a standing stone on top is not valid')
	assert.ok(!testSpotWithStandingTop('x', 'X'), 'placing a capstone x in a spot with a standing stone on top is not valid')
	assert.ok(!testSpotWithStandingTop('x', 'x', true), 'placing a standing x in a spot with a standing stone on top is not valid')
	assert.ok(!testSpotWithStandingTop('o', 'o'), 'placing an o in a spot with a standing stone on top is not valid')
	assert.ok(!testSpotWithStandingTop('o', 'O'), 'placing a capstone o in a spot with a standing stone on top is not valid')
	assert.ok(!testSpotWithStandingTop('o', 'o', true), 'placing a standing o in a spot with a standing stone on top is not valid')

	assert.ok(!testSpotWithCapstone('x', 'x'), 'placing an x in a spot with a capstone on top is not valid')
	assert.ok(!testSpotWithCapstone('x', 'X'), 'placing a capstone x in a spot with a capstone on top is not valid')
	assert.ok(!testSpotWithCapstone('x', 'x', true), 'placing a standing x in a spot with a capstone on top is not valid')
	assert.ok(!testSpotWithCapstone('o', 'o'), 'placing an o in a spot with a capstone on top is not valid')
	assert.ok(!testSpotWithCapstone('o', 'O'), 'placing a capstone o in a spot with a capstone on top is not valid')
	assert.ok(!testSpotWithCapstone('o', 'o', true), 'placing a standing o in a spot with a capstone on top is not valid')
})

test(`During the first turn you can only place an opponent's piece`, () => {
	function placementMove(piece: Piece): PlaceMove {
		return {
			type: 'PLACE',
			x: 0,
			y: 0,
			piece,
			standing: false
		}
	}

	function placementAssertions(board: BoardState) {
		board.whoseTurn = 'o'

		assert.ok(moveIsValid(board, placementMove('x')), `o can place x on first turn`)

		assert.ok(!moveIsValid(board, placementMove('o')), `o can't place o on first turn`)

		board.whoseTurn = 'x'

		assert.ok(moveIsValid(board, placementMove('o')), `x can place o on first turn`)

		assert.ok(!moveIsValid(board, placementMove('x')), `x can't place x on first turn`)
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
})

test(`during the first turn, you can't move that one piece`, () => {
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

	assertMoveIsValidExceptFor({
		board: severalPieceBoard,
		type: 'MOVE',
		x: 0,
		y: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'board', singlePieceBoard, `Can't move during the first turn`)
})

test(`can't place when all your pieces are used up`, () => {
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

	assert.ok(!moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'o',
		standing: false
	}), `Can't place an o stone after they're all used up`)

	assert.ok(!moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'O',
		standing: false
	}), `Can't place an o capstone after they're all used up`)

	allPiecesUsedUp.whoseTurn = 'x'

	assert.ok(!moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'x',
		standing: false
	}), `Can't place an x stone after they're all used up`)

	assert.ok(!moveIsValid(allPiecesUsedUp, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'X',
		standing: false
	}), `Can't place an x capstone after they're all used up`)
})

test('only x and o are allowed piece types', () => {
	const empty = { y: 2, x: 1 }
	assert.throws(() => {
		moveIsValid(fewRandomPieces('x'), {
			type: 'PLACE',
			x: empty.x,
			y: empty.y,
			piece: 'y' as Piece,
			standing: false
		})
	})
})

test('invalid types are invalid', () => {
	assert.ok(!moveIsValid(fewRandomPieces('x'), {
		type: 'BUTTS' as 'PLACE',
		y: 0,
		x: 0,
		piece: 'x',
		standing: false
	}))
})

test('Invalid movements', () => {
	function startingStacks(whoseTurn: Player) {
		return p(`
			xxooxx|oo|X  |
			oox   |oO|ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whoseTurn)
	}

	const xTurn = startingStacks('x')
	const oTurn = startingStacks('o')

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [0, 1, 3]
	}, 'drops', [1, 0, 2], 'Only the first in the drop list can be 0')

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [1, 2, 2], `Can't move more stones than you can pick up`)

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 0,
		axis: 'y',
		direction: '-',
		drops: [2, 2]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up`)

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'x', 3, `Can't move from an empty space`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up, even with a standing stone`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 3]
	}, 'drops', [3], `Must move onto at least one other square`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '+',
		drops: [0, 1, 2]
	}, 'drops', [0, 1, 1, 1], `Can't move off the board up`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 1,
		x: 3,
		axis: 'y',
		direction: '-',
		drops: [0, 3]
	}, 'drops', [0, 1, 2], `Can't move off the board down`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [0, 2]
	}, 'drops', [0, 1, 1], `Can't move off the board right`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [1, 1]
	}, 'board', xTurn, `Can't move an o-owned stack when it's x's turn`)

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 0,
		x: 0,
		axis: 'y',
		direction: '+',
		drops: [1, 1]
	}, 'board', oTurn, `Can't move an x-owned stack when it's o's turn`)

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 3,
		x: 2,
		axis: 'y',
		direction: '-',
		drops: [0, 1]
	}, 'board', oTurn, `Can't move an x-capped stack when it's o's turn`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '+',
		drops: [0, 2]
	}, 'board', xTurn, `Can't move an o-capped stack when it's x's turn`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 0,
		x: 2,
		axis: 'x',
		direction: '+',
		drops: [0, 2]
	}, 'axis', 'y', `Can't move onto a standing stone`)

	assertMoveIsValidExceptFor({
		board: xTurn,
		type: 'MOVE',
		y: 2,
		x: 0,
		axis: 'y',
		direction: '+',
		drops: [1, 2]
	}, 'axis', 'x', `Can't move onto a capstone`)

	assertMoveIsValidExceptFor({
		board: oTurn,
		type: 'MOVE',
		y: 2,
		x: 1,
		axis: 'y',
		direction: '-',
		drops: [1, 1]
	}, 'drops', [0, 2], `Can't flatten a standing stone with anything but a single capstone`)
})
