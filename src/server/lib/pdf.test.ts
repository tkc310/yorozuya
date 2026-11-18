import { describe, expect, it } from "vitest";
import { isLoopback } from "./pdf";

describe("isLoopback", () => {
  it("手元のサーバの URL だけを許す", () => {
    expect(isLoopback(new URL("http://127.0.0.1:4628/skill-sheet/print"))).toBe(true);
    expect(isLoopback(new URL("http://localhost:46280/skill-sheet/print"))).toBe(true);
    expect(isLoopback(new URL("http://[::1]:4628/"))).toBe(true);
  });

  it("外のホストや http 以外は開かない", () => {
    expect(isLoopback(new URL("https://example.com/"))).toBe(false);
    expect(isLoopback(new URL("http://127.0.0.1.example.com/"))).toBe(false);
    expect(isLoopback(new URL("file:///etc/passwd"))).toBe(false);
  });
});
