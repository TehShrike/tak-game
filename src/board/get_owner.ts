import piece_to_player from '../rules/piece_to_player.ts'
import type { Player, Square } from '../types.ts'

export default function get_owner(square: Square): Player | null {
	if (square.pieces.length === 0) {
		return null
	}

	return piece_to_player(square.pieces[square.pieces.length - 1]!)
}
