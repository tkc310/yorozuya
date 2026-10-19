import { describe, expect, it } from "vitest";
import { nextVersion } from "./semver";

describe("次の版", () => {
  it("patch・minor・major で上げる", () => {
    expect(nextVersion("0.1.0", "patch")).toBe("0.1.1");
    expect(nextVersion("0.1.3", "minor")).toBe("0.2.0");
    expect(nextVersion("0.9.1", "major")).toBe("1.0.0");
  });

  it("プレリリースからは - の前の版にする", () => {
    expect(nextVersion("0.2.0-beta.1", "minor")).toBe("0.2.0");
    expect(nextVersion("0.2.1-rc.1", "patch")).toBe("0.2.1");
    expect(nextVersion("0.2.1-rc.1", "minor")).toBe("0.3.0");
    expect(nextVersion("1.0.0-rc.1", "major")).toBe("1.0.0");
  });

  it("版を直接指定できる", () => {
    expect(nextVersion("0.1.0", "0.2.0-beta.1")).toBe("0.2.0-beta.1");
    expect(nextVersion("0.1.0", "v1.0.0")).toBe("1.0.0");
  });

  it("読めない指定は null", () => {
    expect(nextVersion("0.1.0", "next")).toBeNull();
    expect(nextVersion("0.1.0", "1.2")).toBeNull();
  });
});
