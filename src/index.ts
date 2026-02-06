export { default as moveIsValid } from './move-is-valid.ts'
export { default as moveReducer } from './move-reducer.ts'
export { default as gameState } from './game-state.ts'
export { default as createBoardState } from './create-board-state.ts'

export type {
	Player,
	Piece,
	Axis,
	Direction,
	Square,
	PieceCount,
	BoardState,
	Coordinates,
	PlaceMove,
	MoveMove,
	Move,
	GameState,
	MoveDetails
} from './types.ts'
