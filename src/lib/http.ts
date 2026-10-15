/** Error thrown for any non-2xx response, carrying the parsed body. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * The API lives under the app's base path (e.g. `/trucktracker/api/` on GitHub
 * Pages). URLs are absolute so they also resolve in Node during tests.
 */
const API_BASE_URL = new URL(
  `${import.meta.env.BASE_URL}api/`,
  window.location.origin
);

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

const parseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const errorMessage = (body: unknown, status: number) =>
  typeof body === "object" && body !== null && "message" in body
    ? String(body.message)
    : `Request failed with status ${status}`;

export async function http(
  path: string,
  { body, headers, ...init }: RequestOptions = {}
): Promise<unknown> {
  const response = await fetch(new URL(path, API_BASE_URL), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseBody(response);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(data, response.status),
      data
    );
  }
  return data;
}
