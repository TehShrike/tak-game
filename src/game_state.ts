import { top_piece_of_square as top_piece_of_square_is_capstone } from './rules/is_capstone.ts'
import find_winning_route from './rules/find_winning_route.ts'
import get_owner from './board/get_owner.ts'
import type { BoardState, GameState, Player, Coordinates } from './types.ts'

export default function game_state(board_state: BoardState): GameState {
	const owned_squares = count_owned_squares(board_state)
	const winning_x_route = find_winning_route(board_state, 'x', 'x') || find_winning_route(board_state, 'y', 'x')
	const winning_o_route = find_winning_route(board_state, 'x', 'o') || find_winning_route(board_state, 'y', 'o')
	const route_win = !!(winning_x_route || winning_o_route)
	const game_over = route_win || someone_has_played_all_their_pieces(board_state) || all_spaces_are_filled(board_state)

	return {
		game_over,
		winner: game_over ? get_winner({ board_state, owned_squares, winning_x_route, winning_o_route }) : null,
		owned_squares,
		winning_route: {
			x: winning_x_route,
			o: winning_o_route
		}
	}
}

type GetWinnerParams = {
	board_state: BoardState
	owned_squares: { x: number; o: number }
	winning_x_route: Coordinates[] | null
	winning_o_route: Coordinates[] | null
}

function get_winner({ owned_squares, winning_x_route, winning_o_route }: GetWinnerParams): Player | null {
	if (winning_x_route && winning_o_route) {
		return null
	} else if (winning_x_route) {
		return 'x'
	} else if (winning_o_route) {
		return 'o'
	} else {
		return get_winner_by_owned_squares(owned_squares)
	}
}

function all_spaces_are_filled(board_state: BoardState): boolean {
	return board_state.y.every(x => x.every(square => square.pieces.length > 0))
}

function get_winner_by_owned_squares(owned_squares: { x: number; o: number }): Player | null {
	if (owned_squares.x === owned_squares.o) {
		return null
	}

	return owned_squares.x > owned_squares.o ? 'x' : 'o'
}

function count_owned_squares(board_state: BoardState): { x: number; o: number } {
	const owned_squares = {
		x: 0,
		o: 0
	}
	board_state.y.forEach(row => {
		row.filter(square => !top_piece_of_square_is_capstone(square))
			.filter(square => !square.top_is_standing)
			.map(get_owner)
			.filter((owner): owner is Player => owner !== null)
			.forEach(owner => {
				owned_squares[owner]++
			})
	})

	return owned_squares
}

function someone_has_played_all_their_pieces(board_state: BoardState): boolean {
	function person_has_played_all(piece: Player): boolean {
		return board_state.pieces_in_hand[piece].pieces === 0 && board_state.pieces_in_hand[piece].capstones === 0
	}

	return person_has_played_all('x') || person_has_played_all('o')
}
