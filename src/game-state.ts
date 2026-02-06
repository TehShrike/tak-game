import { topPieceOfSquare as topPieceOfSquareIsCapstone } from './rules/is-capstone.ts'
import findWinningRoute from './rules/find-winning-route.ts'
import getOwner from './board/get-owner.ts'
import type { BoardState, GameState, Player, Coordinates } from './types.ts'

export default function gameState(boardState: BoardState): GameState {
	const ownedSquares = countOwnedSquares(boardState)
	const winningXRoute = findWinningRoute(boardState, 'x', 'x') || findWinningRoute(boardState, 'y', 'x')
	const winningORoute = findWinningRoute(boardState, 'x', 'o') || findWinningRoute(boardState, 'y', 'o')
	const routeWin = !!(winningXRoute || winningORoute)
	const gameOver = routeWin || someoneHasPlayedAllTheirPieces(boardState) || allSpacesAreFilled(boardState)

	return {
		gameOver,
		winner: gameOver ? getWinner({ boardState, ownedSquares, winningXRoute, winningORoute }) : null,
		ownedSquares,
		winningRoute: {
			x: winningXRoute,
			o: winningORoute
		}
	}
}

interface GetWinnerParams {
	boardState: BoardState
	ownedSquares: { x: number; o: number }
	winningXRoute: Coordinates[] | null
	winningORoute: Coordinates[] | null
}

function getWinner({ ownedSquares, winningXRoute, winningORoute }: GetWinnerParams): Player | null {
	if (winningXRoute && winningORoute) {
		return null
	} else if (winningXRoute) {
		return 'x'
	} else if (winningORoute) {
		return 'o'
	} else {
		return getWinnerByOwnedSquares(ownedSquares)
	}
}

function allSpacesAreFilled(boardState: BoardState): boolean {
	return boardState.y.every(x => x.every(square => square.pieces.length > 0))
}

function getWinnerByOwnedSquares(ownedSquares: { x: number; o: number }): Player | null {
	if (ownedSquares.x === ownedSquares.o) {
		return null
	}

	return ownedSquares.x > ownedSquares.o ? 'x' : 'o'
}

function countOwnedSquares(boardState: BoardState): { x: number; o: number } {
	const ownedSquares = {
		x: 0,
		o: 0
	}
	boardState.y.forEach(row => {
		row.filter(square => !topPieceOfSquareIsCapstone(square))
			.filter(square => !square.topIsStanding)
			.map(getOwner)
			.filter((owner): owner is Player => owner !== null)
			.forEach(owner => {
				ownedSquares[owner]++
			})
	})

	return ownedSquares
}

function someoneHasPlayedAllTheirPieces(boardState: BoardState): boolean {
	function personHasPlayedAll(piece: Player): boolean {
		return boardState.piecesInHand[piece].pieces === 0 && boardState.piecesInHand[piece].capstones === 0
	}

	return personHasPlayedAll('x') || personHasPlayedAll('o')
}
