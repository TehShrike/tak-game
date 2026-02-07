import type { Piece, Square } from '../types.ts'

export function piece(p: Piece): boolean {
	return p.toUpperCase() === p
}

export function top_piece_of_square(square: Square): boolean {
	const pieces = square.pieces
	return pieces.length > 0
		&& piece(pieces[pieces.length - 1]!)
}
