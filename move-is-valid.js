const validPiece = require('./valid-piece')
const getSquare = require('./get-square')
const getPiecesPickedUpFromSquare = require('./pieces-picked-up-from-square')
const assertTypes = require('./assert-types')

const validityChecks = {
	PLACE: placeIsValid,
	MOVE: moveIsValid
}

module.exports = function moveIsValid(boardState, move) {
	if (validityChecks[move.type]) {
		return validityChecks[move.type](boardState, move)
	}

	return false
}

function placeIsValid(boardState, move) {
	assertTypes.place(move)

	const correctPlayersTurn = move.piece.toLowerCase() === boardState.whoseTurn

	return correctPlayersTurn
		&& notAStandingCapstone(move)
		&& validPiece(move.piece)
		&& getSquare(boardState, move).pieces.length === 0
}

function notAStandingCapstone(move) {
	return !(/[XO]/.test(move.piece) && move.standing)
}


function moveIsValid(boardState, move) {
	assertTypes.move(move)

	const startingSquare = getSquare(boardState, move)


	return squareIsOwnedBy(startingSquare, boardState.whoseTurn)
		&& correctDropAmounts(boardState, move)
		&& dropsAddUpToPickedUp(boardState, move)
		&& allDropsStayOnTheBoard(boardState, move)
}

function correctDropAmounts(boardState, move) {
	return move.drops.length > 1
		&& move.drops.slice(1).every(dropped => dropped > 0)
}

function allDropsStayOnTheBoard(boardState, move) {
	const startingCoordinate = move[move.axis]
	const moveSpaces = move.drops.length - 1
	const endingCoordinate = startingCoordinate + (move.direction === '+' ? moveSpaces : (-moveSpaces))
	return endingCoordinate >= 0 && endingCoordinate < boardState.size
}

function dropsAddUpToPickedUp(boardState, move) {
	const pickedUpCount = getPiecesPickedUpFromSquare(boardState, move)
	return move.drops.reduce((total, drop) => total + drop) === pickedUpCount
}

function squareIsOwnedBy(square, owner) {
	return square.pieces.length > 0
		&& square.pieces[square.pieces.length - 1].toLowerCase() === owner
}
