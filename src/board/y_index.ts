import type { BoardState } from '../types.ts'

export default function turn_y_coordinate_into_array_index(board_state: BoardState, y: number): number {
	return board_state.size - y - 1
}
