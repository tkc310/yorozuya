import { err, ok, type Result } from "neverthrow";

export type SheetFailure = {
  message: string;
};

function isResult<T>(value: unknown): value is Result<T, SheetFailure> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { isErr?: unknown }).isErr === "function"
  );
}

function rehydrate<T>(value: unknown): Result<T, SheetFailure> {
  if (isResult<T>(value)) {
    return value;
  }
  if (typeof value === "object" && value !== null && "error" in value && !("value" in value)) {
    const failure = (value as { error?: SheetFailure }).error;
    return err(failure ?? { message: "応答を読めませんでした" });
  }
  if (typeof value === "object" && value !== null && "value" in value) {
    return ok((value as { value: T }).value);
  }
  return err({ message: "応答を読めませんでした" });
}

export async function request<T>(pending: Promise<Result<T, SheetFailure>>): Promise<T> {
  const result = rehydrate<T>(await pending);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}
