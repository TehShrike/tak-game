export type Player = 'x' | 'o'
export type Piece = 'x' | 'X' | 'o' | 'O'
export type Direction = '<' | '>' | '+' | '-'

export type Square = {
	top_is_standing: boolean
	pieces: Piece[]
}

export type PieceCount = {
	pieces: number
	capstones: number
}

export type BoardState = {
	size: number
	whose_turn: Player
	y: Square[][]
	pieces_in_hand: {
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
	direction: Direction
	drops: number[]
}

export type Move = PlaceMove | MoveMove

export type GameState = {
	game_over: boolean
	winner: Player | null
	owned_squares: {
		x: number
		o: number
	}
	winning_route: {
		x: Coordinates[] | null
		o: Coordinates[] | null
	}
}

export type MoveDetails = {
	coordinates: Coordinates
	first: boolean
	last: boolean
	pieces_being_dropped: Piece[]
}
