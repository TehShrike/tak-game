module.exports = function squareIsOwnedBy(square, owner) {
	return square.pieces.length > 0
		&& square.pieces[square.pieces.length - 1].toLowerCase() === owner
}
