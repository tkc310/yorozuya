import { describe, expect, it } from "vitest";
import { buildXlsx, columnName, crc32, workbookFiles, zipStored } from "./xlsx.service";

// 無圧縮 ZIP をたどって、名前と中身の組を取り出す。
function unzip(bytes: Uint8Array): Map<string, string> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  const files = new Map<string, string>();
  let cursor = 0;
  while (view.getUint32(cursor, true) === 0x04034b50) {
    const size = view.getUint32(cursor + 18, true);
    const nameLength = view.getUint16(cursor + 26, true);
    const name = decoder.decode(bytes.subarray(cursor + 30, cursor + 30 + nameLength));
    const data = bytes.subarray(cursor + 30 + nameLength, cursor + 30 + nameLength + size);
    expect(view.getUint32(cursor + 14, true)).toBe(crc32(data));
    files.set(name, decoder.decode(data));
    cursor += 30 + nameLength + size;
  }
  return files;
}

describe("crc32", () => {
  it("既知の値と一致する", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
});

describe("columnName", () => {
  it.each([
    [0, "A"],
    [25, "Z"],
    [26, "AA"],
    [701, "ZZ"],
  ])("%i 列目は %s", (index, name) => {
    expect(columnName(index)).toBe(name);
  });
});

describe("zipStored", () => {
  it("中身をそのまま取り出せ、末尾に中央ディレクトリの終端がある", () => {
    const bytes = zipStored([
      { path: "a.txt", content: "あいう" },
      { path: "b/c.txt", content: "x" },
    ]);
    expect(unzip(bytes)).toEqual(
      new Map([
        ["a.txt", "あいう"],
        ["b/c.txt", "x"],
      ]),
    );
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(bytes.length - 12, true)).toBe(2);
  });
});

describe("buildXlsx", () => {
  it("シートごとの XML と、文字列・数値・式・書式を書く", () => {
    const files = unzip(
      buildXlsx([
        {
          name: "11月",
          columns: [10, 8],
          rows: [
            [{ value: "作業報告書", style: "bold" }],
            ["A&B <x>", 8.5],
            [null, { formula: "SUM(B2:B2)", value: 8.5, style: "boldHours" }],
          ],
        },
        { name: "12/月", columns: [], rows: [] },
      ]),
    );
    expect([...files.keys()]).toEqual([
      "[Content_Types].xml",
      "_rels/.rels",
      "xl/workbook.xml",
      "xl/_rels/workbook.xml.rels",
      "xl/styles.xml",
      "xl/worksheets/sheet1.xml",
      "xl/worksheets/sheet2.xml",
    ]);
    const sheet = files.get("xl/worksheets/sheet1.xml") ?? "";
    expect(sheet).toContain(
      '<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">作業報告書</t></is></c>',
    );
    expect(sheet).toContain("A&amp;B &lt;x&gt;");
    expect(sheet).toContain('<c r="B2"><v>8.5</v></c>');
    expect(sheet).toContain('<c r="B3" s="3"><f>SUM(B2:B2)</f><v>8.5</v></c>');
    expect(sheet).toContain('<col min="1" max="1" width="10" customWidth="1"/>');
    // シート名に使えない文字は除く。
    expect(files.get("xl/workbook.xml")).toContain('name="12月"');
  });

  it("シートの数だけ関係と型を登録する", () => {
    const files = workbookFiles([
      { name: "1月", columns: [], rows: [] },
      { name: "2月", columns: [], rows: [] },
    ]);
    const types = files.find((file) => file.path === "[Content_Types].xml")?.content ?? "";
    expect(types.match(/worksheets\/sheet\d\.xml/g)).toHaveLength(2);
    const rels = files.find((file) => file.path === "xl/_rels/workbook.xml.rels")?.content ?? "";
    expect(rels).toContain('Id="rId3"');
    expect(rels).toContain("styles.xml");
  });
});
