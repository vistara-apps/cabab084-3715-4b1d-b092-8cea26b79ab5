// Error types and utilities for FairPlay Nexus

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  IPFS_ERROR = 'IPFS_ERROR',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
  timestamp: number;
  userId?: string;
}

export class FairPlayError extends Error {
  public type: ErrorType;
  public context?: Record<string, any>;
  public originalError?: any;

  constructor(
    type: ErrorType,
    message: string,
    originalError?: any,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'FairPlayError';
    this.type = type;
    this.originalError = originalError;
    this.context = context;
  }
}

// Error creation utilities
export function createNetworkError(message: string, originalError?: any): FairPlayError {
  return new FairPlayError(
    ErrorType.NETWORK_ERROR,
    message,
    originalError,
    { network: 'base' }
  );
}

export function createContractError(message: string, contractName: string, originalError?: any): FairPlayError {
  return new FairPlayError(
    ErrorType.CONTRACT_ERROR,
    message,
    originalError,
    { contract: contractName }
  );
}

export function createWalletError(message: string, originalError?: any): FairPlayError {
  return new FairPlayError(
    ErrorType.WALLET_ERROR,
    message,
    originalError,
    { wallet: 'metamask' }
  );
}

export function createValidationError(message: string, field?: string): FairPlayError {
  return new FairPlayError(
    ErrorType.VALIDATION_ERROR,
    message,
    undefined,
    { field }
  );
}

export function createIPFSError(message: string, originalError?: any): FairPlayError {
  return new FairPlayError(
    ErrorType.IPFS_ERROR,
    message,
    originalError,
    { service: 'infura' }
  );
}

export function createAPIError(message: string, endpoint: string, originalError?: any): FairPlayError {
  return new FairPlayError(
    ErrorType.API_ERROR,
    message,
    originalError,
    { endpoint }
  );
}

// Error parsing utilities
export function parseContractError(error: any): FairPlayError {
  if (error.code === 'CALL_EXCEPTION') {
    return createContractError(
      'Smart contract call failed. Please check your transaction details.',
      'unknown',
      error
    );
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    return createWalletError(
      'Insufficient funds for this transaction.',
      error
    );
  }

  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return createContractError(
      'Unable to estimate gas for this transaction.',
      'unknown',
      error
    );
  }

  if (error.message?.includes('execution reverted')) {
    return createContractError(
      'Transaction reverted by the smart contract.',
      'unknown',
      error
    );
  }

  return createContractError(
    error.message || 'Unknown contract error',
    'unknown',
    error
  );
}

export function parseWalletError(error: any): FairPlayError {
  if (error.code === 4001) {
    return createWalletError('Transaction rejected by user', error);
  }

  if (error.code === -32000) {
    return createWalletError('Insufficient funds', error);
  }

  if (error.code === 4902) {
    return createWalletError('Please add the Base network to your wallet', error);
  }

  return createWalletError(
    error.message || 'Wallet operation failed',
    error
  );
}

export function parseNetworkError(error: any): FairPlayError {
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return createNetworkError('Network connection failed. Please check your internet connection.', error);
  }

  if (error.code === 'TIMEOUT') {
    return createNetworkError('Request timed out. Please try again.', error);
  }

  return createNetworkError(
    error.message || 'Network error occurred',
    error
  );
}

// Error reporting
export function reportError(error: AppError): void {
  // In production, send to error reporting service
  console.error('FairPlay Error:', {
    type: error.type,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp,
    userId: error.userId,
    stack: error.originalError?.stack,
  });

  // Example: Send to error reporting service
  // errorReportingService.captureException(error);
}

// Error recovery utilities
export function isRetryableError(error: FairPlayError): boolean {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return true;
    case ErrorType.API_ERROR:
      return error.message.includes('timeout') || error.message.includes('network');
    case ErrorType.CONTRACT_ERROR:
      return error.message.includes('gas') || error.message.includes('nonce');
    default:
      return false;
  }
}

export function getRetryDelay(error: FairPlayError, attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

// User-friendly error messages
export function getUserFriendlyMessage(error: FairPlayError): string {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Connection failed. Please check your internet and try again.';
    case ErrorType.CONTRACT_ERROR:
      return 'Blockchain transaction failed. Please verify your details and try again.';
    case ErrorType.WALLET_ERROR:
      return 'Wallet error. Please ensure your wallet is connected and try again.';
    case ErrorType.VALIDATION_ERROR:
      return error.message; // Validation messages are usually user-friendly
    case ErrorType.IPFS_ERROR:
      return 'File storage failed. Please try again in a moment.';
    case ErrorType.API_ERROR:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Error boundary for async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const appError: AppError = {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || 'Unknown error',
      originalError: error,
      context,
      timestamp: Date.now(),
    };

    reportError(appError);
    throw error;
  }
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: any, context?: Record<string, any>) => {
      let appError: AppError;

      if (error instanceof FairPlayError) {
        appError = {
          type: error.type,
          message: error.message,
          originalError: error.originalError,
          context: { ...error.context, ...context },
          timestamp: Date.now(),
        };
      } else {
        appError = {
          type: ErrorType.UNKNOWN_ERROR,
          message: error.message || 'Unknown error',
          originalError: error,
          context,
          timestamp: Date.now(),
        };
      }

      reportError(appError);
      return appError;
    },

    getUserMessage: (error: any) => {
      if (error instanceof FairPlayError) {
        return getUserFriendlyMessage(error);
      }
      return getUserFriendlyMessage(
        new FairPlayError(ErrorType.UNKNOWN_ERROR, error.message || 'Unknown error')
      );
    },
  };
}

