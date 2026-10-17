import { err, ok, type Result } from "neverthrow";
import { ServerFunctionError } from "@/src/error";

export const QUERY_KEY = {
  SKILL_SHEET: ["SKILL_SHEET"],
} as const;

function isResult<T>(value: unknown): value is Result<T, ServerFunctionError> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { isErr?: unknown }).isErr === "function"
  );
}

function rehydrate<T>(value: unknown): Result<T, ServerFunctionError> {
  if (isResult<T>(value)) {
    return value;
  }
  if (typeof value === "object" && value !== null && "error" in value && !("value" in value)) {
    const error = (value as { error?: ServerFunctionError | { message: string } }).error;
    if (error instanceof ServerFunctionError) {
      return err(error);
    }
    if (error && typeof error === "object" && "message" in error) {
      return err(new ServerFunctionError(error.message));
    }
    return err(new ServerFunctionError("応答を読めませんでした"));
  }
  if (typeof value === "object" && value !== null && "value" in value) {
    return ok((value as { value: T }).value);
  }
  return err(new ServerFunctionError("応答を読めませんでした"));
}

export async function request<T>(
  pending: Promise<Result<T, ServerFunctionError>>,
): Promise<T> {
  const result = rehydrate<T>(await pending);
  if (result.isErr()) {
    throw result.error;
  }
  return result.value;
}
