import pieceToPlayer from '../rules/piece-to-player.ts'
import type { Player, Square } from '../types.ts'

export default function getOwner(square: Square): Player | null {
	if (square.pieces.length === 0) {
		return null
	}

	return pieceToPlayer(square.pieces[square.pieces.length - 1]!)
}
