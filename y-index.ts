import type { BoardState } from './types.ts'

export default function turnYCoordinateIntoArrayIndex(boardState: BoardState, y: number): number {
	return boardState.size - y - 1
}
