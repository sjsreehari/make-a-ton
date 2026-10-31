export const ErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ILLEGAL_TRANSITION: 'ILLEGAL_TRANSITION',
  DUPLICATE_BILLING: 'DUPLICATE_BILLING',
  DISCOUNT_EXHAUSTED: 'DISCOUNT_EXHAUSTED',
  PAYMENT_EXCEEDS_BALANCE: 'PAYMENT_EXCEEDS_BALANCE',
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
  INTERNAL: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
    public readonly httpStatus: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(ErrorCode.NOT_FOUND, `${entity} not found: ${id}`, undefined, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(ErrorCode.FORBIDDEN, message, undefined, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorCode.CONFLICT, message, undefined, 409);
  }
}

export class IllegalTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      ErrorCode.ILLEGAL_TRANSITION,
      `Illegal status transition: ${from} -> ${to}`,
      undefined,
      409,
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_FAILED, message, details, 422);
  }
}

export class NotImplementedError extends AppError {
  constructor(feature = 'This feature') {
    super(ErrorCode.NOT_IMPLEMENTED, `${feature} is not yet implemented`, undefined, 501);
  }
}

