import valid_piece from "./rules/valid_piece.ts"
import get_square from "./board/get_square.ts"
import get_pieces_picked_up_from_square from "./rules/pieces_picked_up_from_square.ts"
import * as assert_types from "./rules/assert_types.ts"
import { map as move_map } from "./rules/iterate_over_move_squares.ts"
import { top_piece_of_square as top_piece_is_capstone, piece as is_capstone } from "./rules/is_capstone.ts"
import square_is_owned_by from "./board/square_is_owned_by.ts"
import piece_to_player from "./rules/piece_to_player.ts"
import type { BoardState, Move, PlaceMove, MoveMove } from "./types.ts"

export default function move_is_valid(board_state: BoardState, move: Move): boolean {
	if (move.type === "PLACE") {
		return can_place(board_state, move)
	} else if (move.type === "MOVE") {
		return can_move(board_state, move)
	}

	return false
}

function can_place(board_state: BoardState, move: PlaceMove): boolean {
	assert_types.place(move)

	const first_turn = is_first_turn(board_state)

	const correct_players_turn = piece_to_player(move.piece) === board_state.whose_turn

	if (first_turn) {
		return !correct_players_turn
	} else {
		return (
			correct_players_turn &&
			has_pieces_left(board_state, move) &&
			not_a_standing_capstone(move) &&
			valid_piece(move.piece) &&
			get_square(board_state, move).pieces.length === 0
		)
	}
}

function is_first_turn(board_state: BoardState): boolean {
	const pieces_on_board = board_state.y.reduce((total, row) => {
		return total + row.reduce((t, square) => t + square.pieces.length, 0)
	}, 0)

	return pieces_on_board <= 2
}

function has_pieces_left(board_state: BoardState, move: PlaceMove): boolean {
	const piece_count_key = is_capstone(move.piece) ? "capstones" : "pieces"
	const pieces_left = board_state.pieces_in_hand[piece_to_player(move.piece)][piece_count_key]
	return pieces_left > 0
}

function not_a_standing_capstone(move: PlaceMove): boolean {
	return !(/[XO]/.test(move.piece) && move.standing)
}

function can_move(board_state: BoardState, move: MoveMove): boolean {
	assert_types.move(move)

	if (is_first_turn(board_state)) {
		return false
	}

	const starting_square = get_square(board_state, move)

	return (
		square_is_owned_by(starting_square, board_state.whose_turn) &&
		correct_drop_amounts(move) &&
		drops_add_up_to_picked_up(board_state, move) &&
		all_drops_stay_on_the_board(board_state, move) &&
		does_not_hit_a_blocking_piece(board_state, move)
	)
}

function correct_drop_amounts(move: MoveMove): boolean {
	return move.drops.length > 1 && move.drops.slice(1).every(dropped => dropped > 0)
}

function all_drops_stay_on_the_board(board_state: BoardState, move: MoveMove): boolean {
	const starting_coordinate = move[move.axis]
	const move_spaces = move.drops.length - 1
	const ending_coordinate = starting_coordinate + (move.direction === "+" ? move_spaces : -move_spaces)
	return ending_coordinate >= 0 && ending_coordinate < board_state.size
}

function drops_add_up_to_picked_up(board_state: BoardState, move: MoveMove): boolean {
	const picked_up_count = get_pieces_picked_up_from_square(board_state, move)
	return move.drops.reduce((total, drop) => total + drop, 0) === picked_up_count
}

type PieceDeetz = {
	capstone: boolean
	top_is_standing?: boolean
	standing?: boolean
	dropping_only_a_capstone?: boolean
}

function does_not_hit_a_blocking_piece(board_state: BoardState, move: MoveMove): boolean {
	return move_map(board_state, move, ({ coordinates, first, pieces_being_dropped }): PieceDeetz => {
		if (first) {
			return {
				capstone: false,
				standing: false,
			}
		} else {
			const square = get_square(board_state, coordinates)
			const dropping_only_a_capstone =
				pieces_being_dropped.length === 1 && is_capstone(pieces_being_dropped[0]!)
			return {
				capstone: top_piece_is_capstone(square),
				top_is_standing: square.top_is_standing,
				dropping_only_a_capstone,
			}
		}
	}).every(
		piece_deetz =>
			(!piece_deetz.capstone && !piece_deetz.top_is_standing) ||
			(piece_deetz.top_is_standing && piece_deetz.dropping_only_a_capstone),
	)
}
