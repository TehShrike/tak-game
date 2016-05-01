const { topPieceOfSquare: topPieceOfSquareIsCapstone } = require('./is-capstone')

module.exports = function gameState(boardState) {

	const ownedSquares = countOwnedSquares(boardState)

	return {
		gameOver: someoneHasPlayedAllTheirPieces(boardState),
		winner: getWinnerByOwnedSquares(ownedSquares),
		ownedSquares
	}
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
		.filter(square => square.pieces.length > 0)
		.forEach(square => {
			const topPiece = square.pieces[square.pieces.length - 1]
			ownedSquares[topPiece]++
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
