import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 実行中の Node が package.json engines.node を満たすかを検査する。
 *
 * 既存の runtime-portability / toolchain-pin は engines.node の「宣言」と「pin」を検査するが、
 * 実行中の runtime が範囲を満たすかは誰も見ていなかった。その結果、範囲外の Node で
 * ローカル gate を回して green と報告し、CI（範囲内）との差が静かに残る事故が起きる（Issue #660）。
 */

export type NodeEngineRuntimeFinding = {
  code:
    | "node_engine_declaration_missing"
    | "node_engine_range_unsupported"
    | "node_engine_runtime_out_of_range";
  subject: string;
  detail: string;
};

export type NodeEngineRuntimeResult = {
  ok: boolean;
  runtimeVersion: string;
  declaredRange: string | null;
  findings: NodeEngineRuntimeFinding[];
};

type Comparator = { operator: ">=" | ">" | "<=" | "<" | "="; version: [number, number, number] };

/** `v24.15.0` / `24.15.0` / `24.15` / `24` を [major, minor, patch] へ正規化する。 */
export function parseNodeVersion(value: string): [number, number, number] | null {
  const match = value.trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/u);
  if (!match) return null;
  const parts = [match[1], match[2] ?? "0", match[3] ?? "0"].map((part) => Number(part));
  if (parts.some((part) => !Number.isSafeInteger(part) || part < 0)) return null;
  return [parts[0] as number, parts[1] as number, parts[2] as number];
}

function compare(left: [number, number, number], right: [number, number, number]): number {
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] as number) - (right[index] as number);
    if (difference !== 0) return difference;
  }
  return 0;
}

/**
 * `>=24.15.0 <25` のような AND 連結の comparator 列だけを受け付ける。
 * `||`、`^`、`~`、`x` 系の range は解釈せず null を返し、呼出側が fail-close する。
 * 検査対象を広げるより、解釈できない range を「通す」ことを避ける方を優先する。
 */
export function parseNodeEngineRange(range: string): Comparator[] | null {
  const tokens = range.trim().split(/\s+/u).filter(Boolean);
  if (tokens.length === 0) return null;
  const comparators: Comparator[] = [];
  for (const token of tokens) {
    const match = token.match(/^(>=|<=|>|<|=)?(.+)$/u);
    if (!match) return null;
    const version = parseNodeVersion(match[2] as string);
    if (!version) return null;
    comparators.push({ operator: (match[1] as Comparator["operator"]) ?? "=", version });
  }
  return comparators;
}

function satisfies(version: [number, number, number], comparators: Comparator[]): boolean {
  return comparators.every((comparator) => {
    const ordering = compare(version, comparator.version);
    switch (comparator.operator) {
      case ">=":
        return ordering >= 0;
      case ">":
        return ordering > 0;
      case "<=":
        return ordering <= 0;
      case "<":
        return ordering < 0;
      case "=":
        return ordering === 0;
      default:
        return false;
    }
  });
}

export function analyzeNodeEngineRuntime(input: {
  runtimeVersion: string;
  declaredRange: string | null;
}): NodeEngineRuntimeResult {
  const { runtimeVersion, declaredRange } = input;
  const findings: NodeEngineRuntimeFinding[] = [];
  if (!declaredRange) {
    findings.push({
      code: "node_engine_declaration_missing",
      subject: "package.json",
      detail: "engines.node is absent, so the running runtime cannot be validated",
    });
    return { ok: false, runtimeVersion, declaredRange, findings };
  }
  const comparators = parseNodeEngineRange(declaredRange);
  const version = parseNodeVersion(runtimeVersion);
  if (!comparators || !version) {
    findings.push({
      code: "node_engine_range_unsupported",
      subject: declaredRange,
      detail: `unsupported engines.node range or runtime version (runtime=${runtimeVersion})`,
    });
    return { ok: false, runtimeVersion, declaredRange, findings };
  }
  if (!satisfies(version, comparators)) {
    findings.push({
      code: "node_engine_runtime_out_of_range",
      subject: runtimeVersion,
      detail: `running Node ${runtimeVersion} does not satisfy engines.node ${declaredRange}; local gate results are not comparable with CI`,
    });
  }
  return { ok: findings.length === 0, runtimeVersion, declaredRange, findings };
}

export function nodeEngineRuntimeMessages(result: NodeEngineRuntimeResult): string[] {
  return result.findings.map(
    (finding) =>
      `node-engine-runtime - violation: ${finding.code} (${finding.subject}) ${finding.detail}`,
  );
}

/**
 * 証拠を書き込むcommand boundary向けのhard gate。
 *
 * doctorはfindingを集約するためresultを返すが、review receiptのような外部証拠writeは
 * 範囲外runtimeで一行も書いてはならない。既存のrange解釈を再利用し、呼出側が検査を
 * 忘れたりwarningへ降格したりできないthrow境界を提供する。
 */
export function assertNodeEngineRuntimeAuthority(
  repoRoot: string = process.cwd(),
  runtimeVersion: string = process.version,
): NodeEngineRuntimeResult {
  let declaredRange: string | null;
  try {
    const manifest = JSON.parse(
      readFileSync(resolve(repoRoot, "package.json"), "utf8"),
    ) as Partial<{ engines: { node?: string } }>;
    declaredRange = manifest.engines?.node ?? null;
  } catch {
    throw new Error("node_engine_runtime_authority_read_failed");
  }
  const result = analyzeNodeEngineRuntime({ runtimeVersion, declaredRange });
  if (!result.ok) {
    const codes = result.findings.map((finding) => finding.code).join(",");
    throw new Error(`node_engine_runtime_authority_rejected:${codes}`);
  }
  return result;
}

export function checkNodeEngineRuntime(repoRoot: string = process.cwd()): {
  messages: string[];
  ok: boolean;
} {
  try {
    const manifest = JSON.parse(
      readFileSync(resolve(repoRoot, "package.json"), "utf8"),
    ) as Partial<{ engines: { node?: string } }>;
    const result = analyzeNodeEngineRuntime({
      runtimeVersion: process.version,
      declaredRange: manifest.engines?.node ?? null,
    });
    const messages = nodeEngineRuntimeMessages(result);
    if (result.ok) {
      messages.push(
        `node-engine-runtime — OK (runtime=${result.runtimeVersion}, engines.node=${result.declaredRange})`,
      );
    }
    return { messages, ok: result.ok };
  } catch (error) {
    return {
      messages: [`node-engine-runtime - violation: read_failed ${String(error)}`],
      ok: false,
    };
  }
}
