import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { registry } from "./registry";
import { Shell } from "./shell";
import { useToolSelection } from "./tool-selection";

describe("ツール一覧", () => {
  beforeEach(() => {
    useToolSelection.setState({ toolId: "skill-sheet" });
  });

  it("登録を2件にすると見出しを2つ返す", () => {
    expect(registry.map((tool) => tool.name)).toEqual(["スキルシート"]);
    render(
      <Shell
        tools={[
          { id: "skill-sheet", name: "スキルシート", Panel: () => null },
          { id: "estimate", name: "見積", Panel: () => null },
        ]}
      />,
    );
    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "スキルシート",
      "見積",
    ]);
  });
});
