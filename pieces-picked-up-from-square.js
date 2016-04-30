const getSquare = require('./get-square')

module.exports = function numberOfPiecesPickedUp(boardState, coordinates) {
	const square = getSquare(boardState, coordinates)
	return Math.min(boardState.size, square.pieces.length)
}
