import is_valid_piece from './valid_piece.ts'
import type { MoveMove, PlaceMove } from '../types.ts'

export function move(m: unknown): asserts m is MoveMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assert_number(obj, 'x')
	assert_number(obj, 'y')
	assert_array_of_numbers(obj, 'drops')
	assert_valid_axis(obj, 'axis')
	assert_valid_direction(obj, 'direction')
}

export function place(m: unknown): asserts m is PlaceMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assert_number(obj, 'x')
	assert_number(obj, 'y')
	assert_valid_piece(obj, 'piece')
	assert_boolean(obj, 'standing')
}

function assert_number(object: Record<string, unknown>, key: string): void {
	if (typeof object[key] !== 'number') {
		throw new Error(`${key} (${object[key]}) must be a number`)
	}
}

function assert_array_of_numbers(object: Record<string, unknown>, key: string): void {
	const value = object[key]
	if (!Array.isArray(value) || !value.every(v => typeof v === 'number')) {
		throw new Error(`${key} (${value}) must be an array of numbers`)
	}
}

function assert_valid_axis(object: Record<string, unknown>, key: string): void {
	if (object[key] !== 'x' && object[key] !== 'y') {
		throw new Error(`${key} (${object[key]}) is not a valid axis`)
	}
}

function assert_valid_direction(object: Record<string, unknown>, key: string): void {
	if (object[key] !== '-' && object[key] !== '+') {
		throw new Error(`${key} (${object[key]}) is not a valid direction`)
	}
}

function assert_valid_piece(object: Record<string, unknown>, key: string): void {
	const value = object[key]
	if (typeof value !== 'string' || !is_valid_piece(value)) {
		throw new Error(`${key} (${value}) is not a valid piece`)
	}
}

function assert_boolean(object: Record<string, unknown>, key: string): void {
	if (object[key] !== true && object[key] !== false) {
		throw new Error(`${key} (${object[key]}) is not a valid boolean`)
	}
}
