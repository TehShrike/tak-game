export type Player = 'x' | 'o'
export type Piece = 'x' | 'X' | 'o' | 'O'
export type Axis = 'x' | 'y'
export type Direction = '+' | '-'

export type Square = {
	topIsStanding: boolean
	pieces: Piece[]
}

export type PieceCount = {
	pieces: number
	capstones: number
}

export type BoardState = {
	size: number
	whoseTurn: Player
	y: Square[][]
	piecesInHand: {
		x: PieceCount
		o: PieceCount
	}
}

export type Coordinates = {
	x: number
	y: number
}

export type PlaceMove = {
	type: 'PLACE'
	x: number
	y: number
	piece: Piece
	standing: boolean
}

export type MoveMove = {
	type: 'MOVE'
	x: number
	y: number
	axis: Axis
	direction: Direction
	drops: number[]
}

export type Move = PlaceMove | MoveMove

export type GameState = {
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

export type MoveDetails = {
	coordinates: Coordinates
	first: boolean
	last: boolean
	piecesBeingDropped: Piece[]
}
