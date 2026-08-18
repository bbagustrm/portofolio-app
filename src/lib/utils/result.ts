/**
 * Result type for operations that can fail
 * Inspired by Rust's Result<T, E>
 */
export type Result<T, E = Error> = 
	| { ok: true; value: T }
	| { ok: false; error: E };

/**
 * Create a successful result
 */
export function Ok<T>(value: T): Result<T, never> {
	return { ok: true, value };
}

/**
 * Create an error result
 */
export function Err<E>(error: E): Result<never, E> {
	return { ok: false, error };
}

/**
 * Unwrap result or throw error
 */
export function unwrap<T, E>(result: Result<T, E>): T {
	if (result.ok) return result.value;
	throw result.error;
}

/**
 * Unwrap result or return default
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
	return result.ok ? result.value : defaultValue;
}

/**
 * Map successful result to new value
 */
export function mapResult<T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => U
): Result<U, E> {
	return result.ok ? Ok(fn(result.value)) : result;
}

/**
 * Chain operations on successful results
 */
export function andThen<T, U, E>(
	result: Result<T, E>,
	fn: (value: T) => Result<U, E>
): Result<U, E> {
	return result.ok ? fn(result.value) : result;
}
