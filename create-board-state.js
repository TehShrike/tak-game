const startingPiecesByBoardSize = require('./starting-piece-counts')

const emptySquare = Object.freeze({ topIsStanding: false, pieces: [] })

module.exports = function createBoardState(boardSize) {
	const startingPieces = startingPiecesByBoardSize(boardSize)

	return {
		size: boardSize,
		whoseTurn: 'x',
		piecesInHand: {
			x: startingPieces,
			o: startingPieces
		},
		y: boardOfEmptyRows(boardSize)
	}
}

function boardOfEmptyRows(boardSize) {
	return arrayOf(boardSize, () => rowOfEmptyPieces(boardSize))
}

function rowOfEmptyPieces(columnCount) {
	return arrayOf(columnCount, () => Object.assign({}, emptySquare))
}

function arrayOf(number, factory) {
	const ary = []

	for (let i = 0; i < number; ++i) {
		ary.push(factory())
	}

	return ary
}
