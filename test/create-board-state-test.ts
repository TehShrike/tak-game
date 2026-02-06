import { test } from 'node:test'
import assert from 'node:assert'
import createBoardState from '../create-board-state.ts'

test('Create an empty board of size 4', () => {
	const expected = {
		size: 4,
		whoseTurn: 'x' as const,
		y: [
			[
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			]
		],
		piecesInHand: {
			x: { pieces: 15, capstones: 0 },
			o: { pieces: 15, capstones: 0 }
		}
	}

	const output = createBoardState(4)

	assert.deepStrictEqual(expected, output)
})

test('Create an empty board of size 5', () => {
	const expected = {
		size: 5,
		whoseTurn: 'x' as const,
		y: [
			[
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			], [
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] },
				{ topIsStanding: false, pieces: [] }
			]
		],
		piecesInHand: {
			x: { pieces: 21, capstones: 1 },
			o: { pieces: 21, capstones: 1 }
		}
	}

	const output = createBoardState(5)

	assert.deepStrictEqual(output, expected)
})

test('Correct piece counts at different board sizes', () => {
	function testCreation(boardSize: number, expectedPieces: number, expectedCapstones: number) {
		const boardState = createBoardState(boardSize)

		assert.strictEqual(boardState.piecesInHand.x.pieces, expectedPieces, `Correct number of pieces for X at board size ${boardSize}`)
		assert.strictEqual(boardState.piecesInHand.o.pieces, expectedPieces, `Correct number of pieces for O at board size ${boardSize}`)

		assert.strictEqual(boardState.piecesInHand.x.capstones, expectedCapstones, `Correct number of capstones for X at board size ${boardSize}`)
		assert.strictEqual(boardState.piecesInHand.o.capstones, expectedCapstones, `Correct number of capstones for O at board size ${boardSize}`)
	}

	testCreation(3, 10, 0)
	testCreation(4, 15, 0)
	testCreation(5, 21, 1)
	testCreation(6, 30, 1)
	testCreation(7, 40, 1)
	testCreation(8, 50, 2)
})
