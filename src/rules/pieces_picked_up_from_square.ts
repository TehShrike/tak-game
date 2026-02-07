import getSquare from '../board/get_square.ts'
import type { BoardState, Coordinates } from '../types.ts'

export default function numberOfPiecesPickedUp(boardState: BoardState, coordinates: Coordinates): number {
	const square = getSquare(boardState, coordinates)
	return Math.min(boardState.size, square.pieces.length)
}
