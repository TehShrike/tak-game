const makeReducer = require('create-redux-reducer-from-map')
const immutableUpdate = require('immutability-helper')
const turnYCoordinateIntoArrayIndex = require('./y-index')
const getSquare = require('./get-square')

module.exports = makeReducer({
    PLACE: applyPlace,
    MOVE: applyMove
})

function applyPlace(boardState, move) {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, move.y)
	const pieceKey = isCapstone(move.piece) ? 'capstones' : 'pieces'

	return immutableUpdate(boardState, {
		y: {
			[yIndex]: {
				[move.x]: {
					pieces: {
						$push: [move.piece]
					},
					topIsStanding: {
						$set: !!move.standing
					}
				}
			}
		},
		piecesInHand: {
			[move.piece.toLowerCase()]: {
				[pieceKey]: {
					$apply: current => current - 1
				}
			}
		}
	})
}

// TOASSERT: only the first in the move list can be 0
// TOASSERT: no standing blocks or capstones in the path
// TOASSERT: no moving stacks off the edge of the board
// TOASSERT: moving exactly as many stones as could be picked up
// TOASSERT: only axis x and y are valid
// TOASSERT: only direction - and + are valid
// TOASSERT: must drop on >1 square
// TOASSERT: capstone can only move onto a standing stone if it is the only piece being dropped there
function applyMove(boardState, move) {
	const startingSquare = getSquare(boardState, move)
	const toPickUp = Math.min(boardState.size, startingSquare.pieces.length)

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

	return move.drops.reduce((boardState, numberOfPiecesToDrop, offset) => {
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

	}, newBoardState)
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
