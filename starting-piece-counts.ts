import type { PieceCount } from './types.ts'

export default function defaultStartingPiecesByBoardSize(boardSize: number): PieceCount {
	switch (boardSize) {
	case 3:
		return { pieces: 10, capstones: 0 }
	case 4:
		return { pieces: 15, capstones: 0 }
	case 5:
		return { pieces: 21, capstones: 1 }
	case 6:
		return { pieces: 30, capstones: 1 }
	case 7:
		return { pieces: 40, capstones: 1 }
	default:
	case 8:
		return { pieces: 50, capstones: 2 }
	}
}
