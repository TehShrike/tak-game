const validPiece = require('./valid-piece')

function defaultStartingPiecesByBoardSize(boardSize) {
	switch (boardSize) {
		case 3:
			return { pieces: 10, capstones: 0 }
		case 4:
			return { pieces: 15, capstones: 0 }
		case 5:
			return { pieces: 21, capstones: 1 }
		case 6:
			return { pieces: 30, capstones: 1 }
		case 7:
			return { pieces: 40, capstones: 1 }
		default:
		case 8:
			return { pieces: 50, capstones: 2 }
	}
}

module.exports = function parsePosition(positionString, whoseTurn = 'x') {
	const rows = positionString.trim().split('\n')
	const size = rows.length
	const { pieces: startingPieces, capstones: startingCapstones } = defaultStartingPiecesByBoardSize(size)
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

	return {
		size,
		whoseTurn,
		y: rowStructure,
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
