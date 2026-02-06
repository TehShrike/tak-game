export type Player = 'x' | 'o'
export type Piece = 'x' | 'X' | 'o' | 'O'
export type Axis = 'x' | 'y'
export type Direction = '+' | '-'

export interface Square {
	topIsStanding: boolean
	pieces: Piece[]
}

export interface PieceCount {
	pieces: number
	capstones: number
}

export interface BoardState {
	size: number
	whoseTurn: Player
	y: Square[][]
	piecesInHand: {
		x: PieceCount
		o: PieceCount
	}
}

export interface Coordinates {
	x: number
	y: number
}

export interface PlaceMove {
	type: 'PLACE'
	x: number
	y: number
	piece: Piece
	standing: boolean
}

export interface MoveMove {
	type: 'MOVE'
	x: number
	y: number
	axis: Axis
	direction: Direction
	drops: number[]
}

export type Move = PlaceMove | MoveMove

export interface GameState {
	gameOver: boolean
	winner: Player | null
	ownedSquares: {
		x: number
		o: number
	}
	winningRoute: {
		x: Coordinates[] | null
		o: Coordinates[] | null
	}
}

export interface MoveDetails {
	coordinates: Coordinates
	first: boolean
	last: boolean
	piecesBeingDropped: Piece[]
}
