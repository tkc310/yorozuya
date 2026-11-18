import { encode } from "uqr";

// 印刷したシートから URL を開けるよう、リンクを QR コードの升目にする。

// 汚れや折り目で欠けても読めるよう、15% まで復元できる M にする。
const ECC = "M";

export type QrMatrix = {
  // 1 辺の升目の数（周りの余白 1 升を含む）。
  size: number;
  // 黒い升目を 1 つの SVG パスにしたもの。座標は升目の単位。
  path: string;
};

// http(s) の URL だけを QR コードにする。それ以外や、長すぎて符号化できないものは null。
export function qrMatrixOf(url: string): QrMatrix | null {
  const text = url.trim();
  if (!/^https?:\/\/\S+$/i.test(text)) {
    return null;
  }
  let data: boolean[][];
  try {
    data = encode(text, { ecc: ECC, border: 1 }).data;
  } catch {
    return null;
  }
  const commands: string[] = [];
  data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) {
        commands.push(`M${x} ${y}h1v1h-1z`);
      }
    });
  });
  return { size: data.length, path: commands.join("") };
}
