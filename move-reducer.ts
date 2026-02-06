import immutabilityHelper from 'immutability-helper'
import type { Spec } from 'immutability-helper'

const update = immutabilityHelper as unknown as <T>(target: T, spec: Spec<T>) => T
import getSquare, { modify as modifySquare } from './get-square.ts'
import getPiecesPickedUpFromSquare from './pieces-picked-up-from-square.ts'
import { reduce as reduceMove } from './iterate-over-move-squares.ts'
import { piece as isCapstone } from './is-capstone.ts'
import type { BoardState, Move, PlaceMove, MoveMove, Player, Coordinates } from './types.ts'

const handlers: Record<string, (boardState: BoardState, move: Move) => BoardState> = {
	PLACE: (boardState, move) => applyPlace(boardState, move as PlaceMove),
	MOVE: (boardState, move) => applyMove(boardState, move as MoveMove)
}

export default function moveReducer(boardState: BoardState, move: Move): BoardState {
	const handler = handlers[move.type]
	if (handler) {
		return handler(boardState, move)
	}
	return boardState
}

function applyPlace(boardState: BoardState, move: PlaceMove): BoardState {
	const pieceKey = isCapstone(move.piece) ? 'capstones' : 'pieces'

	const afterUpdatingSquare = modifySquare(boardState, move, {
		pieces: {
			$push: [move.piece]
		},
		topIsStanding: {
			$set: !!move.standing
		}
	})
	return toggleWhoseTurn(update(afterUpdatingSquare, {
		piecesInHand: {
			[move.piece.toLowerCase()]: {
				[pieceKey]: {
					$apply: (current: number) => current - 1
				}
			}
		}
	}))
}

function applyMove(initialBoardState: BoardState, move: MoveMove): BoardState {
	const startingSquare = getSquare(initialBoardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(initialBoardState, move)

	const stateAfterSpreadingOutNewPieces = toggleWhoseTurn(reduceMove(initialBoardState, move, (boardState, { coordinates, last, piecesBeingDropped }) => {
		return modifySquare(boardState, coordinates, {
			pieces: {
				$push: piecesBeingDropped
			},
			topIsStanding: {
				$set: last && startingSquare.topIsStanding
			}
		})
	}, initialBoardState))

	return pickUp(stateAfterSpreadingOutNewPieces, move, toPickUp)
}


function pickUp(boardState: BoardState, coordinates: Coordinates, toPickUp: number): BoardState {
	return modifySquare(boardState, coordinates, {
		pieces: {
			$splice: [[-(toPickUp), toPickUp]]
		}
	})
}

function toggleWhoseTurn(boardState: BoardState): BoardState {
	return update(boardState, {
		whoseTurn: {
			$apply: (player: Player) => player === 'x' ? 'o' : 'x'
		}
	})
}
