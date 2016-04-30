const getPiecesPickedUpFromSquare = require('./pieces-picked-up-from-square')
const getSquare = require('./get-square')

function moveDetails(startingBoardState, move) {
	const startingSquare = getSquare(startingBoardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(startingBoardState, move)

	// mutability warning: only ok because the array contains primitives
	const stackToMove = startingSquare.pieces.slice(-toPickUp)

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

	return function(numberOfPiecesToDrop, offset) {
		const currentSquareCoordinates = getNextSquareCoordinates(offset)
		const firstDrop = offset === 0
		const lastDrop = offset === move.drops.length - 1
		const piecesBeingDropped = stackToMove.splice(0, numberOfPiecesToDrop)

		return {
			coordinates: currentSquareCoordinates,
			first: firstDrop,
			last: lastDrop,
			piecesBeingDropped
		}
	}
}

function reduce(startingBoardState, move, fn) {
	const getDetails = moveDetails(startingBoardState, move)
	return move.drops.reduce((boardState, numberOfPiecesToDrop, offset) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		return fn(boardState, details)
	}, startingBoardState)
}

function forEach(startingBoardState, move, fn) {
	const getDetails = moveDetails(startingBoardState, move)
	return move.drops.forEach((numberOfPiecesToDrop, offset) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		fn(details)
	})
}

function map(startingBoardState, move, fn) {
	const getDetails = moveDetails(startingBoardState, move)
	return move.drops.map((numberOfPiecesToDrop, offset) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		return fn(details)
	})
}

module.exports = {
	reduce,
	forEach,
	map
}