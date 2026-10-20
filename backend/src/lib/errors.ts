export interface HttpError extends Error {
  status: number;
}

export function createHttpError(status: number, message: string): HttpError {
  const error = Error(message);
  const withStatus = error as unknown as { status: number; name: string };
  withStatus.status = status;
  withStatus.name = status >= 500 ? "ServerError" : "HttpError";
  return error as HttpError;
}

export function isHttpError(error: unknown): error is HttpError {
  return (
    error instanceof Error &&
    typeof (error as { status?: unknown }).status === "number" &&
    (error as unknown as { status: number }).status >= 400
  );
}

export const errors = {
  badRequest: (message: string) => createHttpError(400, message),
  unauthorized: (message = "Authentication required") => createHttpError(401, message),
  forbidden: (message = "You do not have permission to do this") => createHttpError(403, message),
  notFound: (message = "Not found") => createHttpError(404, message),
  conflict: (message: string) => createHttpError(409, message),
  unprocessable: (message: string) => createHttpError(422, message),
};
