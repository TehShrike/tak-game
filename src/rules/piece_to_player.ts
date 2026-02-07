import type { Piece, Player } from '../types.ts'

const piece_to_player_map: Record<Piece, Player> = { x: 'x', X: 'x', o: 'o', O: 'o' }

export default function piece_to_player(piece: Piece): Player {
	return piece_to_player_map[piece]
}
