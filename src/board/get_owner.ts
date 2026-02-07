import pieceToPlayer from '../rules/piece_to_player.ts'
import type { Player, Square } from '../types.ts'

export default function getOwner(square: Square): Player | null {
	if (square.pieces.length === 0) {
		return null
	}

	return pieceToPlayer(square.pieces[square.pieces.length - 1]!)
}
