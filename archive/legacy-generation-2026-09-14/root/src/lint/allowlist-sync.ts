import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * allowlist-sync (PLAN-L7-335)。
 *
 * subagent allowlist の正本は `src/runtime/agent-guard-policy.ts` の `SUBAGENT_ALLOWLIST` であり、
 * `.claude/CLAUDE.md` の「Allowlist」節はその**手動転記 (同期写し)** と宣言されている。
 * 転記は機械検査されておらず、roster 追加時に片側だけ更新される drift (guard は通るのに
 * ドキュメントに無い / その逆) を防げない。本 lint は両者を set 比較し、差分・parse 失敗を
 * fail-close で検出する (asset-drift の missing-allowlisted-agent は agent .md の実在のみを見る
 * ため、この転記同期は未カバー)。
 */

export const ALLOWLIST_POLICY_PATH = "src/runtime/agent-guard-policy.ts";
export const ALLOWLIST_DOC_PATH = ".claude/CLAUDE.md";

export interface AllowlistSyncInput {
  /** 正本 (agent-guard-policy.ts) から抽出した allowlist (parse 失敗は null)。 */
  policy: string[] | null;
  /** .claude/CLAUDE.md の Allowlist 節から抽出した転記 (節が見つからない場合は null)。 */
  doc: string[] | null;
}

export interface AllowlistSyncViolation {
  kind: "policy-unreadable" | "doc-unreadable" | "missing-in-doc" | "missing-in-policy";
  detail: string;
}

export interface AllowlistSyncResult {
  ok: boolean;
  policyCount: number;
  docCount: number;
  violations: AllowlistSyncViolation[];
}

/** `SUBAGENT_ALLOWLIST = new Set([ ... ])` リテラル内の文字列 entry を抽出する。 */
export function parsePolicyAllowlist(source: string): string[] | null {
  const block = source.match(/SUBAGENT_ALLOWLIST[^=]*=\s*new Set(?:<[^>]*>)?\(\[([\s\S]*?)\]\)/);
  if (!block) return null;
  const entries = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  return entries.length > 0 ? entries : null;
}

/**
 * `.claude/CLAUDE.md` の Allowlist 見出し行 (「Allowlist」を含み agent-guard-policy を cite する行)
 * 直後の `- \`name\`` bullet 群を、次の見出し (`#` 開始行) まで収集する。
 */
export function parseDocAllowlist(content: string): string[] | null {
  const lines = content.split(/\r?\n/);
  const headIndex = lines.findIndex(
    (line) => line.includes("Allowlist") && line.includes("agent-guard-policy.ts"),
  );
  if (headIndex < 0) return null;
  const entries: string[] = [];
  for (let i = headIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) break;
    const bullet = line.match(/^-\s+`([^`]+)`\s*$/);
    if (bullet) entries.push(bullet[1]);
  }
  return entries.length > 0 ? entries : null;
}

export function loadAllowlistSyncInput(repoRoot: string): AllowlistSyncInput {
  const policyFile = join(repoRoot, ...ALLOWLIST_POLICY_PATH.split("/"));
  const docFile = join(repoRoot, ...ALLOWLIST_DOC_PATH.split("/"));
  const policy = existsSync(policyFile)
    ? parsePolicyAllowlist(readFileSync(policyFile, "utf8"))
    : null;
  const doc = existsSync(docFile) ? parseDocAllowlist(readFileSync(docFile, "utf8")) : null;
  return { policy, doc };
}

export function analyzeAllowlistSync(input: AllowlistSyncInput): AllowlistSyncResult {
  const violations: AllowlistSyncViolation[] = [];
  if (input.policy === null) {
    violations.push({
      kind: "policy-unreadable",
      detail: `${ALLOWLIST_POLICY_PATH} から SUBAGENT_ALLOWLIST を抽出できない`,
    });
  }
  if (input.doc === null) {
    violations.push({
      kind: "doc-unreadable",
      detail: `${ALLOWLIST_DOC_PATH} の Allowlist 転記節を抽出できない`,
    });
  }
  if (input.policy !== null && input.doc !== null) {
    const policySet = new Set(input.policy);
    const docSet = new Set(input.doc);
    for (const name of input.policy) {
      if (!docSet.has(name)) {
        violations.push({
          kind: "missing-in-doc",
          detail: `${name} が正本にあるが ${ALLOWLIST_DOC_PATH} の転記に無い`,
        });
      }
    }
    for (const name of input.doc) {
      if (!policySet.has(name)) {
        violations.push({
          kind: "missing-in-policy",
          detail: `${name} が ${ALLOWLIST_DOC_PATH} に転記されているが正本に無い`,
        });
      }
    }
  }
  return {
    ok: violations.length === 0,
    policyCount: input.policy?.length ?? 0,
    docCount: input.doc?.length ?? 0,
    violations,
  };
}

export function allowlistSyncMessages(result: AllowlistSyncResult): string[] {
  if (result.ok) {
    return [`allowlist-sync - OK (policy=${result.policyCount}, doc=${result.docCount}, drift=0)`];
  }
  const messages = [`allowlist-sync - violation: allowlist 転記 drift=${result.violations.length}`];
  for (const v of result.violations) {
    messages.push(v.detail);
  }
  return messages;
}
