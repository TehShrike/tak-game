const test = require('tape')
const createBoardState = require('../create-board-state')

test('Create an empty board of size 4', t => {
	const expected = {
		size: 4,
		whoseTurn: 'x',
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

	t.deepEqual(expected, output)
	t.end()
})

test('Create an empty board of size 5', t => {
	const expected = {
		size: 5,
		whoseTurn: 'x',
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

	t.deepEqual(output, expected)
	t.end()
})

test('Correct piece counts at different board sizes', t => {
	function testCreation(boardSize, expectedPieces, expectedCapstones) {
		const boardState = createBoardState(boardSize)

		t.equal(boardState.piecesInHand.x.pieces, expectedPieces, `Correct number of pieces for X at board size ${boardSize}`)
		t.equal(boardState.piecesInHand.o.pieces, expectedPieces, `Correct number of pieces for O at board size ${boardSize}`)

		t.equal(boardState.piecesInHand.x.capstones, expectedCapstones, `Correct number of capstones for X at board size ${boardSize}`)
		t.equal(boardState.piecesInHand.o.capstones, expectedCapstones, `Correct number of capstones for O at board size ${boardSize}`)
	}

	testCreation(3, 10, 0)
	testCreation(4, 15, 0)
	testCreation(5, 21, 1)
	testCreation(6, 30, 1)
	testCreation(7, 40, 1)
	testCreation(8, 50, 2)

	t.end()
})
