import get_square from '../board/get_square.ts'
import type { BoardState, Coordinates } from '../types.ts'

export default function number_of_pieces_picked_up(board_state: BoardState, coordinates: Coordinates): number {
	const square = get_square(board_state, coordinates)
	return Math.min(board_state.size, square.pieces.length)
}
