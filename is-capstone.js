function isCapstone(piece) {
	return piece.toUpperCase() === piece
}

module.exports.piece = isCapstone


module.exports.topPieceOfSquare = function topPieceIsCapstone(square) {
	const pieces = square.pieces
	return pieces.length > 0
		&& isCapstone(pieces[pieces.length - 1])
}
