import type { Piece } from '../types.ts'

export default function valid_piece(piece: string): piece is Piece {
	return /^[xXoO]$/.test(piece)
}
