const { topPieceOfSquare: topPieceOfSquareIsCapstone } = require('./is-capstone')
const findWinningRoute = require('./find-winning-route')
const getOwner = require('./get-owner')

module.exports = function gameState(boardState) {

	const ownedSquares = countOwnedSquares(boardState)
	const winningXRoute = findWinningRoute(boardState, 'x', 'x') || findWinningRoute(boardState, 'y', 'x')
	const winningORoute = findWinningRoute(boardState, 'x', 'o') || findWinningRoute(boardState, 'y', 'o')
	const routeWin = winningXRoute || winningORoute
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

function getWinner({ boardState, ownedSquares, winningXRoute, winningORoute}) {
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

function allSpacesAreFilled(boardState) {
	return boardState.y.every(x => x.every(square => square.pieces.length > 0))
}

function getWinnerByOwnedSquares(ownedSquares) {
	if (ownedSquares.x === ownedSquares.o) {
		return null
	}

	return ownedSquares.x > ownedSquares.o ? 'x' : 'o'
}

function countOwnedSquares(boardState) {
	const ownedSquares = {
		x: 0,
		o: 0
	}
	boardState.y.forEach(x => {
		x.filter(square => !topPieceOfSquareIsCapstone(square))
		.filter(square => !square.topIsStanding)
		.map(getOwner)
		.filter(owner => owner !== null)
		.forEach(owner => {
			ownedSquares[owner]++
		})
	})

	return ownedSquares
}

function someoneHasPlayedAllTheirPieces(boardState) {
	function personHasPlayedAll(piece) {
		return boardState.piecesInHand[piece].pieces === 0 && boardState.piecesInHand[piece].capstones === 0
	}

	return personHasPlayedAll('x') || personHasPlayedAll('o')
}
