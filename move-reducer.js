const makeReducer = require('create-redux-reducer-from-map')
const immutableUpdate = require('immutability-helper')
const getSquare = require('./get-square')
const getPiecesPickedUpFromSquare = require('./pieces-picked-up-from-square')
const reduceMove = require('./iterate-over-move-squares').reduce
const { piece: isCapstone } = require('./is-capstone')

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

function applyMove(initialBoardState, move) {
	const startingSquare = getSquare(initialBoardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(initialBoardState, move)

	const stateAfterSpreadingOutNewPieces = toggleWhoseTurn(reduceMove(initialBoardState, move, (boardState, { coordinates, last, piecesBeingDropped }) => {
		return getSquare.modify(boardState, coordinates, {
			pieces: {
				$push: piecesBeingDropped
			},
			topIsStanding: {
				$set: last && startingSquare.topIsStanding
			}
		})
	}))

	return pickUp(stateAfterSpreadingOutNewPieces, move, toPickUp)
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
