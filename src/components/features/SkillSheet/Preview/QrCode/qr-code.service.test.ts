import { describe, expect, it } from "vitest";
import { qrMatrixOf } from "./qr-code.service";

describe("qrMatrixOf", () => {
  it("http(s) の URL を升目にする", () => {
    const matrix = qrMatrixOf("https://example.com/portfolio");
    expect(matrix).not.toBeNull();
    // バージョン 1 以上（21 升）に周りの余白 1 升ずつを足した大きさ
    expect(matrix?.size).toBeGreaterThanOrEqual(23);
    expect(matrix?.path.startsWith("M")).toBe(true);
  });

  it("前後の空白は無視する", () => {
    expect(qrMatrixOf("  https://example.com  ")).toEqual(qrMatrixOf("https://example.com"));
  });

  it("http(s) 以外は QR コードにしない", () => {
    expect(qrMatrixOf("")).toBeNull();
    expect(qrMatrixOf("example.com")).toBeNull();
    expect(qrMatrixOf("mailto:me@example.com")).toBeNull();
    expect(qrMatrixOf("javascript:alert(1)")).toBeNull();
  });

  it("長すぎて符号化できない URL は null にする", () => {
    expect(qrMatrixOf(`https://example.com/${"a".repeat(5000)}`)).toBeNull();
  });
});
