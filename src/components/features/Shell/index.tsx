import { css } from "styled-system/css";
import logo from "@/src/assets/images/logo.webp";
import { registry, type ToolRegistration } from "./registry";
import { useToolSelection } from "./useToolSelection";

// md 以上では画面の高さに固定し、スクロールは main の中に任せる。
const page = css({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  height: { md: "100dvh" },
  minHeight: "100dvh",
  _print: { display: "block", height: "auto", minHeight: "0" },
});

const content = css({
  minHeight: "0",
  overflow: { md: "hidden" },
  _print: { overflow: "visible" },
});

const header = css({
  alignItems: "stretch",
  background: "bg.canvas",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  columnGap: { base: "6", md: "8" },
  display: "flex",
  flexWrap: "wrap",
  px: { base: "4", md: "8" },
});

const logoImage = css({
  alignSelf: "center",
  display: "block",
  height: { base: "32px", md: "40px" },
  my: "2",
  width: "auto",
});

export function Shell({ tools = registry }: { tools?: ToolRegistration[] }) {
  const toolId = useToolSelection((state) => state.toolId);
  const selected = tools.find((tool) => tool.id === toolId) ?? tools[0];
  const Panel = selected?.Panel;
  return (
    <div className={page}>
      <header className={`${header} tool-list`}>
        <img src={logo} alt="よろずや" width={1137} height={256} className={logoImage} />
      </header>
      <main className={content}>{Panel ? <Panel /> : <p>ツールがありません</p>}</main>
    </div>
  );
}
