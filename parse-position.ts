import validPiece from './valid-piece.ts'
import startingPiecesByBoardSize from './starting-piece-counts.ts'
import type { BoardState, Player, Piece, Square } from './types.ts'

interface PieceCounts {
	x: number
	X: number
	o: number
	O: number
}

function setPieceCounts({ size, whoseTurn, y }: { size: number; whoseTurn: Player; y: Square[][] }, pieceCounts: PieceCounts): BoardState {
	return {
		size,
		whoseTurn,
		y,
		piecesInHand: {
			x: {
				pieces: pieceCounts.x,
				capstones: pieceCounts.X
			},
			o: {
				pieces: pieceCounts.o,
				capstones: pieceCounts.O
			}
		}
	}
}

function parsePosition(positionString: string, whoseTurn: Player = 'x'): BoardState {
	const rows = positionString.trim().split('\n')
	const size = rows.length
	const { pieces: startingPieces, capstones: startingCapstones } = startingPiecesByBoardSize(size)
	const pieceCounts: PieceCounts = {
		x: startingPieces,
		X: startingCapstones,
		o: startingPieces,
		O: startingCapstones
	}

	const rowStructure: Square[][] = rows.map(column => {
		const spaces = column.split('|')
		if (spaces.length !== size) {
			throw new Error(`Wrong number of spaces in row, should have been ${size} but was ${spaces.length}`)
		}
		return spaces.map(space => {
			const rowCharacters = space.trim().split('')
			const pieces = rowCharacters.filter((c): c is Piece => validPiece(c))
			pieces.forEach(piece => pieceCounts[piece]--)
			return {
				topIsStanding: rowCharacters.length > 1 && rowCharacters[rowCharacters.length - 1] === '^',
				pieces
			}
		})
	})

	return setPieceCounts({
		size,
		whoseTurn,
		y: rowStructure
	}, pieceCounts)
}

parsePosition.pieces = setPieceCounts

export default parsePosition
