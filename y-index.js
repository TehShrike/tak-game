module.exports = function turnYCoordinateIntoArrayIndex(boardState, y) {
	return boardState.size - y - 1
}
