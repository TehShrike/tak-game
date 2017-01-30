const validPiece = require('./valid-piece')
const startingPiecesByBoardSize = require('./starting-piece-counts')

function setPieceCounts({ size, whoseTurn, y }, pieceCounts) {
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

module.exports = function parsePosition(positionString, whoseTurn = 'x') {
	const rows = positionString.trim().split('\n')
	const size = rows.length
	const { pieces: startingPieces, capstones: startingCapstones } = startingPiecesByBoardSize(size)
	const pieceCounts = {
		x: startingPieces,
		X: startingCapstones,
		o: startingPieces,
		O: startingCapstones
	}

	const rowStructure = rows.map(column => {
		const spaces = column.split('|')
		if (spaces.length !== size) {
			throw new Error(`Wrong number of spaces in row, should have been ${size} but was ${spaces.length}`)
		}
		return spaces.map(space => {
			const rowCharacters = space.trim().split('')
			const pieces = rowCharacters.filter(validPiece)
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

module.exports.pieces = setPieceCounts
