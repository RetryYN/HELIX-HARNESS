/**
 * escalation-consult-gate — PO エスカレーション前 Sol 壁打ち前置強制 (Issue #587)。
 *
 * PO 指示 (2026-08-12): 「エスカレーションと言い出そうとしたら先に Sol 壁打ちしてから進める」を
 * メモリ (prose) ではなく hook で機械強制する。Stop hook (`helix session summary`) が
 * 最終 assistant 応答にエスカレーション文言を検出し、有効な consult receipt が無ければ
 * exit 2 で停止をブロックする。
 *
 * fail 方針 (cross-review B-3 反映、tri-state):
 * - escalation 非検知 / transcript 欠落・parse 不能 → fail-open
 * - escalation 検知 + receipt「不存在」または stale → fail-close (block)
 * - escalation 検知 + receipt「存在するが読取/解析エラー」→ fail-open (warning surface)
 *
 * receipt の正本 writer は `helix codex --role tl --execute` (runtimeCommand、consult role 限定。
 * cross-review B-1 反映: qa/reviewer 等の一般 read-only role では発行しない)。
 * override は one-shot marker (`.helix/state/escalation-consult-override`、non-empty reason 必須)
 * を harness.db guard_override_transactions へ digest-only で audit してから消費する
 * (cross-review B-2 反映。既存 work-guard / git-command-guard と同一 transaction 契約)。
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { OverrideCommitResult } from "./guard-override-transaction";

/** エスカレーション文言 SSoT。最終 assistant 応答テキストに対して評価する。 */
export const ESCALATION_INTENT_PATTERNS: readonly RegExp[] = [
  /エスカレーション/,
  /エスカレート/,
  /PO\s*の?\s*(判断|裁定|決定|確認)\s*(待ち|が必要|を仰|へ|に)/,
  /PO\s*(へ|に)\s*(確認|相談|質問|判断|エスカレート)/,
  /(判断|裁定)を仰ぎ/,
  /escalat(e|ion|ing)\s+(this\s+)?to\s+(the\s+)?PO/i,
];

/**
 * 否定・非該当文脈の抑制 (cross-review H-2)。positive match 前にテキストから取り除く。
 * 「エスカレーション不要」「エスカレーションせず」等はエスカレーション宣言ではない。
 */
export const ESCALATION_NEGATION_PATTERNS: readonly RegExp[] = [
  /エスカレーション(?:は|も)?\s*(?:不要|不用|しません|しない|せず|を?回避|に(?:は)?該当しません)/g,
  /エスカレート(?:は|も)?\s*(?:不要|しません|しない|せず)/g,
  /PO\s*(?:へ|に)\s*(?:確認|相談|質問)\s*(?:は|も)?\s*不要/g,
  /(?:no need to|do(?:es)? not|don'?t|won'?t|without|(?:should|must|shall|need)\s+not|not\s+going\s+to)\s+escalat\w*(?:\s+(?:this|it))?(?:\s+to\s+(?:the\s+)?PO)?/gi,
  /escalation\s+(?:is\s+)?(?:not\s+(?:required|needed|necessary)|unnecessary)/gi,
];

/**
 * 説明・引用文脈の抑制 (Codex TL blocker 2、re-review 反映): 「エスカレーションゲート」
 * 「エスカレーション文言」「escalation-consult」等の meta 名詞句はエスカレーション宣言ではない。
 * 行全体ではなく該当**語句のみ**を除去し、同一行に混在する実 intent
 * (例:「エスカレーションゲートを通した後、PO へ確認が必要です」) は検出を維持する。
 * fenced/inline code と blockquote 行は引用・例示として行単位で除外する。
 */
