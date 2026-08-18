export class TrendsAPIError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "TrendsAPIError";
    this.status = status;
    this.code = code;
  }
}

export function parseError(status: number, body: unknown): TrendsAPIError {
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    return new TrendsAPIError(
      status,
      String(o.error ?? status),
      String(o.message ?? o.error ?? "Unknown error"),
    );
  }
  return new TrendsAPIError(status, String(status), String(body));
}
