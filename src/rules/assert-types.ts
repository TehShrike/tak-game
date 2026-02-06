import isValidPiece from './valid-piece.ts'
import type { MoveMove, PlaceMove } from '../types.ts'

export function move(m: unknown): asserts m is MoveMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assertNumber(obj, 'x')
	assertNumber(obj, 'y')
	assertArrayOfNumbers(obj, 'drops')
	assertValidAxis(obj, 'axis')
	assertValidDirection(obj, 'direction')
}

export function place(m: unknown): asserts m is PlaceMove {
	if (typeof m !== 'object' || m === null) {
		throw new Error('Move must be an object')
	}
	const obj = m as Record<string, unknown>
	assertNumber(obj, 'x')
	assertNumber(obj, 'y')
	assertValidPiece(obj, 'piece')
	assertBoolean(obj, 'standing')
}

function assertNumber(object: Record<string, unknown>, key: string): void {
	if (typeof object[key] !== 'number') {
		throw new Error(`${key} (${object[key]}) must be a number`)
	}
}

function assertArrayOfNumbers(object: Record<string, unknown>, key: string): void {
	const value = object[key]
	if (!Array.isArray(value) || !value.every(v => typeof v === 'number')) {
		throw new Error(`${key} (${value}) must be an array of numbers`)
	}
}

function assertValidAxis(object: Record<string, unknown>, key: string): void {
	if (object[key] !== 'x' && object[key] !== 'y') {
		throw new Error(`${key} (${object[key]}) is not a valid axis`)
	}
}

function assertValidDirection(object: Record<string, unknown>, key: string): void {
	if (object[key] !== '-' && object[key] !== '+') {
		throw new Error(`${key} (${object[key]}) is not a valid direction`)
	}
}

function assertValidPiece(object: Record<string, unknown>, key: string): void {
	const value = object[key]
	if (typeof value !== 'string' || !isValidPiece(value)) {
		throw new Error(`${key} (${value}) is not a valid piece`)
	}
}

function assertBoolean(object: Record<string, unknown>, key: string): void {
	if (object[key] !== true && object[key] !== false) {
		throw new Error(`${key} (${object[key]}) is not a valid boolean`)
	}
}
