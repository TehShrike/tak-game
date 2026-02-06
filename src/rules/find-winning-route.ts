import getSquare from '../board/get-square.ts'
import getOwner from '../board/get-owner.ts'
import type { BoardState, Axis, Player, Coordinates, Square } from '../types.ts'

type Step = {
	coordinates: Coordinates
	history: Record<string, boolean>
	routeSoFar: Coordinates[]
}

export default function findWinningRoute(boardState: BoardState, axis: Axis, player: Player): Coordinates[] | null {
	const startingCoordinates = rangeOf(boardState.size)
		.map(index => getNext({ x: 0, y: 0 }, otherAxis(axis), index))
		.filter(coordinates => squareCountsTowardRoadWin(getSquare(boardState, coordinates), player))

	const firstRowSquares = startingCoordinates.reduce<Record<string, boolean>>(addToHistory, {})

	const solutions = startingCoordinates.map(startingCoordinate => {
		return recursiveFindRoute(boardState, axis, player, {
			routeSoFar: [startingCoordinate],
			history: firstRowSquares,
			coordinates: startingCoordinate
		})
	}).filter((solution): solution is Coordinates[] => Array.isArray(solution))

	return solutions.length > 0 ? solutions[0]! : null
}

function recursiveFindRoute(boardState: BoardState, axis: Axis, player: Player, initialStep: Step): Coordinates[] | null {
	const nextSteps = getNextSteps(boardState, player, initialStep)

	if (nextSteps.length === 0) {
		return null
	}

	const winningSteps = nextSteps.filter(step => isWinningStep(boardState.size, axis, step))

	if (winningSteps.length > 0) {
		return winningSteps[0]!.routeSoFar
	}

	const solutions = nextSteps.map(step => recursiveFindRoute(boardState, axis, player, step))
		.filter((route): route is Coordinates[] => Array.isArray(route))

	return solutions.length > 0 ? solutions[0]! : null
}

function isWinningStep(boardSize: number, axis: Axis, step: Step): boolean {
	return step.coordinates[axis] === boardSize - 1
}

function squareCountsTowardRoadWin(square: Square, player: Player): boolean {
	return getOwner(square) === player
		&& !square.topIsStanding
}

function getNextSteps(boardState: BoardState, player: Player, { routeSoFar, history, coordinates }: Step): Step[] {
	return getAdjacentSquares(coordinates, boardState.size)
		.filter(adjacentCoordinates => !hasVisited(history, adjacentCoordinates))
		.map(coords => ({
			coordinates: coords,
			square: getSquare(boardState, coords)
		}))
		.filter(({ square }) => squareCountsTowardRoadWin(square, player))
		.map(({ coordinates: coords }) => ({
			coordinates: coords,
			history: addToHistory(history, coords),
			routeSoFar: routeSoFar.concat(coords)
		}))
}

function getAdjacentSquares(coordinates: Coordinates, boardSize: number): Coordinates[] {
	return [
		getNext(coordinates, 'x', 1),
		getNext(coordinates, 'y', 1),
		getNext(coordinates, 'x', -1),
		getNext(coordinates, 'y', -1)
	].filter(({ x, y }) => x >= 0 && y >= 0 && x < boardSize && y < boardSize)
}

function otherAxis(axis: Axis): Axis {
	return axis === 'y' ? 'x' : 'y'
}

function rangeOf(n: number): number[] {
	const ary: number[] = []
	for (let i = 0; i < n; ++i) {
		ary.push(i)
	}
	return ary
}

function getNext({ x, y }: Coordinates, axis: Axis, increment: number = 1): Coordinates {
	const newCoordinates: Coordinates = { x, y }
	newCoordinates[axis] += increment
	return newCoordinates
}

function addToHistory(history: Record<string, boolean>, newlyVisitedCoordinates: Coordinates): Record<string, boolean> {
	const key = coordinatesToKey(newlyVisitedCoordinates)
	return {
		...history,
		[key]: true
	}
}

function hasVisited(history: Record<string, boolean>, coordinates: Coordinates): boolean {
	return !!history[coordinatesToKey(coordinates)]
}

function coordinatesToKey({ x, y }: Coordinates): string {
	return x.toString() + '-' + y.toString()
}