export const ESCALATION_META_PHRASE_PATTERNS: readonly RegExp[] = [
  /escalation-consult[\w-]*/gi,
  /エスカレーション(?:前相談)?\s*(?:ゲート|gate|文言|検出|パターン|regex|条件|類型)/g,
  /escalation\s+(?:gate|pattern|intent|detection|marker)s?/gi,
  // 報告・引用節 (「…エスカレーション…と書かれています」等) は規約の説明であり宣言ではない。
  // 報告動詞までを語句除去し、同一行の後続節にある実 intent (例「…ので、PO へ確認します」) は残す。
  /エスカレーション[^。\n]{0,40}?と(?:書かれ|書いて|記載され|定められ|規定され|述べられ)(?:て)?(?:い(?:ます|る)|あ(?:ります|る))?/g,
];

/** consult receipt を発行してよい provider (T0 壁打ち = Codex 側 Sol/frontier 経路のみ)。
 * `helix claude --role tl` の自己相談では発行しない (Codex TL blocker 1)。 */
export const CONSULT_RECEIPT_PROVIDERS: ReadonlySet<string> = new Set(["codex"]);

/** consult receipt を発行してよい委譲 role (T0 壁打ち経路)。一般 read-only role には発行しない。 */
export const CONSULT_RECEIPT_ROLES: ReadonlySet<string> = new Set(["tl"]);

export const CONSULT_RECEIPT_RELATIVE_PATH = join(".helix", "state", "sol-consult-receipt");
export const CONSULT_OVERRIDE_RELATIVE_PATH = join(
  ".helix",
  "state",
  "escalation-consult-override",
);

/** receipt の有効期間。エスカレーション検討と同一作業帯での壁打ちだけを有効とみなす。 */
export const CONSULT_RECEIPT_TTL_MS = 6 * 60 * 60 * 1000;

export interface ConsultReceipt {
  ts: string;
  provider: string;
  role: string;
  session_id?: string;
  task_digest?: string;
}

export interface EscalationGateResult {
  block: boolean;
  messages: string[];
}

function sha256Digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

/**
 * Claude Code transcript (JSONL) から最後の assistant メッセージの text を連結して返す。
 * 解析不能な行は無視する (fail-open)。
 */
export function extractLastAssistantText(transcriptRaw: string): string {
  let last = "";
  for (const line of transcriptRaw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (typeof parsed !== "object" || parsed === null) continue;
    const entry = parsed as { type?: string; message?: { content?: unknown } };
    if (entry.type !== "assistant") continue;
    const content = entry.message?.content;
    if (!Array.isArray(content)) continue;
    const texts = content
      .filter(
        (b): b is { type: string; text: string } =>
          typeof b === "object" &&
          b !== null &&
          (b as { type?: unknown }).type === "text" &&
          typeof (b as { text?: unknown }).text === "string",
      )
      .map((b) => b.text);
    if (texts.length > 0) last = texts.join("\n");
  }
  return last;
}

/** エスカレーション文言の検出。説明/引用/コード文脈と否定文脈を除去してから positive pattern を評価する。 */
export function detectEscalationIntent(text: string): boolean {
  if (!text) return false;
  // fenced code block / inline code / blockquote は宣言ではなく引用・例示 (行単位で除外)。
  let normalized = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "")
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join("\n");
  // meta 名詞句は語句のみ除去し、同一行の実 intent は残す。
  for (const meta of ESCALATION_META_PHRASE_PATTERNS) {
    normalized = normalized.replace(meta, "");
  }
  for (const negation of ESCALATION_NEGATION_PATTERNS) {
    normalized = normalized.replace(negation, "");
  }
  return ESCALATION_INTENT_PATTERNS.some((p) => p.test(normalized));
}

/**
 * receipt 判定の 4 状態 (B-1/B-3 再レビュー反映):
 * - missing: fail-close 継続 (block へ)
 * - unreadable: 解釈不能な破損 (JSON 不正・IO エラー・ts 解析不能)。運用障害なので fail-open + WARN
 * - unauthorized: 解釈できるが consult role/schema を満たさない (role ∉ CONSULT_RECEIPT_ROLES、
 *   provider/task_digest 欠落)。偽造・流用 receipt なので fail-close (block へ)
 * - ok: 検証済み receipt
 */
