const { test } = require('node:test')
const assert = require('node:assert')
const parsePosition = require('../parse-position')

function p(pieces = [], topIsStanding = false) {
	return { pieces, topIsStanding }
}

const x = 'x'
const o = 'o'
const X = 'X'
const O = 'O'

test('import 3x3 board', () => {
	const actual = parsePosition(`
		xxo^|x   |
		    |ooxO|x
		xo  |    |ox
	`, o)

	const expected = {
		size: 3,
		y: [
			[ p([ x, x, o ], true), p([ x ]), p() ],
			[ p(), p([ o, o, x, O ]), p([ x ]) ],
			[ p([ x, o ]), p(), p([ o, x ]) ]
		],
		piecesInHand: {
			x: {
				pieces: 10 - 7,
				capstones: 0
			},
			o: {
				pieces: 10 - 5,
				capstones: -1
			}
		},
		whoseTurn: 'o'
	}

	assert.deepStrictEqual(actual, expected)
})

test('import 4x4 board', () => {
	const actual = parsePosition(`
		    |xX  |
		    |oox^|xoX
		xo  |    |ox
	`)

	const expected = {
		size: 3,
		y: [
			[ p(), p([ x, X ]), p() ],
			[ p(), p([ o, o, x ], true), p([ x, o, X ]) ],
			[ p([ x, o ]), p(), p([ o, x ]) ]
		],
		piecesInHand: {
			x: {
				pieces: 10 - 5,
				capstones: -2
			},
			o: {
				pieces: 10 - 5,
				capstones: 0
			}
		},
		whoseTurn: 'x'
	}

	assert.deepStrictEqual(actual, expected)
})

test('throws on inconsistent rows', () => {
	assert.throws(function() {
		parsePosition(`
			x|o|x
			o|x|o
		`)
	}, /Wrong number/)
})
