import { test } from 'node:test'
import assert from 'node:assert'
import p from './util/parse_position.ts'
import get_game_state from './game_state.ts'

test('game over when someone runs out of pieces', () => {
	const board_state = p(`
		xxx|ooo|xxx
		   |x  |
		   |ooo|
	`)

	const game_state = get_game_state(p.pieces(board_state, {
		x: 0,
		X: 0,
		o: 1,
		O: 0
	}))

	assert.strictEqual(game_state.game_over, true, 'game is over')
	assert.strictEqual(game_state.winner, 'x', 'x wins')
	assert.strictEqual(game_state.owned_squares.x, 3)
	assert.strictEqual(game_state.owned_squares.o, 2)
})

test(`The game's not over unless someone has used up all their pieces`, () => {
	const board_state = p(`
		x|oo|xx
		 |x |
		 |oo|
	`)

	function assert_not_over(pieces: { x: number; X: number; o: number; O: number }) {
		const game_state = get_game_state(p.pieces(board_state, pieces))

		assert.strictEqual(game_state.game_over, false)
	}

	assert_not_over({
		x: 1,
		X: 0,
		o: 1,
		O: 0
	})
	assert_not_over({
		x: 0,
		X: 1,
		o: 0,
		O: 1
	})
	assert_not_over({
		x: 1,
		X: 0,
		o: 0,
		O: 1
	})
	assert_not_over({
		x: 0,
		X: 1,
		o: 1,
		O: 0
	})
})

test('the game is over once all squares are filled: tie', () => {
	const board_state = p.pieces(p(`
		xo |oox |xo^ |x
		o  |x   |oxo |o
		xx |oo  |ox^ |x
		o  |xX  |o^  |ox
	`), {
		x: 1,
		o: 1,
		X: 1,
		O: 1
	})

	const game_state = get_game_state(board_state)

	assert.strictEqual(game_state.game_over, true, 'game is over')
	assert.strictEqual(game_state.winner, null, 'nobody wins')
	assert.strictEqual(game_state.owned_squares.x, 6)
	assert.strictEqual(game_state.owned_squares.o, 6)
})

test('the game is over once all squares are filled: x wins', () => {
	const board_state = p.pieces(p(`
		xo |oox |xo^ |x
		o  |x   |oxo |o
		xx |oo  |ox  |x
		o  |xX  |o^  |ox
	`), {
		x: 1,
		o: 1,
		X: 1,
		O: 1
	})

	const game_state = get_game_state(board_state)

	assert.strictEqual(game_state.game_over, true, 'game is over')
	assert.strictEqual(game_state.winner, 'x', 'x wins')
	assert.strictEqual(game_state.owned_squares.x, 7)
	assert.strictEqual(game_state.owned_squares.o, 6)
})

function xy(x: number, y: number) {
	return { x, y }
}

test('Win by vertical road', () => {
	const { winner, game_over, winning_route } = get_game_state(p(`
		 |  |xo|x
		x|xx|xO|
		o|o |o |x
		o|x |  |x
	`))

	assert.strictEqual(game_over, true, 'game is over')
	assert.strictEqual(winner, 'o')
	assert.deepStrictEqual(winning_route, {
		x: null,
		o: [xy(0,0), xy(0,1), xy(1,1), xy(2,1), xy(2,2), xy(2,3)]
	})
})

test('Win by horizontal road', () => {
	const { winner, game_over, winning_route } = get_game_state(p(`
		 |  |xo|o
		x|xX|ox|
		o|o |x |o
		o|x |x |x
	`))

	assert.strictEqual(game_over, true, 'game is over')
	assert.strictEqual(winner, 'x')
	assert.deepStrictEqual(winning_route, {
		x: [xy(0,2), xy(1,2), xy(2,2), xy(2,1), xy(2,0), xy(3,0)],
		o: null
	})
})

test('Tied winning routes', () => {
	const { winner, game_over, winning_route } = get_game_state(p(`
		o|o |xx|o
		x|xo|xo|o
		x|x |x^|x
		O|x |x |x
	`))

	assert.strictEqual(game_over, true, 'game is over')
	assert.strictEqual(winner, null)
	assert.deepStrictEqual(winning_route, {
		x: [xy(0,1), xy(1,1), xy(1,0), xy(2,0), xy(3,0)],
		o: [xy(0,3), xy(1,3), xy(1,2), xy(2,2), xy(3,2)]
	})
})

test('backtracking route on a 7x7 board', () => {
	const { winner, game_over, winning_route } = get_game_state(p(`
		o|o^|xx|X|  |o|
		x|xo|xo|o|o^|o|
		x|xo|x^|o|ox|o|
		O|xo|x |o|o |o|
		 |o |o | |  | |
		 |  |o | |xx| |
		 |  |o | |  | |
	`))

	assert.strictEqual(game_over, true, 'game is over')
	assert.strictEqual(winner, 'o')
	assert.deepStrictEqual(winning_route, {
		x: null,
		o: [xy(2,0), xy(2,1), xy(2,2), xy(1,2), xy(1,3), xy(1,4), xy(1,5), xy(2,5), xy(3,5), xy(3,4), xy(3,3), xy(4,3), xy(5,3), xy(5,4), xy(5,5), xy(5,6)]
	})
})
