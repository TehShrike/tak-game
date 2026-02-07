import is_valid_piece from './valid_piece.ts'
import type { MoveMove, PlaceMove, Direction, Piece } from '../types.ts'

export function move(m: unknown): asserts m is MoveMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assert_number(obj.x, 'x')
	assert_number(obj.y, 'y')
	assert_array_of_numbers(obj.drops, 'drops')
	assert_valid_direction(obj.direction, 'direction')
}

export function place(m: unknown): asserts m is PlaceMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assert_number(obj.x, 'x')
	assert_number(obj.y, 'y')
	assert_valid_piece(obj.piece, 'piece')
	assert_boolean(obj.standing, 'standing')
}

function assert_number(value: unknown, name: string): asserts value is number {
	if (typeof value !== 'number') {
		throw new Error(`${name} (${value}) must be a number`)
	}
}

function assert_array_of_numbers(value: unknown, name: string): asserts value is number[] {
	if (!Array.isArray(value) || !value.every(v => typeof v === 'number')) {
		throw new Error(`${name} (${value}) must be an array of numbers`)
	}
}

function assert_valid_direction(value: unknown, name: string): asserts value is Direction {
	if (value !== '<' && value !== '>' && value !== '+' && value !== '-') {
		throw new Error(`${name} (${value}) is not a valid direction`)
	}
}

function assert_valid_piece(value: unknown, name: string): asserts value is Piece {
	if (typeof value !== 'string' || !is_valid_piece(value)) {
		throw new Error(`${name} (${value}) is not a valid piece`)
	}
}

function assert_boolean(value: unknown, name: string): asserts value is boolean {
	if (value !== true && value !== false) {
		throw new Error(`${name} (${value}) is not a valid boolean`)
	}
}
