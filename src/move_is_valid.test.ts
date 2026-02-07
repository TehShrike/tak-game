import { test } from 'node:test'
import assert from 'node:assert'
import move_is_valid from './move_is_valid.ts'
import p from './util/parse_position.ts'
import type { BoardState, Player, Piece, PlaceMove, MoveMove } from './types.ts'

function few_random_pieces(whose_turn: Player): BoardState {
	const board_state = p(`
		x|    |
		 |oX  |O
		 |oxo^|
	`, whose_turn)

	board_state.pieces_in_hand.x.capstones = 1
	board_state.pieces_in_hand.x.pieces = 1
	board_state.pieces_in_hand.o.capstones = 1
	board_state.pieces_in_hand.o.pieces = 1

	return board_state
}

type MoveWithBoard = MoveMove & {
	board: BoardState
}

function assert_move_is_valid_except_for(move: MoveWithBoard, key: keyof MoveWithBoard, value: unknown, message: string) {
	assert.ok(move_is_valid(move.board, move), `Valid portion: ${message}`)
	;(move as unknown as Record<string, unknown>)[key] = value
	assert.ok(!move_is_valid(move.board, move), message)
}



test('placing new stones', () => {
	function test_spot(y: number, x: number, whose_turn: Player, piece: Piece, standing: boolean) {
		return move_is_valid(few_random_pieces(whose_turn), {
			type: 'PLACE',
			x,
			y,
			piece,
			standing
		})
	}
	function test_empty_spot(whose_turn: Player, piece: Piece, standing = false) {
		return test_spot(2, 1, whose_turn, piece, standing)
	}
	function test_spot_with_standing_top(whose_turn: Player, piece: Piece, standing = false) {
		return test_spot(0, 1, whose_turn, piece, standing)
	}
	function test_spot_with_capstone(whose_turn: Player, piece: Piece, standing = false) {
		return test_spot(1, 2, whose_turn, piece, standing)
	}

	assert.ok(test_empty_spot('x', 'x'), 'placing an x in an empty state is valid')
	assert.ok(test_empty_spot('x', 'X'), 'placing a capstone x in an empty state is valid')
	assert.ok(test_empty_spot('x', 'x', true), 'placing a standing x in an empty state is valid')
	assert.ok(test_empty_spot('o', 'o'), 'placing an o in an empty state is valid')
	assert.ok(test_empty_spot('o', 'O'), 'placing a capstone o in an empty state is valid')
	assert.ok(test_empty_spot('o', 'o', true), 'placing a standing o in an empty state is valid')

	assert.ok(!test_empty_spot('x', 'X', true), 'placing a standing capstone x makes no sense')
	assert.ok(!test_empty_spot('o', 'O', true), 'placing a standing capstone o makes no sense')

	assert.ok(!test_empty_spot('x', 'o'), `Can't place o when it's not o's turn`)
	assert.ok(!test_empty_spot('o', 'x'), `Can't place x when it's not x's turn`)
	assert.ok(!test_empty_spot('x', 'o', true), `Can't place standing o when it's not o's turn`)
	assert.ok(!test_empty_spot('o', 'x', true), `Can't place standing x when it's not x's turn`)
	assert.ok(!test_empty_spot('x', 'O'), `Can't place o capstone when it's not o's turn`)
	assert.ok(!test_empty_spot('o', 'x'), `Can't place x capstone when it's not x's turn`)

	assert.ok(!test_spot_with_standing_top('x', 'x'), 'placing an x in a spot with a standing stone on top is not valid')
	assert.ok(!test_spot_with_standing_top('x', 'X'), 'placing a capstone x in a spot with a standing stone on top is not valid')
	assert.ok(!test_spot_with_standing_top('x', 'x', true), 'placing a standing x in a spot with a standing stone on top is not valid')
	assert.ok(!test_spot_with_standing_top('o', 'o'), 'placing an o in a spot with a standing stone on top is not valid')
	assert.ok(!test_spot_with_standing_top('o', 'O'), 'placing a capstone o in a spot with a standing stone on top is not valid')
	assert.ok(!test_spot_with_standing_top('o', 'o', true), 'placing a standing o in a spot with a standing stone on top is not valid')

	assert.ok(!test_spot_with_capstone('x', 'x'), 'placing an x in a spot with a capstone on top is not valid')
	assert.ok(!test_spot_with_capstone('x', 'X'), 'placing a capstone x in a spot with a capstone on top is not valid')
	assert.ok(!test_spot_with_capstone('x', 'x', true), 'placing a standing x in a spot with a capstone on top is not valid')
	assert.ok(!test_spot_with_capstone('o', 'o'), 'placing an o in a spot with a capstone on top is not valid')
	assert.ok(!test_spot_with_capstone('o', 'O'), 'placing a capstone o in a spot with a capstone on top is not valid')
	assert.ok(!test_spot_with_capstone('o', 'o', true), 'placing a standing o in a spot with a capstone on top is not valid')
})

test(`During the first turn you can only place an opponent's piece`, () => {
	function placement_move(piece: Piece): PlaceMove {
		return {
			type: 'PLACE',
			x: 0,
			y: 0,
			piece,
			standing: false
		}
	}

	function placement_assertions(board: BoardState) {
		board.whose_turn = 'o'

		assert.ok(move_is_valid(board, placement_move('x')), `o can place x on first turn`)

		assert.ok(!move_is_valid(board, placement_move('o')), `o can't place o on first turn`)

		board.whose_turn = 'x'

		assert.ok(move_is_valid(board, placement_move('o')), `x can place o on first turn`)

		assert.ok(!move_is_valid(board, placement_move('x')), `x can't place x on first turn`)
	}

	placement_assertions(p(`
		|||
		|||
		|||
		|||
	`))

	placement_assertions(p(`
		|||
		|||
		|||x
		|||
	`))

	placement_assertions(p(`
		|||
		|||
		|||
		|||o
	`))
})

