import { err, ok, type Result } from "neverthrow";

export const QUERY_KEY = {
  SKILL_SHEET: ["SKILL_SHEET"],
} as const;

export type ServerFailure = {
  message: string;
};

export class ServerFunctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServerFunctionError";
  }
}

function isResult<T>(value: unknown): value is Result<T, ServerFailure> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { isErr?: unknown }).isErr === "function"
  );
}

function rehydrate<T>(value: unknown): Result<T, ServerFailure> {
  if (isResult<T>(value)) {
    return value;
  }
  if (typeof value === "object" && value !== null && "error" in value && !("value" in value)) {
    const failure = (value as { error?: ServerFailure }).error;
    return err(failure ?? { message: "応答を読めませんでした" });
  }
  if (typeof value === "object" && value !== null && "value" in value) {
    return ok((value as { value: T }).value);
  }
  return err({ message: "応答を読めませんでした" });
}

export async function request<T>(pending: Promise<Result<T, ServerFailure>>): Promise<T> {
  const result = rehydrate<T>(await pending);
  if (result.isErr()) {
    throw new ServerFunctionError(result.error.message);
  }
  return result.value;
}
