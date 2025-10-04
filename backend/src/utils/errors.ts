export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (message: string) => new ApiError(404, message);
export const badRequest = (message: string, details?: unknown) => new ApiError(400, message, details);
export const conflict = (message: string) => new ApiError(409, message);
