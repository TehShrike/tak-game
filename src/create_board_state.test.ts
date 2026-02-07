import { test } from 'node:test'
import assert from 'node:assert'
import create_board_state from './create_board_state.ts'

test('Create an empty board of size 4', () => {
	const expected = {
		size: 4,
		whose_turn: 'x' as const,
		y: [
			[
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			]
		],
		pieces_in_hand: {
			x: { pieces: 15, capstones: 0 },
			o: { pieces: 15, capstones: 0 }
		}
	}

	const output = create_board_state(4)

	assert.deepStrictEqual(expected, output)
})

test('Create an empty board of size 5', () => {
	const expected = {
		size: 5,
		whose_turn: 'x' as const,
		y: [
			[
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			], [
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] },
				{ top_is_standing: false, pieces: [] }
			]
		],
		pieces_in_hand: {
			x: { pieces: 21, capstones: 1 },
			o: { pieces: 21, capstones: 1 }
		}
	}

	const output = create_board_state(5)

	assert.deepStrictEqual(output, expected)
})

test('Correct piece counts at different board sizes', () => {
	function test_creation(board_size: number, expected_pieces: number, expected_capstones: number) {
		const board_state = create_board_state(board_size)

		assert.strictEqual(board_state.pieces_in_hand.x.pieces, expected_pieces, `Correct number of pieces for X at board size ${board_size}`)
		assert.strictEqual(board_state.pieces_in_hand.o.pieces, expected_pieces, `Correct number of pieces for O at board size ${board_size}`)

		assert.strictEqual(board_state.pieces_in_hand.x.capstones, expected_capstones, `Correct number of capstones for X at board size ${board_size}`)
		assert.strictEqual(board_state.pieces_in_hand.o.capstones, expected_capstones, `Correct number of capstones for O at board size ${board_size}`)
	}

	test_creation(3, 10, 0)
	test_creation(4, 15, 0)
	test_creation(5, 21, 1)
	test_creation(6, 30, 1)
	test_creation(7, 40, 1)
	test_creation(8, 50, 2)
})
