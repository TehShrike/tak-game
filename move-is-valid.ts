import validPiece from './valid-piece.ts'
import getSquare from './get-square.ts'
import getPiecesPickedUpFromSquare from './pieces-picked-up-from-square.ts'
import * as assertTypes from './assert-types.ts'
import { map as moveMap } from './iterate-over-move-squares.ts'
import { topPieceOfSquare as topPieceIsCapstone, piece as isCapstone } from './is-capstone.ts'
import squareIsOwnedBy from './square-is-owned-by.ts'
import type { BoardState, Move, PlaceMove, MoveMove, Player } from './types.ts'

type ValidityCheck = (boardState: BoardState, move: Move) => boolean

const validityChecks: Record<string, ValidityCheck> = {
	PLACE: (boardState, move) => canPlace(boardState, move as PlaceMove),
	MOVE: (boardState, move) => canMove(boardState, move as MoveMove)
}

export default function moveIsValid(boardState: BoardState, move: Move): boolean {
	const check = validityChecks[move.type]
	if (check) {
		return check(boardState, move)
	}

	return false
}

function canPlace(boardState: BoardState, move: PlaceMove): boolean {
	assertTypes.place(move)

	const firstTurn = isFirstTurn(boardState)

	const correctPlayersTurn = move.piece.toLowerCase() === boardState.whoseTurn

	if (firstTurn) {
		return !correctPlayersTurn
	} else {
		return correctPlayersTurn
			&& hasPiecesLeft(boardState, move)
			&& notAStandingCapstone(move)
			&& validPiece(move.piece)
			&& getSquare(boardState, move).pieces.length === 0
	}
}

function isFirstTurn(boardState: BoardState): boolean {
	const piecesOnBoard = boardState.y.reduce((total, row) => {
		return total + row.reduce((t, square) => t + square.pieces.length, 0)
	}, 0)

	return piecesOnBoard <= 2
}

function hasPiecesLeft(boardState: BoardState, move: PlaceMove): boolean {
	const pieceCountKey = isCapstone(move.piece) ? 'capstones' : 'pieces'
	const piecesLeft = boardState.piecesInHand[move.piece.toLowerCase() as Player][pieceCountKey]
	return piecesLeft > 0
}

function notAStandingCapstone(move: PlaceMove): boolean {
	return !(/[XO]/.test(move.piece) && move.standing)
}


function canMove(boardState: BoardState, move: MoveMove): boolean {
	assertTypes.move(move)

	if (isFirstTurn(boardState)) {
		return false
	}

	const startingSquare = getSquare(boardState, move)

	return squareIsOwnedBy(startingSquare, boardState.whoseTurn)
		&& correctDropAmounts(move)
		&& dropsAddUpToPickedUp(boardState, move)
		&& allDropsStayOnTheBoard(boardState, move)
		&& doesNotHitABlockingPiece(boardState, move)
}

function correctDropAmounts(move: MoveMove): boolean {
	return move.drops.length > 1
		&& move.drops.slice(1).every(dropped => dropped > 0)
}

function allDropsStayOnTheBoard(boardState: BoardState, move: MoveMove): boolean {
	const startingCoordinate = move[move.axis]
	const moveSpaces = move.drops.length - 1
	const endingCoordinate = startingCoordinate + (move.direction === '+' ? moveSpaces : (-moveSpaces))
	return endingCoordinate >= 0 && endingCoordinate < boardState.size
}

function dropsAddUpToPickedUp(boardState: BoardState, move: MoveMove): boolean {
	const pickedUpCount = getPiecesPickedUpFromSquare(boardState, move)
	return move.drops.reduce((total, drop) => total + drop, 0) === pickedUpCount
}

interface PieceDeetz {
	capstone: boolean
	topIsStanding?: boolean
	standing?: boolean
	droppingOnlyACapstone?: boolean
}

function doesNotHitABlockingPiece(boardState: BoardState, move: MoveMove): boolean {
	return moveMap(boardState, move, ({ coordinates, first, piecesBeingDropped }): PieceDeetz => {
		if (first) {
			return {
				capstone: false,
				standing: false
			}
		} else {
			const square = getSquare(boardState, coordinates)
			const droppingOnlyACapstone = piecesBeingDropped.length === 1 && isCapstone(piecesBeingDropped[0]!)
			return {
				capstone: topPieceIsCapstone(square),
				topIsStanding: square.topIsStanding,
				droppingOnlyACapstone
			}
		}
	}).every(pieceDeetz => (!pieceDeetz.capstone && !pieceDeetz.topIsStanding) || (pieceDeetz.topIsStanding && pieceDeetz.droppingOnlyACapstone))
}
