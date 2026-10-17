import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { registry } from "./registry";
import { Shell } from "./index";
import { useToolSelection } from "./useToolSelection";

describe("ツール一覧", () => {
  beforeEach(() => {
    useToolSelection.setState({ toolId: "skill-sheet" });
  });

  it("選んだツールのパネルだけを表示し、ヘッダーにツール名を出さない", () => {
    expect(registry.map((tool) => tool.name)).toEqual(["スキルシート"]);
    render(
      <Shell
        tools={[
          { id: "skill-sheet", name: "スキルシート", Panel: () => <h1>スキルシート</h1> },
          { id: "estimate", name: "見積", Panel: () => <h1>見積</h1> },
        ]}
      />,
    );
    expect(screen.getAllByRole("heading").map((heading) => heading.textContent)).toEqual([
      "スキルシート",
    ]);
    expect(screen.getByRole("banner").textContent).toBe("");
  });
});
