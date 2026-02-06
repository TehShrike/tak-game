import getPiecesPickedUpFromSquare from './pieces-picked-up-from-square.ts'
import getSquare from './get-square.ts'
import type { BoardState, MoveMove, MoveDetails, Piece } from './types.ts'

// non-obvious caveat: you can't call these functions after picking
// up the stack from the original spot

function moveDetails(startingBoardState: BoardState, move: MoveMove): (numberOfPiecesToDrop: number, offset: number) => MoveDetails {
	const startingSquare = getSquare(startingBoardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(startingBoardState, move)

	// mutability warning: only ok because the array contains primitives
	const stackToMove = startingSquare.pieces.slice(-toPickUp) as Piece[]

	function adjust(current: number, offset: number): number {
		return current + (move.direction === '+' ? offset : (-offset))
	}

	function getNextSquareCoordinates(offset: number): { x: number; y: number } {
		const coordinates = {
			x: move.x,
			y: move.y
		}
		coordinates[move.axis] = adjust(coordinates[move.axis], offset)
		return coordinates
	}

	return function(numberOfPiecesToDrop: number, offset: number): MoveDetails {
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

export function reduce<T>(startingBoardState: BoardState, move: MoveMove, fn: (acc: T, details: MoveDetails) => T, initial: T): T {
	const getDetails = moveDetails(startingBoardState, move)
	return move.drops.reduce((acc: T, numberOfPiecesToDrop: number, offset: number) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		return fn(acc, details)
	}, initial)
}

export function forEach(startingBoardState: BoardState, move: MoveMove, fn: (details: MoveDetails) => void): void {
	const getDetails = moveDetails(startingBoardState, move)
	move.drops.forEach((numberOfPiecesToDrop: number, offset: number) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		fn(details)
	})
}

export function map<T>(startingBoardState: BoardState, move: MoveMove, fn: (details: MoveDetails) => T): T[] {
	const getDetails = moveDetails(startingBoardState, move)
	return move.drops.map((numberOfPiecesToDrop: number, offset: number) => {
		const details = getDetails(numberOfPiecesToDrop, offset)
		return fn(details)
	})
}
