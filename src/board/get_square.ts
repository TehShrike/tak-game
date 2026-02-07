import turn_y_coordinate_into_array_index from './y_index.ts'
import type { BoardState, Coordinates, Square, Piece } from '../types.ts'

export default function get_square(board_state: BoardState, { x, y }: Coordinates): Square {
	const y_index = turn_y_coordinate_into_array_index(board_state, y)
	return board_state.y[y_index]![x]!
}

function update_square(board_state: BoardState, { x, y }: Coordinates, new_square: Square): BoardState {
	const y_index = turn_y_coordinate_into_array_index(board_state, y)
	const new_row = board_state.y[y_index]!.map((sq, i) => i === x ? new_square : sq)
	const new_y = board_state.y.map((row, i) => i === y_index ? new_row : row)

	return {
		...board_state,
		y: new_y
	}
}

export function add_pieces(board_state: BoardState, coordinates: Coordinates, pieces: Piece[], top_is_standing: boolean): BoardState {
	const old_square = get_square(board_state, coordinates)
	const new_square: Square = {
		pieces: [...old_square.pieces, ...pieces],
		top_is_standing
	}
	return update_square(board_state, coordinates, new_square)
}

export function remove_pieces(board_state: BoardState, coordinates: Coordinates, count: number): BoardState {
	const old_square = get_square(board_state, coordinates)
	const new_square: Square = {
		pieces: old_square.pieces.slice(0, -count),
		top_is_standing: false
	}
	return update_square(board_state, coordinates, new_square)
}
