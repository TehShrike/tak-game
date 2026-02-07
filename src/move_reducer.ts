import getSquare, { addPieces, removePieces } from './board/get_square.ts'
import getPiecesPickedUpFromSquare from './rules/pieces_picked_up_from_square.ts'
import { reduce as reduceMove } from './rules/iterate_over_move_squares.ts'
import { piece as isCapstone } from './rules/is_capstone.ts'
import pieceToPlayer from './rules/piece_to_player.ts'
import type { BoardState, Move, PlaceMove, MoveMove, Coordinates } from './types.ts'

export default function moveReducer(boardState: BoardState, move: Move): BoardState {
	if (move.type === 'PLACE') {
		return applyPlace(boardState, move)
	} else if (move.type === 'MOVE') {
		return applyMove(boardState, move)
	}
	// @ts-expect-error move.type is never at this point
	throw new Error(`Invalid move type: ${move.type}`)
}

function applyPlace(boardState: BoardState, move: PlaceMove): BoardState {
	const pieceKey = isCapstone(move.piece) ? 'capstones' : 'pieces'
	const player = pieceToPlayer(move.piece)

	const afterUpdatingSquare = addPieces(boardState, move, [move.piece], !!move.standing)

	return toggleWhoseTurn({
		...afterUpdatingSquare,
		piecesInHand: {
			...afterUpdatingSquare.piecesInHand,
			[player]: {
				...afterUpdatingSquare.piecesInHand[player],
				[pieceKey]: afterUpdatingSquare.piecesInHand[player][pieceKey] - 1
			}
		}
	})
}

function applyMove(initialBoardState: BoardState, move: MoveMove): BoardState {
	const startingSquare = getSquare(initialBoardState, move)
	const toPickUp = getPiecesPickedUpFromSquare(initialBoardState, move)

	const stateAfterSpreadingOutNewPieces = toggleWhoseTurn(reduceMove(initialBoardState, move, (boardState, { coordinates, last, piecesBeingDropped }) => {
		return addPieces(boardState, coordinates, piecesBeingDropped, last && startingSquare.topIsStanding)
	}, initialBoardState))

	return pickUp(stateAfterSpreadingOutNewPieces, move, toPickUp)
}


function pickUp(boardState: BoardState, coordinates: Coordinates, toPickUp: number): BoardState {
	return removePieces(boardState, coordinates, toPickUp)
}

function toggleWhoseTurn(boardState: BoardState): BoardState {
	return {
		...boardState,
		whoseTurn: boardState.whoseTurn === 'x' ? 'o' : 'x'
	}
}
