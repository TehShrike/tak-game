import valid_piece from '../rules/valid_piece.ts'
import starting_pieces_by_board_size from '../rules/starting_piece_counts.ts'
import type { BoardState, Player, Piece, Square } from '../types.ts'

type PieceCounts = {
	x: number
	X: number
	o: number
	O: number
}

function set_piece_counts({ size, whose_turn, y }: { size: number; whose_turn: Player; y: Square[][] }, piece_counts: PieceCounts): BoardState {
	return {
		size,
		whose_turn,
		y,
		pieces_in_hand: {
			x: {
				pieces: piece_counts.x,
				capstones: piece_counts.X
			},
			o: {
				pieces: piece_counts.o,
				capstones: piece_counts.O
			}
		}
	}
}

function parse_position(position_string: string, whose_turn: Player = 'x'): BoardState {
	const rows = position_string.trim().split('\n')
	const size = rows.length
	const { pieces: starting_pieces, capstones: starting_capstones } = starting_pieces_by_board_size(size)
	const piece_counts: PieceCounts = {
		x: starting_pieces,
		X: starting_capstones,
		o: starting_pieces,
		O: starting_capstones
	}

	const row_structure: Square[][] = rows.map(column => {
		const spaces = column.split('|')
		if (spaces.length !== size) {
			throw new Error(`Wrong number of spaces in row, should have been ${size} but was ${spaces.length}`)
		}
		return spaces.map(space => {
			const row_characters = space.trim().split('')
			const pieces = row_characters.filter((c): c is Piece => valid_piece(c))
			pieces.forEach(piece => piece_counts[piece]--)
			return {
				top_is_standing: row_characters.length > 1 && row_characters[row_characters.length - 1] === '^',
				pieces
			}
		})
	})

	return set_piece_counts({
		size,
		whose_turn,
		y: row_structure
	}, piece_counts)
}

parse_position.pieces = set_piece_counts

export default parse_position
