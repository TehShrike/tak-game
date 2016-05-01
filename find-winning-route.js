const getSquare = require('./get-square')
const extend = require('xtend')
const getOwner = require('./get-owner')

module.exports = function findWinningRoute(boardState, axis, player) {
	const startingCoordinates = rangeOf(boardState.size)
	.map(index => getNext({x: 0, y: 0}, otherAxis(axis), index))
	.filter(coordinates => squareCountsTowardRoadWin(getSquare(boardState, coordinates), player))

	const firstRowSquares = startingCoordinates.reduce(addToHistory, {})

	const solutions = startingCoordinates.map(startingCoordinate => {
		return recursiveFindRoute(boardState, axis, player, {
			routeSoFar: [ startingCoordinate ],
			history: firstRowSquares,
			coordinates: startingCoordinate
		})
	}).filter(solution => Array.isArray(solution))

	return solutions.length > 0 ? solutions[0] : null
}

function recursiveFindRoute(boardState, axis, player, initialStep) {
	const nextSteps = getNextSteps(boardState, player, initialStep)

	if (nextSteps.length === 0) {
		return null
	}

	const winningSteps = nextSteps.filter(step => isWinningStep(boardState.size, axis, step))

	if (winningSteps.length > 0) {
		return winningSteps[0].routeSoFar
	}

	const solutions = nextSteps.map(step => recursiveFindRoute(boardState, axis, player, step))
	.filter(route => Array.isArray(route))

	return solutions.length > 0 ? solutions[0] : null
}

function isWinningStep(boardSize, axis, step) {
	return step.coordinates[axis] === boardSize - 1
}

function squareCountsTowardRoadWin(square, player) {
	return getOwner(square) === player
		&& !square.topIsStanding
}

function getNextSteps(boardState, player, {routeSoFar, history, coordinates}) {
	return getAdjacentSquares(coordinates, boardState.size)
		.filter(adjacentCoordinates => !hasVisited(history, adjacentCoordinates))
		.map(coordinates => {
			return {
				coordinates,
				square: getSquare(boardState, coordinates)
			}
		})
		.filter(({ square }) => squareCountsTowardRoadWin(square, player))
		.map(({ coordinates }) => {
			return {
				coordinates,
				history: addToHistory(history, coordinates),
				routeSoFar: routeSoFar.concat(coordinates)
			}
		})
}

function getAdjacentSquares(coordinates, boardSize) {
	return [
		getNext(coordinates, 'x', 1),
		getNext(coordinates, 'y', 1),
		getNext(coordinates, 'x', -1),
		getNext(coordinates, 'y', -1)
	].filter(({x, y}) => x >= 0 && y >= 0 && x < boardSize && y < boardSize)
}

function otherAxis(axis) {
	return axis === 'y' ? 'x' : 'y'
}

function rangeOf(n) {
	const ary = []
	for (var i = 0; i < n; ++i) {
		ary.push(i)
	}
	return ary
}

function getNext({x, y}, axis, increment = 1) {
	const newCoordinates = {
		x,
		y
	}
	newCoordinates[axis] += increment
	return newCoordinates
}






function addToHistory(history, newlyVisitedCoordinates) {
	const key = coordinatesToKey(newlyVisitedCoordinates)
	return extend(history, {
		[key]: true
	})
}

function hasVisited(history, coordinates) {
	return history[coordinatesToKey(coordinates)]
}

function coordinatesToKey({ x, y }) {
	return x.toString() + '-' + y.toString()
}
