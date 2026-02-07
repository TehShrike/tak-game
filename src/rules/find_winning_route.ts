import get_square from '../board/get_square.ts'
import get_owner from '../board/get_owner.ts'
import type { BoardState, Axis, Player, Coordinates, Square } from '../types.ts'

type Step = {
	coordinates: Coordinates
	history: Record<string, boolean>
	route_so_far: Coordinates[]
}

export default function find_winning_route(board_state: BoardState, axis: Axis, player: Player): Coordinates[] | null {
	const starting_coordinates = range_of(board_state.size)
		.map(index => get_next({ x: 0, y: 0 }, other_axis(axis), index))
		.filter(coordinates => square_counts_toward_road_win(get_square(board_state, coordinates), player))

	const first_row_squares = starting_coordinates.reduce<Record<string, boolean>>(add_to_history, {})

	const solutions = starting_coordinates.map(starting_coordinate => {
		return recursive_find_route(board_state, axis, player, {
			route_so_far: [starting_coordinate],
			history: first_row_squares,
			coordinates: starting_coordinate
		})
	}).filter((solution): solution is Coordinates[] => Array.isArray(solution))

	return solutions.length > 0 ? solutions[0]! : null
}

function recursive_find_route(board_state: BoardState, axis: Axis, player: Player, initial_step: Step): Coordinates[] | null {
	const next_steps = get_next_steps(board_state, player, initial_step)

	if (next_steps.length === 0) {
		return null
	}

	const winning_steps = next_steps.filter(step => is_winning_step(board_state.size, axis, step))

	if (winning_steps.length > 0) {
		return winning_steps[0]!.route_so_far
	}

	const solutions = next_steps.map(step => recursive_find_route(board_state, axis, player, step))
		.filter((route): route is Coordinates[] => Array.isArray(route))

	return solutions.length > 0 ? solutions[0]! : null
}

function is_winning_step(board_size: number, axis: Axis, step: Step): boolean {
	return step.coordinates[axis] === board_size - 1
}

function square_counts_toward_road_win(square: Square, player: Player): boolean {
	return get_owner(square) === player
		&& !square.top_is_standing
}

function get_next_steps(board_state: BoardState, player: Player, { route_so_far, history, coordinates }: Step): Step[] {
	return get_adjacent_squares(coordinates, board_state.size)
		.filter(adjacent_coordinates => !has_visited(history, adjacent_coordinates))
		.map(coords => ({
			coordinates: coords,
			square: get_square(board_state, coords)
		}))
		.filter(({ square }) => square_counts_toward_road_win(square, player))
		.map(({ coordinates: coords }) => ({
			coordinates: coords,
			history: add_to_history(history, coords),
			route_so_far: route_so_far.concat(coords)
		}))
}

function get_adjacent_squares(coordinates: Coordinates, board_size: number): Coordinates[] {
	return [
		get_next(coordinates, 'x', 1),
		get_next(coordinates, 'y', 1),
		get_next(coordinates, 'x', -1),
		get_next(coordinates, 'y', -1)
	].filter(({ x, y }) => x >= 0 && y >= 0 && x < board_size && y < board_size)
}

function other_axis(axis: Axis): Axis {
	return axis === 'y' ? 'x' : 'y'
}

function range_of(n: number): number[] {
	const ary: number[] = []
	for (let i = 0; i < n; ++i) {
		ary.push(i)
	}
	return ary
}

function get_next({ x, y }: Coordinates, axis: Axis, increment: number = 1): Coordinates {
	const new_coordinates: Coordinates = { x, y }
	new_coordinates[axis] += increment
	return new_coordinates
}

function add_to_history(history: Record<string, boolean>, newly_visited_coordinates: Coordinates): Record<string, boolean> {
	const key = coordinates_to_key(newly_visited_coordinates)
	return {
		...history,
		[key]: true
	}
}

function has_visited(history: Record<string, boolean>, coordinates: Coordinates): boolean {
	return !!history[coordinates_to_key(coordinates)]
}

function coordinates_to_key({ x, y }: Coordinates): string {
	return x.toString() + '-' + y.toString()
}
