const validPiece = require('./valid-piece')
const getSquare = require('./get-square')

const validityChecks = {
	PLACE: placeIsValid
}

module.exports = function moveIsValid(boardState, move) {
	if (validityChecks[move.type]) {
		return validityChecks[move.type](boardState, move)
	}

	return false
}

function placeIsValid(boardState, move) {
	return notAStandingCapstone(move)
		&& validPiece(move.piece)
		&& getSquare(boardState, move).pieces.length === 0
}

function notAStandingCapstone(move) {
	return !(/[XO]/.test(move.piece) && move.standing)
}
