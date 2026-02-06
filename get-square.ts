import turnYCoordinateIntoArrayIndex from './y-index.ts'
import immutabilityHelper from 'immutability-helper'
import type { BoardState, Coordinates, Square } from './types.ts'
import type { Spec } from 'immutability-helper'

const update = immutabilityHelper as unknown as <T>(target: T, spec: Spec<T>) => T

export default function getSquare(boardState: BoardState, { x, y }: Coordinates): Square {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	return boardState.y[yIndex]![x]!
}

export function modify(boardState: BoardState, { x, y }: Coordinates, change: Spec<Square>): BoardState {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	return update(boardState, {
		y: {
			[yIndex]: {
				[x]: change
			}
		}
	})
}
