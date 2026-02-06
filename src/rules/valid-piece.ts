import type { Piece } from '../types.ts'

export default function validPiece(piece: string): piece is Piece {
	return /^[xXoO]$/.test(piece)
}