type ReceiptReadResult =
  | { status: "missing" }
  | { status: "unreadable" }
  | { status: "unauthorized"; detail: string }
  | { status: "ok"; receipt: ConsultReceipt };

const TASK_DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;

function readConsultReceipt(repoRoot: string): ReceiptReadResult {
  const path = join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH);
  // ENOENT (不存在) だけを missing = fail-close とし、権限等の stat/read エラーは
  // unreadable = fail-open へ倒す (existsSync はエラーを false に潰すため使わない)。
  try {
    statSync(path);
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT"
      ? { status: "missing" }
      : { status: "unreadable" };
  }
  let parsed: ConsultReceipt;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as ConsultReceipt;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT"
      ? { status: "missing" }
      : { status: "unreadable" };
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof parsed.ts !== "string" ||
    Number.isNaN(Date.parse(parsed.ts))
  ) {
    // 解釈不能な破損 (semantic invalid timestamp を含む) は運用障害として fail-open へ。
    return { status: "unreadable" };
  }
  if (typeof parsed.role !== "string" || !CONSULT_RECEIPT_ROLES.has(parsed.role)) {
    return { status: "unauthorized", detail: `role=${String(parsed.role)}` };
  }
  if (typeof parsed.provider !== "string" || !CONSULT_RECEIPT_PROVIDERS.has(parsed.provider)) {
    return { status: "unauthorized", detail: `provider=${String(parsed.provider)}` };
  }
  if (typeof parsed.task_digest !== "string" || !TASK_DIGEST_PATTERN.test(parsed.task_digest)) {
    // 正本 writer は必ず task digest を刻む。無い receipt は writer 経由でない (偽造/旧形式)。
    return { status: "unauthorized", detail: "task_digest missing" };
  }
  return { status: "ok", receipt: parsed };
}

export function isReceiptFresh(receipt: ConsultReceipt, now: Date): boolean {
  const ts = Date.parse(receipt.ts);
  if (Number.isNaN(ts)) return false;
  const age = now.getTime() - ts;
  return age >= 0 && age <= CONSULT_RECEIPT_TTL_MS;
}

/**
 * consult receipt を記録する。正本 writer = runtimeCommand の consult role (CONSULT_RECEIPT_ROLES)
 * --execute 成功時のみ。一般 read-only role には発行しない (B-1)。
 * 失敗しても throw しない (receipt 記録の失敗で委譲自体を落とさない)。
 */
export function recordConsultReceipt(
  repoRoot: string,
  receipt: { provider: string; role: string; session_id?: string; task?: string },
  now: Date = new Date(),
): boolean {
  if (!CONSULT_RECEIPT_PROVIDERS.has(receipt.provider)) return false;
  if (!CONSULT_RECEIPT_ROLES.has(receipt.role)) return false;
  try {
    const payload: ConsultReceipt = {
      ts: now.toISOString(),
      provider: receipt.provider,
      role: receipt.role,
      ...(receipt.session_id ? { session_id: receipt.session_id } : {}),
      ...(receipt.task ? { task_digest: sha256Digest(receipt.task) } : {}),
    };
    writeFileSync(join(repoRoot, CONSULT_RECEIPT_RELATIVE_PATH), `${JSON.stringify(payload)}\n`);
    return true;
  } catch {
    return false;
  }
}

/**
 * override 消費の transaction 委譲先。既定実装 (cli 側) は harness.db
 * guard_override_transactions への digest-only audit + one-shot marker consume を
 * commitOverrideUse で行う。テストでは stub を注入する。
 */
export type OverrideTransactionRunner = (input: {
  nonce: string;
  reason: string;
  subjectDigest: string;
}) => OverrideCommitResult;

export interface EscalationGateIo {
  readTranscript?: (path: string) => string | null;
  runOverrideTransaction?: OverrideTransactionRunner;
}

