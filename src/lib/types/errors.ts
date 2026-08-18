/**
 * Base application error
 */
export class AppError extends Error {
	constructor(
		message: string,
		public code?: string,
		public statusCode: number = 500
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Database operation errors
 */
export class DatabaseError extends AppError {
	constructor(
		message: string,
		public originalError?: any
	) {
		super(message, 'DATABASE_ERROR', 500);
	}

	static fromSupabaseError(error: any): DatabaseError {
		return new DatabaseError(
			error.message || 'Database operation failed',
			error
		);
	}
}

/**
 * Resource not found
 */
export class NotFoundError extends AppError {
	constructor(message: string = 'Resource not found') {
		super(message, 'NOT_FOUND', 404);
	}
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public fields?: Record<string, string[]>
	) {
		super(message, 'VALIDATION_ERROR', 400);
	}
}

/**
 * Authentication errors
 */
export class AuthenticationError extends AppError {
	constructor(message: string = 'Authentication required') {
		super(message, 'AUTH_REQUIRED', 401);
	}
}

/**
 * Authorization errors
 */
export class AuthorizationError extends AppError {
	constructor(message: string = 'Permission denied') {
		super(message, 'FORBIDDEN', 403);
	}
}
