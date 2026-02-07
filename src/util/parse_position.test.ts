import { test } from 'node:test'
import assert from 'node:assert'
import parse_position from './parse_position.ts'
import type { Piece, Square } from '../types.ts'

function sq(pieces: Piece[] = [], top_is_standing = false): Square {
	return { pieces, top_is_standing }
}

const x: Piece = 'x'
const o: Piece = 'o'
const X: Piece = 'X'
const O: Piece = 'O'

test('import 3x3 board', () => {
	const actual = parse_position(`
		xxo^|x   |
		    |ooxO|x
		xo  |    |ox
	`, 'o')

	const expected = {
		size: 3,
		y: [
			[ sq([ x, x, o ], true), sq([ x ]), sq() ],
			[ sq(), sq([ o, o, x, O ]), sq([ x ]) ],
			[ sq([ x, o ]), sq(), sq([ o, x ]) ]
		],
		pieces_in_hand: {
			x: {
				pieces: 10 - 7,
				capstones: 0
			},
			o: {
				pieces: 10 - 5,
				capstones: -1
			}
		},
		whose_turn: 'o' as const
	}

	assert.deepStrictEqual(actual, expected)
})

test('import 4x4 board', () => {
	const actual = parse_position(`
		    |xX  |
		    |oox^|xoX
		xo  |    |ox
	`)

	const expected = {
		size: 3,
		y: [
			[ sq(), sq([ x, X ]), sq() ],
			[ sq(), sq([ o, o, x ], true), sq([ x, o, X ]) ],
			[ sq([ x, o ]), sq(), sq([ o, x ]) ]
		],
		pieces_in_hand: {
			x: {
				pieces: 10 - 5,
				capstones: -2
			},
			o: {
				pieces: 10 - 5,
				capstones: 0
			}
		},
		whose_turn: 'x' as const
	}

	assert.deepStrictEqual(actual, expected)
})

test('throws on inconsistent rows', () => {
	assert.throws(function() {
		parse_position(`
			x|o|x
			o|x|o
		`)
	}, /Wrong number/)
})
