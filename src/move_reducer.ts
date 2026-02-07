import get_square, { add_pieces, remove_pieces } from './board/get_square.ts'
import get_pieces_picked_up_from_square from './rules/pieces_picked_up_from_square.ts'
import { reduce as reduce_move } from './rules/iterate_over_move_squares.ts'
import { piece as is_capstone } from './rules/is_capstone.ts'
import piece_to_player from './rules/piece_to_player.ts'
import type { BoardState, Move, PlaceMove, MoveMove, Coordinates } from './types.ts'

export default function move_reducer(board_state: BoardState, move: Move): BoardState {
	if (move.type === 'PLACE') {
		return apply_place(board_state, move)
	} else if (move.type === 'MOVE') {
		return apply_move(board_state, move)
	}
	// @ts-expect-error move.type is never at this point
	throw new Error(`Invalid move type: ${move.type}`)
}

function apply_place(board_state: BoardState, move: PlaceMove): BoardState {
	const piece_key = is_capstone(move.piece) ? 'capstones' : 'pieces'
	const player = piece_to_player(move.piece)

	const after_updating_square = add_pieces(board_state, move, [move.piece], !!move.standing)

	return toggle_whose_turn({
		...after_updating_square,
		pieces_in_hand: {
			...after_updating_square.pieces_in_hand,
			[player]: {
				...after_updating_square.pieces_in_hand[player],
				[piece_key]: after_updating_square.pieces_in_hand[player][piece_key] - 1
			}
		}
	})
}

function apply_move(initial_board_state: BoardState, move: MoveMove): BoardState {
	const starting_square = get_square(initial_board_state, move)
	const to_pick_up = get_pieces_picked_up_from_square(initial_board_state, move)

	const state_after_spreading_out_new_pieces = toggle_whose_turn(reduce_move(initial_board_state, move, (board_state, { coordinates, last, pieces_being_dropped }) => {
		return add_pieces(board_state, coordinates, pieces_being_dropped, last && starting_square.top_is_standing)
	}, initial_board_state))

	return pick_up(state_after_spreading_out_new_pieces, move, to_pick_up)
}


function pick_up(board_state: BoardState, coordinates: Coordinates, to_pick_up: number): BoardState {
	return remove_pieces(board_state, coordinates, to_pick_up)
}

function toggle_whose_turn(board_state: BoardState): BoardState {
	return {
		...board_state,
		whose_turn: board_state.whose_turn === 'x' ? 'o' : 'x'
	}
}
