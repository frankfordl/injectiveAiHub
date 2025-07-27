// Error handling utilities

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export class CoTrainError extends Error {
  public readonly code: string
  public readonly details?: any
  public readonly timestamp: Date

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'CoTrainError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    }
  }
}

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  TRAINING_ERROR: 'TRAINING_ERROR',
  DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

// Error handler function
export const handleError = (error: unknown): AppError => {
  if (error instanceof CoTrainError) {
    return error.toJSON()
  }

  if (error instanceof Error) {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      details: { stack: error.stack },
      timestamp: new Date(),
    }
  }

  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    details: error,
    timestamp: new Date(),
  }
}

// Async error wrapper
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  errorCode: string = ERROR_CODES.UNKNOWN_ERROR
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof CoTrainError) {
      throw error
    }
    throw new CoTrainError(
      errorCode,
      error instanceof Error ? error.message : 'An error occurred',
      error
    )
  }
}

// Validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new CoTrainError(
      ERROR_CODES.VALIDATION_ERROR,
      `${fieldName} is required`
    )
  }
}

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new CoTrainError(
      ERROR_CODES.VALIDATION_ERROR,
      'Invalid email format'
    )
  }
}

export const validatePositiveNumber = (value: number, fieldName: string): void => {
  if (typeof value !== 'number' || value <= 0) {
    throw new CoTrainError(
      ERROR_CODES.VALIDATION_ERROR,
      `${fieldName} must be a positive number`
    )
  }
}