import starting_pieces_by_board_size from './rules/starting_piece_counts.ts'
import type { BoardState, Square } from './types.ts'

const empty_square: Readonly<Square> = Object.freeze({ top_is_standing: false, pieces: [] })

export default function create_board_state(board_size: number): BoardState {
	const starting_pieces = starting_pieces_by_board_size(board_size)

	return {
		size: board_size,
		whose_turn: 'x',
		pieces_in_hand: {
			x: { ...starting_pieces },
			o: { ...starting_pieces }
		},
		y: board_of_empty_rows(board_size)
	}
}

function board_of_empty_rows(board_size: number): Square[][] {
	return array_of(board_size, () => row_of_empty_pieces(board_size))
}

function row_of_empty_pieces(column_count: number): Square[] {
	return array_of(column_count, () => ({ ...empty_square, pieces: [] }))
}

function array_of<T>(number: number, factory: () => T): T[] {
	const ary: T[] = []

	for (let i = 0; i < number; ++i) {
		ary.push(factory())
	}

	return ary
}
