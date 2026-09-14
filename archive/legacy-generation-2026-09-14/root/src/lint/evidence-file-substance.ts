import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
  realpathSync,
  statSync,
} from "node:fs";
import { isAbsolute, relative, resolve, win32 } from "node:path";

export type EvidenceFileInspection =
  | {
      ok: true;
      digest: string;
      sizeBytes: number;
      content:
        | {
            kind: "vitest_json_report";
            success: boolean;
            passedTests: number;
            failedTests: number;
            testFiles: readonly string[];
          }
        | { kind: "opaque" };
    }
  | {
      ok: false;
      reason:
        | "invalid_path"
        | "outside_repo"
        | "not_regular_file"
        | "unreadable"
        | "changed_during_read";
    };

function inside(root: string, target: string): boolean {
  const rel = relative(root, target);
  return rel !== ".." && !rel.startsWith("../") && !rel.startsWith("..\\") && !isAbsolute(rel);
}

function inspectContent(bytes: Buffer): Extract<EvidenceFileInspection, { ok: true }>["content"] {
  try {
    const value = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
    if (
      typeof value.success !== "boolean" ||
      typeof value.numPassedTests !== "number" ||
      typeof value.numFailedTests !== "number" ||
      !Array.isArray(value.testResults)
    ) {
      return { kind: "opaque" };
    }
    const testFiles = value.testResults
      .flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const name = (entry as Record<string, unknown>).name;
        return typeof name === "string" ? [name.replace(/^repo:\/\//u, "")] : [];
      })
      .sort();
    return {
      kind: "vitest_json_report",
      success: value.success,
      passedTests: value.numPassedTests,
      failedTests: value.numFailedTests,
      testFiles,
    };
  } catch {
    return { kind: "opaque" };
  }
}

/** loader境界で採取する観測値。採取後の再読取りや実行証明を意味しない。 */
export function observeEvidenceFiles(repoRoot: string, paths: readonly string[]) {
  return Object.freeze(
    Object.fromEntries(
      [...new Set(paths)]
        .sort()
        .map((path) => [path, Object.freeze(inspectEvidenceFile(repoRoot, path))]),
    ),
  );
}

/** bytes一致のみを証明する。実行・承認・coverage成立の証拠には昇格しない。 */
export function inspectEvidenceFile(
  repoRoot: string | undefined,
  path: string,
): EvidenceFileInspection {
  if (
    !repoRoot ||
    !path ||
    path.includes("\0") ||
    isAbsolute(path) ||
    win32.isAbsolute(path) ||
    path.split(/[\\/]/).includes("..")
  ) {
    return { ok: false, reason: "invalid_path" };
  }
  let fd: number | undefined;
  try {
    const root = realpathSync(repoRoot);
    const target = realpathSync(resolve(root, path));
    if (!inside(root, target)) return { ok: false, reason: "outside_repo" };
    const expected = statSync(target, { bigint: true });
    if (!expected.isFile()) return { ok: false, reason: "not_regular_file" };
    fd = openSync(target, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const before = fstatSync(fd, { bigint: true });
    const openedTarget =
      process.platform === "linux" ? realpathSync(`/proc/self/fd/${fd}`) : realpathSync(target);
    if (
      !before.isFile() ||
      before.nlink !== 1n ||
      before.dev !== expected.dev ||
      before.ino !== expected.ino ||
      !inside(root, openedTarget) ||
      !inside(root, realpathSync(target))
    ) {
      return { ok: false, reason: "changed_during_read" };
    }
    const bytes = readFileSync(fd);
    const after = fstatSync(fd, { bigint: true });
    const current = statSync(target, { bigint: true });
    if (
      before.size !== after.size ||
      before.mtimeNs !== after.mtimeNs ||
      before.ctimeNs !== after.ctimeNs ||
      after.dev !== current.dev ||
      after.ino !== current.ino ||
      BigInt(bytes.length) !== after.size
    ) {
      return { ok: false, reason: "changed_during_read" };
    }
    return {
      ok: true,
      digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      sizeBytes: bytes.length,
      content: inspectContent(bytes),
    };
  } catch {
    return { ok: false, reason: "unreadable" };
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}
