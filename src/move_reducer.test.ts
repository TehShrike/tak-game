import { test } from 'node:test'
import assert from 'node:assert'
import p from './util/parse_position.ts'
import apply from './move_reducer.ts'
import move_is_valid from './move_is_valid.ts'
import type { BoardState, Player, PlaceMove, MoveMove } from './types.ts'

function few_random_pieces(whose_turn: Player = 'x'): BoardState {
	return p(`
		x|  |
		 |  |O
		 |o^|
	`, whose_turn)
}

test('place a new piece', () => {
	const move: PlaceMove = {
		type: 'PLACE',
		x: 1,
		y: 2,
		piece: 'x',
		standing: false
	}
	assert.ok(move_is_valid(few_random_pieces('x'), move))
	const actual = apply(few_random_pieces('x'), move)

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
	assert.ok(move_is_valid(few_random_pieces('o'), move))
	const actual = apply(few_random_pieces('o'), move)

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
	const board_state = few_random_pieces('x')
	board_state.pieces_in_hand.x.capstones = 1

	assert.ok(move_is_valid(board_state, move))
	const actual = apply(board_state, move)

	const expected = p(`
		x|X |
		 |  |O
		 |o^|
	`, 'o')

	expected.pieces_in_hand.x.capstones = 0

	assert.deepStrictEqual(actual, expected)
})

test('move a stack', () => {
	function starting_stacks(whose_turn: Player): BoardState {
		return p(`
			xxooxx|oo|X  |
			oox   |O |ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whose_turn)
	}

	function test_move(message: string, move: MoveMove, whose_turn: Player, expected: BoardState) {
		assert.ok(move_is_valid(starting_stacks(whose_turn), move), `VALID: ${message}`)
		assert.deepStrictEqual(apply(starting_stacks(whose_turn), move), expected, message)
	}

	test_move('moving a stack across the whole row, dropping one piece on every square (<)', {
		type: 'MOVE',
		y: 0,
		x: 3,
		direction: '<',
		drops: [1, 1, 1, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |O |ooo|o
		xxoo  |o^|x^ |xxo^
		oxo   |xo|ooo|o
	`, 'x'))

	test_move('moving the standing stone off the top of a stack (+)', {
		type: 'MOVE',
		y: 1,
		x: 3,
		direction: '+',
		drops: [2, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |O |ooo|oo^
		xxoo  |o^|x^ |xx
		ox    |x |oo |oooo
	`, 'x'))

	test_move('moving the carry-limits worth of stones', {
		type: 'MOVE',
		y: 3,
		x: 0,
		direction: '>',
		drops: [0, 4]
	}, 'x', p(`
		xx  |ooooxx|X  |
		oox |O     |ooo|o
		xxoo|o^    |x^ |xxo^
		ox  |x     |oo |oooo
	`, 'o'))

	test_move('flattening a standing stone', {
		type: 'MOVE',
		y: 2,
		x: 1,
		direction: '-',
		drops: [0, 1]
	}, 'o', p(`
		xxooxx|oo|X  |
		oox   |  |ooo|o
		xxoo  |oO|x^ |xxo^
		ox    |x |oo |oooo
	`, 'x'))
})
