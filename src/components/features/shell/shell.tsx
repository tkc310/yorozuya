import { css } from "styled-system/css";
import { registry, type ToolRegistration } from "./registry";
import { useToolSelection } from "./tool-selection";

const page = css({
  display: "grid",
  minHeight: "100vh",
});

const toolList = css({
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "#e4dccd",
  display: "flex",
  gap: "4",
  margin: "0",
  px: "6",
  py: "4",
});

const toolButton = css({
  background: "transparent",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  font: "inherit",
  fontWeight: "semibold",
  padding: "0",
});

export function Shell({ tools = registry }: { tools?: ToolRegistration[] }) {
  const toolId = useToolSelection((state) => state.toolId);
  const selectTool = useToolSelection((state) => state.selectTool);
  const selected = tools.find((tool) => tool.id === toolId) ?? tools[0];
  const Panel = selected?.Panel;
  return (
    <div className={page}>
      <nav className={`${toolList} tool-list`} aria-label="ツール">
        {tools.length === 0 ? <p>ツールがありません</p> : null}
        {tools.map((tool) => (
          <h2 key={tool.id} className={css({ margin: "0", fontSize: "lg" })}>
            <button
              type="button"
              className={toolButton}
              aria-current={tool.id === selected?.id ? "page" : undefined}
              onClick={() => selectTool(tool.id)}
            >
              {tool.name}
            </button>
          </h2>
        ))}
      </nav>
      <main>{Panel ? <Panel /> : null}</main>
    </div>
  );
}
