const isValidPiece = require('./valid-piece')

function checkMoveTypes(move) {
	assertNumber(move, 'x')
	assertNumber(move, 'y')
	assertArrayOfNumbers(move, 'drops')
	assertValidAxis(move, 'axis')
	assertValidDirection(move, 'direction')
}

function checkPlaceTypes(move) {
	assertNumber(move, 'x')
	assertNumber(move, 'y')
	assertValidPiece(move, 'piece')
	assertBoolean(move, 'standing')
}

module.exports = {
	move: checkMoveTypes,
	place: checkPlaceTypes
}

function assertNumber(object, key) {
	if (typeof object[key] !== 'number') {
		throw new Error(`${key} (${object[key]}) must be a number`)
	}
}
function assertArrayOfNumbers(object, key) {
	if (!Array.isArray(object[key]) || !object[key].every(value => typeof value === 'number')) {
		throw new Error(`${key} (${object[key]}) must be an array of numbers`)
	}
}
function assertValidAxis(object, key) {
	if (object[key] !== 'x' && object[key] !== 'y') {
		throw new Error(`${key} (${object[key]}) is not a valid axis`)
	}
}
function assertValidDirection(object, key) {
	if (object[key] !== '-' && object[key] !== '+') {
		throw new Error(`${key} (${object[key]}) is not a valid direction`)
	}
}
function assertValidPiece(object, key) {
	if (!isValidPiece(object[key])) {
		throw new Error(`${key} (${object[key]}) is not a valid piece`)
	}
}
function assertBoolean(object, key) {
	if (object[key] !== true && object[key] !== false) {
		throw new Error(`${key} (${object[key]}) is not a valid boolean`)
	}
}
