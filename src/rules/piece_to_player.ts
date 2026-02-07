import type { Piece, Player } from '../types.ts'

const pieceToPlayerMap: Record<Piece, Player> = { x: 'x', X: 'x', o: 'o', O: 'o' }

export default function pieceToPlayer(piece: Piece): Player {
	return pieceToPlayerMap[piece]
}
