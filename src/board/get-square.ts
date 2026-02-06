import turnYCoordinateIntoArrayIndex from './y-index.ts'
import type { BoardState, Coordinates, Square, Piece } from '../types.ts'

export default function getSquare(boardState: BoardState, { x, y }: Coordinates): Square {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	return boardState.y[yIndex]![x]!
}

function updateSquare(boardState: BoardState, { x, y }: Coordinates, newSquare: Square): BoardState {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	const newRow = boardState.y[yIndex]!.map((sq, i) => i === x ? newSquare : sq)
	const newY = boardState.y.map((row, i) => i === yIndex ? newRow : row)

	return {
		...boardState,
		y: newY
	}
}

export function addPieces(boardState: BoardState, coordinates: Coordinates, pieces: Piece[], topIsStanding: boolean): BoardState {
	const oldSquare = getSquare(boardState, coordinates)
	const newSquare: Square = {
		pieces: [...oldSquare.pieces, ...pieces],
		topIsStanding
	}
	return updateSquare(boardState, coordinates, newSquare)
}

export function removePieces(boardState: BoardState, coordinates: Coordinates, count: number): BoardState {
	const oldSquare = getSquare(boardState, coordinates)
	const newSquare: Square = {
		pieces: oldSquare.pieces.slice(0, -count),
		topIsStanding: false
	}
	return updateSquare(boardState, coordinates, newSquare)
}
