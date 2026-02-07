import startingPiecesByBoardSize from './rules/starting_piece_counts.ts'
import type { BoardState, Square } from './types.ts'

const emptySquare: Readonly<Square> = Object.freeze({ topIsStanding: false, pieces: [] })

export default function createBoardState(boardSize: number): BoardState {
	const startingPieces = startingPiecesByBoardSize(boardSize)

	return {
		size: boardSize,
		whoseTurn: 'x',
		piecesInHand: {
			x: { ...startingPieces },
			o: { ...startingPieces }
		},
		y: boardOfEmptyRows(boardSize)
	}
}

function boardOfEmptyRows(boardSize: number): Square[][] {
	return arrayOf(boardSize, () => rowOfEmptyPieces(boardSize))
}

function rowOfEmptyPieces(columnCount: number): Square[] {
	return arrayOf(columnCount, () => ({ ...emptySquare, pieces: [] }))
}

function arrayOf<T>(number: number, factory: () => T): T[] {
	const ary: T[] = []

	for (let i = 0; i < number; ++i) {
		ary.push(factory())
	}

	return ary
}
