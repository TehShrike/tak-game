const validPiece = require('./valid-piece')
const getSquare = require('./get-square')
const getPiecesPickedUpFromSquare = require('./pieces-picked-up-from-square')
const assertTypes = require('./assert-types')
const moveMap = require('./iterate-over-move-squares').map
const { topPieceOfSquare: topPieceIsCapstone, piece: isCapstone } = require('./is-capstone')

const validityChecks = {
	PLACE: canPlace,
	MOVE: canMove
}

module.exports = function moveIsValid(boardState, move) {
	if (validityChecks[move.type]) {
		return validityChecks[move.type](boardState, move)
	}

	return false
}

function canPlace(boardState, move) {
	assertTypes.place(move)

	const firstTurn = isFirstTurn(boardState)

	const correctPlayersTurn = move.piece.toLowerCase() === boardState.whoseTurn

	if (firstTurn) {
		return !correctPlayersTurn
	} else {
		return correctPlayersTurn
			&& hasPiecesLeft(boardState, move)
			&& notAStandingCapstone(move)
			&& validPiece(move.piece)
			&& getSquare(boardState, move).pieces.length === 0
	}
}

function isFirstTurn(boardState) {
	const piecesOnBoard = boardState.y.reduce((total, x) => {
		return total + x.reduce((total, square) => total + square.pieces.length, 0)
	}, 0)

	return piecesOnBoard <= 2
}

function hasPiecesLeft(boardState, move) {
	const pieceCountKey = isCapstone(move.piece) ? 'capstones' : 'pieces'
	const piecesLeft = boardState.piecesInHand[move.piece.toLowerCase()][pieceCountKey]
	return piecesLeft > 0
}

function notAStandingCapstone(move) {
	return !(/[XO]/.test(move.piece) && move.standing)
}


function canMove(boardState, move) {
	assertTypes.move(move)

	if (isFirstTurn(boardState)) {
		return false
	}

	const startingSquare = getSquare(boardState, move)

	return squareIsOwnedBy(startingSquare, boardState.whoseTurn)
		&& correctDropAmounts(boardState, move)
		&& dropsAddUpToPickedUp(boardState, move)
		&& allDropsStayOnTheBoard(boardState, move)
		&& doesNotHitABlockingPiece(boardState, move)
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

function doesNotHitABlockingPiece(boardState, move) {
	return moveMap(boardState, move, ({ coordinates, first, piecesBeingDropped }) => {
		if (first) {
			return {
				capstone: false,
				standing: false
			}
		} else {
			const square = getSquare(boardState, coordinates)
			const droppingOnlyACapstone = piecesBeingDropped.length === 1 && isCapstone(piecesBeingDropped[0])
			return {
				capstone: topPieceIsCapstone(square),
				topIsStanding: square.topIsStanding,
				droppingOnlyACapstone
			}
		}
	}).every(pieceDeetz => (!pieceDeetz.capstone && !pieceDeetz.topIsStanding) || (pieceDeetz.topIsStanding && pieceDeetz.droppingOnlyACapstone))
}