test(`during the first turn, you can't move that one piece`, () => {
	const single_piece_board = p(`
		x||
		 ||
		 ||
	`)
	const several_piece_board = p(`
		x|o|x
		 | |
		 | |
	`)

	assert_move_is_valid_except_for({
		board: several_piece_board,
		type: 'MOVE',
		x: 0,
		y: 2,
		direction: '-',
		drops: [0, 1]
	}, 'board', single_piece_board, `Can't move during the first turn`)
})

test(`can't place when all your pieces are used up`, () => {
	const all_pieces_used_up = p(`
		xxxxx|xxxxx|xxxxx
		ooooo|ooooo|ooooo
		     |     |
	`, 'x')

	all_pieces_used_up.pieces_in_hand.x.pieces = 0
	all_pieces_used_up.pieces_in_hand.x.capstones = 0
	all_pieces_used_up.pieces_in_hand.o.pieces = 0
	all_pieces_used_up.pieces_in_hand.o.capstones = 0

	all_pieces_used_up.whose_turn = 'o'

	assert.ok(!move_is_valid(all_pieces_used_up, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'o',
		standing: false
	}), `Can't place an o stone after they're all used up`)

	assert.ok(!move_is_valid(all_pieces_used_up, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'O',
		standing: false
	}), `Can't place an o capstone after they're all used up`)

	all_pieces_used_up.whose_turn = 'x'

	assert.ok(!move_is_valid(all_pieces_used_up, {
		type: 'PLACE',
		x: 0,
		y: 0,
		piece: 'x',
		standing: false
	}), `Can't place an x stone after they're all used up`)

	assert.ok(!move_is_valid(all_pieces_used_up, {
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
		move_is_valid(few_random_pieces('x'), {
			type: 'PLACE',
			x: empty.x,
			y: empty.y,
			piece: 'y' as Piece,
			standing: false
		})
	})
})

test('invalid types are invalid', () => {
	assert.ok(!move_is_valid(few_random_pieces('x'), {
		type: 'BUTTS' as 'PLACE',
		y: 0,
		x: 0,
		piece: 'x',
		standing: false
	}))
})

test('Invalid movements', () => {
	function starting_stacks(whose_turn: Player) {
		return p(`
			xxooxx|oo|X  |
			oox   |oO|ooo|o
			xxoo  |o^|x^ |xxo^
			ox    |x |oo |oooo
		`, whose_turn)
	}

	const x_turn = starting_stacks('x')
	const o_turn = starting_stacks('o')

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 3,
		x: 0,
		direction: '-',
		drops: [0, 1, 3]
	}, 'drops', [1, 0, 2], 'Only the first in the drop list can be 0')

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 3,
		x: 0,
		direction: '-',
		drops: [2, 2]
	}, 'drops', [1, 2, 2], `Can't move more stones than you can pick up`)

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 3,
		x: 0,
		direction: '-',
		drops: [2, 2]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up`)

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 3,
		x: 2,
		direction: '-',
		drops: [0, 1]
	}, 'x', 3, `Can't move from an empty space`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 1,
		x: 3,
		direction: '+',
		drops: [0, 3]
	}, 'drops', [0, 2], `Can't move less stones than you can pick up, even with a standing stone`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 1,
		x: 3,
		direction: '+',
		drops: [0, 3]
	}, 'drops', [3], `Must move onto at least one other square`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 1,
		x: 3,
		direction: '+',
		drops: [0, 1, 2]
	}, 'drops', [0, 1, 1, 1], `Can't move off the board up`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 1,
		x: 3,
		direction: '-',
		drops: [0, 3]
	}, 'drops', [0, 1, 2], `Can't move off the board down`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 0,
		x: 2,
		direction: '>',
		drops: [0, 2]
	}, 'drops', [0, 1, 1], `Can't move off the board right`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 0,
		x: 2,
		direction: '>',
		drops: [1, 1]
	}, 'board', x_turn, `Can't move an o-owned stack when it's x's turn`)

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 0,
		x: 0,
		direction: '+',
		drops: [1, 1]
	}, 'board', o_turn, `Can't move an x-owned stack when it's o's turn`)

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 3,
		x: 2,
		direction: '-',
		drops: [0, 1]
	}, 'board', o_turn, `Can't move an x-capped stack when it's o's turn`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 2,
		x: 1,
		direction: '+',
		drops: [0, 2]
	}, 'board', x_turn, `Can't move an o-capped stack when it's x's turn`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 0,
		x: 2,
		direction: '>',
		drops: [0, 2]
	}, 'direction', '+', `Can't move onto a standing stone`)

	assert_move_is_valid_except_for({
		board: x_turn,
		type: 'MOVE',
		y: 2,
		x: 0,
		direction: '+',
		drops: [1, 2]
	}, 'direction', '>', `Can't move onto a capstone`)

	assert_move_is_valid_except_for({
		board: o_turn,
		type: 'MOVE',
		y: 2,
		x: 1,
		direction: '-',
		drops: [1, 1]
	}, 'drops', [0, 2], `Can't flatten a standing stone with anything but a single capstone`)
})
