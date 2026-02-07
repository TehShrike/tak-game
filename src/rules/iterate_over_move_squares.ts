import get_pieces_picked_up_from_square from './pieces_picked_up_from_square.ts'
import get_square from '../board/get_square.ts'
import type { BoardState, MoveMove, MoveDetails } from '../types.ts'

// non-obvious caveat: you can't call these functions after picking
// up the stack from the original spot

function move_details(starting_board_state: BoardState, move: MoveMove): (number_of_pieces_to_drop: number, offset: number) => MoveDetails {
	const starting_square = get_square(starting_board_state, move)
	const to_pick_up = get_pieces_picked_up_from_square(starting_board_state, move)

	// mutability warning: only ok because the array contains primitives
	const stack_to_move = starting_square.pieces.slice(-to_pick_up)

	function adjust(current: number, offset: number): number {
		return current + (move.direction === '+' ? offset : (-offset))
	}

	function get_next_square_coordinates(offset: number): { x: number; y: number } {
		const coordinates = {
			x: move.x,
			y: move.y
		}
		coordinates[move.axis] = adjust(coordinates[move.axis], offset)
		return coordinates
	}

	return function(number_of_pieces_to_drop: number, offset: number): MoveDetails {
		const current_square_coordinates = get_next_square_coordinates(offset)
		const first_drop = offset === 0
		const last_drop = offset === move.drops.length - 1
		const pieces_being_dropped = stack_to_move.splice(0, number_of_pieces_to_drop)

		return {
			coordinates: current_square_coordinates,
			first: first_drop,
			last: last_drop,
			pieces_being_dropped
		}
	}
}

export function reduce<T>(starting_board_state: BoardState, move: MoveMove, fn: (acc: T, details: MoveDetails) => T, initial: T): T {
	const get_details = move_details(starting_board_state, move)
	return move.drops.reduce((acc: T, number_of_pieces_to_drop: number, offset: number) => {
		const details = get_details(number_of_pieces_to_drop, offset)
		return fn(acc, details)
	}, initial)
}

export function for_each(starting_board_state: BoardState, move: MoveMove, fn: (details: MoveDetails) => void): void {
	const get_details = move_details(starting_board_state, move)
	move.drops.forEach((number_of_pieces_to_drop: number, offset: number) => {
		const details = get_details(number_of_pieces_to_drop, offset)
		fn(details)
	})
}

export function map<T>(starting_board_state: BoardState, move: MoveMove, fn: (details: MoveDetails) => T): T[] {
	const get_details = move_details(starting_board_state, move)
	return move.drops.map((number_of_pieces_to_drop: number, offset: number) => {
		const details = get_details(number_of_pieces_to_drop, offset)
		return fn(details)
	})
}
