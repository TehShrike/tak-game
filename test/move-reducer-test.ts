import { test } from 'node:test'
import assert from 'node:assert'
import p from '../parse-position.ts'
import apply from '../move-reducer.ts'
import moveIsValid from '../move-is-valid.ts'
import type { BoardState, Player, PlaceMove, MoveMove } from '../types.ts'

function fewRandomPieces(whoseTurn: Player = 'x'): BoardState {
	return p(`
		x|  |
		 |  |O
		 |o^|
	`, whoseTurn)
}

test('place a new piece', () => {
	const move: PlaceMove = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'x',
		standing: false
	}
	assert.ok(moveIsValid(fewRandomPieces('x'), move))
	const actual = apply(fewRandomPieces('x'), move)

	const expected = p(`
		x|x |
		 |  |O
		 |o^|
	`, 'o')

	assert.deepStrictEqual(actual, expected)
})

test('place a new standing piece', () => {
	const move: PlaceMove = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'o',
		standing: true
	}
	assert.ok(moveIsValid(fewRandomPieces('o'), move))
	const actual = apply(fewRandomPieces('o'), move)

	const expected = p(`
		x|o^|
		 |  |O
		 |o^|
	`, 'x')

	assert.deepStrictEqual(actual, expected)
})

test('place a new capstone', () => {
	const move: PlaceMove = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'X',
		standing: false
	}
	const boardState = fewRandomPieces('x')
	boardState.piecesInHand.x.capstones = 1

	assert.ok(moveIsValid(boardState, move))
	const actual = apply(boardState, move)

	const expected = p(`
		x|X |
		 |  |O
		 |o^|
	`, 'o')

	expected.piecesInHand.x.capstones = 0

	assert.deepStrictEqual(actual, expected)
})

test('move a stack', () => {
	function startingStacks(whoseTurn: Player): BoardState {
		return p(`
			xxooxx|oo|X  |
			oox   |O |ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whoseTurn)
	}

	function testMove(message: string, move: MoveMove, whoseTurn: Player, expected: BoardState) {
		assert.ok(moveIsValid(startingStacks(whoseTurn), move), `VALID: ${message}`)
		assert.deepStrictEqual(apply(startingStacks(whoseTurn), move), expected, message)
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
})