/** marker の内容と stat から nonce を作る (work-guard と同型、再利用を DB 側で block する)。 */
export function overrideMarkerNonce(repoRoot: string): {
  nonce: string;
  reason: string;
} | null {
  const path = join(repoRoot, CONSULT_OVERRIDE_RELATIVE_PATH);
  try {
    if (!existsSync(path)) return null;
    const reason = readFileSync(path, "utf8").trim();
    if (!reason) return null;
    const stat = statSync(path);
    return {
      nonce: sha256Digest(`escalation_consult:${stat.dev}:${stat.ino}:${stat.mtimeMs}:${reason}`),
      reason,
    };
  } catch {
    return null;
  }
}

/**
 * Stop hook 用ゲート評価。block=true のとき呼び出し側は exit 2 で停止をブロックする。
 */
export function evaluateEscalationConsultGate(
  input: { repoRoot: string; transcriptPath?: string; now?: Date },
  io: EscalationGateIo = {},
): EscalationGateResult {
  const now = input.now ?? new Date();
  const readTranscript =
    io.readTranscript ??
    ((path: string): string | null => {
      try {
        return existsSync(path) ? readFileSync(path, "utf8") : null;
      } catch {
        return null;
      }
    });
  if (!input.transcriptPath) return { block: false, messages: [] };
  const raw = readTranscript(input.transcriptPath);
  if (raw === null) return { block: false, messages: [] };
  const lastText = extractLastAssistantText(raw);
  if (!detectEscalationIntent(lastText)) return { block: false, messages: [] };

  const read = readConsultReceipt(input.repoRoot);
  if (read.status === "unreadable") {
    // 存在するのに読めない receipt は運用障害であり、escalation の妨害材料にしない (fail-open + surface)。
    return {
      block: false,
      messages: [
        "[escalation-consult] WARN: consult receipt が存在しますが読取/解析できません (fail-open)。receipt を確認してください。",
      ],
    };
  }
  if (read.status === "ok" && isReceiptFresh(read.receipt, now)) {
    return {
      block: false,
      messages: [
        `[escalation-consult] pass: Sol 壁打ち receipt (role=${read.receipt.role} @ ${read.receipt.ts}) を確認。`,
      ],
    };
  }
  const unauthorizedNote =
    read.status === "unauthorized"
      ? [`[escalation-consult] 拒否 receipt: 検証を満たしません (${read.detail})。`]
      : [];

  const marker = overrideMarkerNonce(input.repoRoot);
  if (marker !== null && io.runOverrideTransaction) {
    const transaction = io.runOverrideTransaction({
      nonce: marker.nonce,
      reason: marker.reason,
      subjectDigest: sha256Digest(lastText),
    });
    if (transaction.status === "allowed") {
      return {
        block: false,
        messages: [
          `[escalation-consult] override consumed (one-shot, audited): reason_digest=${sha256Digest(marker.reason)}`,
        ],
      };
    }
    return {
      block: true,
      messages: [
        `[escalation-consult] BLOCK: override marker は拒否されました (${transaction.status})。`,
      ],
    };
  }

  return {
    block: true,
    messages: [
      ...unauthorizedNote,
      "[escalation-consult] BLOCK: PO エスカレーション文言を検出しましたが、有効な Sol 壁打ち receipt がありません。",
      '先に T0 セカンドオピニオンを実行してください: helix codex --role tl --task "<エスカレーション候補の論点>" --execute',
      "壁打ちの結果 AI 側で解決できるなら、エスカレーションせず通常ゲートで進めてください。",
      `それでも PO 介入が必要 (charter §3: 不可逆操作 / L3 承認 / 要件の意味変更) なら receipt 付きで再送するか、${CONSULT_OVERRIDE_RELATIVE_PATH} へ理由を書いて override してください (one-shot、harness.db へ digest audit されます)。`,
    ],
  };
}
