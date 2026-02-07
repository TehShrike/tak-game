import type { Player, Square } from '../types.ts'

export default function square_is_owned_by(square: Square, owner: Player): boolean {
	return square.pieces.length > 0
		&& square.pieces[square.pieces.length - 1]!.toLowerCase() === owner
}
