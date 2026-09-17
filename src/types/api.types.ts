export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  requestId?: string;
}

export interface ApiSuccess<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}
