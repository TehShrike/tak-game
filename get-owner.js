module.exports = function getOwner(square) {
	if (square.pieces.length === 0) {
		return null
	}

	return square.pieces[square.pieces.length - 1].toLowerCase()
}
