// 版の計算。bun に依存しないので Vitest（make test）で検査する。

export const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

// patch・minor・major で上げた版、または直接指定した版を返す。読めなければ null。
// プレリリース（1.2.0-beta.1）からの patch / minor / major は、まず - の前の版（1.2.0）にする。
export function nextVersion(current: string, level: string): string | null {
  const now = SEMVER.exec(current);
  if (!now) {
    return null;
  }
  const [major, minor, patch] = [Number(now[1]), Number(now[2]), Number(now[3])];
  const pre = now[4] !== undefined;
  switch (level) {
    case "patch":
      return pre ? `${major}.${minor}.${patch}` : `${major}.${minor}.${patch + 1}`;
    case "minor":
      return pre && patch === 0 ? `${major}.${minor}.0` : `${major}.${minor + 1}.0`;
    case "major":
      return pre && minor === 0 && patch === 0 ? `${major}.0.0` : `${major + 1}.0.0`;
    default: {
      const value = level.replace(/^v/, "");
      return SEMVER.test(value) ? value : null;
    }
  }
}
