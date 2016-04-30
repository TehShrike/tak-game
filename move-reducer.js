const makeReducer = require('create-redux-reducer-from-map')
const immutableUpdate = require('immutability-helper')
const getSquare = require('./get-square')
const getPiecesPickedUpFromSquare = require('./pieces-picked-up-from-square')

module.exports = makeReducer({
    PLACE: applyPlace,
    MOVE: applyMove
})

function applyPlace(boardState, move) {
	const pieceKey = isCapstone(move.piece) ? 'capstones' : 'pieces'

	const afterUpdatingSquare = getSquare.modify(boardState, move, {
		pieces: {
			$push: [move.piece]
		},
		topIsStanding: {
			$set: !!move.standing
		}
	})
	return toggleWhoseTurn(immutableUpdate(afterUpdatingSquare, {
		piecesInHand: {
			[move.piece.toLowerCase()]: {
				[pieceKey]: {
					$apply: current => current - 1
				}
			}
		}
	}))
}

function applyMove(boardState, move) {
	const startingSquare = getSquare(boardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(boardState, move)

	// mutability warning: only ok because the array contains primitives
	const stackToMove = startingSquare.pieces.slice(-toPickUp)

	const newBoardState = pickUp(boardState, move, toPickUp)

	function adjust(current, offset) {
		return current + (move.direction === '+' ? offset : (-offset))
	}

	function getNextSquareCoordinates(offset) {
		const coordinates = {
			x: move.x,
			y: move.y
		}
		coordinates[move.axis] = adjust(coordinates[move.axis], offset)
		return coordinates
	}

	return toggleWhoseTurn(move.drops.reduce((boardState, numberOfPiecesToDrop, offset) => {
		const currentSquareCoordinates = getNextSquareCoordinates(offset)
		const piecesBeingDropped = stackToMove.splice(0, numberOfPiecesToDrop)
		const lastDrop = offset === move.drops.length - 1

		return getSquare.modify(boardState, currentSquareCoordinates, {
			pieces: {
				$push: piecesBeingDropped
			},
			topIsStanding: {
				$set: lastDrop && startingSquare.topIsStanding
			}
		})

	}, newBoardState))
}

function isCapstone(piece) {
	return piece.toUpperCase() === piece
}

function pickUp(boardState, coordinates, toPickUp) {
	return getSquare.modify(boardState, coordinates, {
		pieces: {
			$splice: [[-toPickUp, toPickUp]]
		}
	})
}

function toggleWhoseTurn(boardState) {
	return immutableUpdate(boardState, {
		whoseTurn: {
			$apply: player => player === 'x' ? 'o' : 'x'
		}
	})
}
