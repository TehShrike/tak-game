const turnYCoordinateIntoArrayIndex = require('./y-index')
const immutableUpdate = require('immutability-helper')

module.exports = function getSquare(boardState, { x, y }) {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	return boardState.y[yIndex][x]
}

module.exports.modify = function modifySquare(boardState, { x, y }, change) {
	const yIndex = turnYCoordinateIntoArrayIndex(boardState, y)
	return immutableUpdate(boardState, {
		y: {
			[yIndex]: {
				[x]: change
			}
		}
	})
}