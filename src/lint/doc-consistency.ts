/**
 * Doc consistency lint (A-58 ledger、4 つ目の lint)。
 * doc 間整合を機械検証 = L3 到達までの手動 audit (A-51/52/54) の自動化。
 * PO 指摘「ドキュメント間の整合性チェックを自動化できるか」反映。requirements §1.10.G.11。
 *
 * 第1弾 = 現状 clean な 3 チェック (g3-trace/entity-coverage/fr-registry に続く net-new):
 *  1. carry-consistency : L3 functional §3 の L4 carry 宣言 FR-L1 が §3.1 詳細表に全件存在 (A-54 carry 不整合)
 *  2. screen-id-validity: functional §1 「対応画面」列の画面 ID が screen で実在定義 (誤参照検出)
 *  3. nfr-count        : nfr.md header 件数宣言と実 NFR 定義数の一致 (A-54 doc 件数誤りの汎用版起点)
 *
 * 第2弾候補 (G.11 spec 済、本実装では未): doc-count 全 sub-doc 汎用 / id-uniqueness (意味的) /
 *  frontmatter-path 実在 / plan-id-schema (現状 PLAN debt を surface)。
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");

const SCREEN_ID_REGEX = /\b(?:PM|HM|GD)-\d{2}\b/g;
const NFR_ROW_REGEX = /\|\s*\*\*NFR-(\d{2})\*\*\s*\|/g;
const PACK_DISTRIBUTION_REMOTE_URL =
  "https://github.com/unison-ai-product/UT-TDD_AGENT-HARNESS-Pack.git";
const SETUP_VERSION_UP_TARGET = "v0.1.4";
const SETUP_VERSION_UP_COMMAND = `ut-tdd version-up dry-run --current v0.1.0 --target ${SETUP_VERSION_UP_TARGET} --release-remote ${PACK_DISTRIBUTION_REMOTE_URL} --json`;
const STALE_SETUP_VERSION_UP_TARGET_REGEX =
  /ut-tdd version-up dry-run --current v0\.1\.0 --target (v\d+\.\d+\.\d+)(?:\s|`)/g;

export interface DocConsistencySource {
  l1Functional: string;
  l3Functional: string;
  l3HelixPillar: string;
  l6SetupSoloTeam: string;
  l7UnitTestDesign: string;
  setupIndex: string;
  setupTemplates: string;
  doctorIndex: string;
  screen: string;
  nfr: string;
}

// A-120 I-5: repoRoot 注入可 (default = ROOT で挙動保存)。
export function loadDocConsistencyDocs(repoRoot: string = ROOT): DocConsistencySource {
  const read = (p: string) => readFileSync(resolve(repoRoot, p), "utf-8");
  return {
    l1Functional: read("docs/design/harness/L1-requirements/functional-requirements.md"),
    l3Functional: read("docs/design/harness/L3-functional/functional-requirements.md"),
    l3HelixPillar: read("docs/design/helix/L3-requirements/pillar-functional-requirements.md"),
    l6SetupSoloTeam: read("docs/design/harness/L6-function-design/setup-solo-team.md"),
    l7UnitTestDesign: read("docs/test-design/harness/L7-unit-test-design.md"),
    setupIndex: read("src/setup/index.ts"),
    setupTemplates: read("src/setup/templates.ts"),
    doctorIndex: read("src/doctor/index.ts"),
    screen: read("docs/design/harness/L1-requirements/screen-requirements.md"),
    nfr: read("docs/design/harness/L1-requirements/nfr.md"),
  };
}

/**
 * FR-L1 参照を数値集合へ展開。slash リスト「23/24/25」と range「31〜35」の両記法を解釈。
 * 例: "FR-L1-37/39/40" → {37,39,40} / "FR-L1-31〜35" → {31,32,33,34,35}
 */
export function expandFrL1Refs(text: string): Set<number> {
  const nums = new Set<number>();
  for (const m of text.matchAll(/FR-L1-(\d+(?:[/〜～]\d+)*)/g)) {
    for (const part of m[1].split("/")) {
      const range = part.match(/^(\d+)[〜～](\d+)$/);
      if (range) {
        for (let n = Number.parseInt(range[1], 10); n <= Number.parseInt(range[2], 10); n++) {
          nums.add(n);
        }
      } else {
        const n = Number.parseInt(part, 10);
        if (!Number.isNaN(n)) nums.add(n);
      }
    }
  }
  return nums;
}

function frL1Id(n: number): string {
  return `FR-L1-${n.toString().padStart(2, "0")}`;
}

/**
 * 1. carry-consistency: §3 carry 宣言 table のうち「純 L4 carry」(Phase B / L3 直接詳細化 / 委譲 を除く)
 * 行の FR-L1 が §3.1 詳細表に全件存在するか。A-54「§3 宣言済だが §3.1 から漏れ」の再発防止。
 */
export function checkCarryConsistency(l3Functional: string): {
  required: number[];
  orphans: string[];
} {
  const s3 = l3Functional.match(/## §3 carry 宣言[\s\S]*?(?=\n### §3\.1)/)?.[0] ?? "";
  const s31 = l3Functional.match(/### §3\.1 [\s\S]*?(?=\n### §3\.2|\n## §)/)?.[0] ?? "";
  const required = new Set<number>();
  for (const line of s3.split("\n")) {
    if (!line.includes("FR-L1-") || !line.includes("L4 carry")) continue;
    // 純 L4 carry のみ要求 (混在分類は §3.1 必須対象外、false positive 回避)
    if (line.includes("Phase B") || line.includes("直接詳細化") || line.includes("委譲")) continue;
    for (const n of expandFrL1Refs(line)) required.add(n);
  }
  const detailed = expandFrL1Refs(s31);
  const orphans = [...required]
    .filter((n) => !detailed.has(n))
    .sort((a, b) => a - b)
    .map(frL1Id);
  return { required: [...required].sort((a, b) => a - b), orphans };
}

/**
 * 2. screen-id-validity: functional §1 機能一覧「対応画面」列に現れる画面 ID が
 * screen sub-doc で定義済み (SSoT) か。存在しない画面 ID への参照を検出。
 */
export function checkScreenIdValidity(
  l1Functional: string,
  screen: string,
): { definedScreens: string[]; referenced: string[]; orphans: string[] } {
  const defined = new Set((screen.match(SCREEN_ID_REGEX) ?? []).map((s) => s));
  const sec = l1Functional.match(/## §1 機能一覧[\s\S]*?(?=\n### §1\.1)/)?.[0] ?? "";
  const referenced = new Set((sec.match(SCREEN_ID_REGEX) ?? []).map((s) => s));
  const orphans = [...referenced].filter((s) => !defined.has(s)).sort();
  return {
    definedScreens: [...defined].sort(),
    referenced: [...referenced].sort(),
    orphans,
  };
}

/**
 * 3. nfr-count: nfr.md header の件数確定宣言 (計 N 件) と実 NFR 定義数 (unique 行 leader) の一致。
 * A-54 doc 件数誤りの汎用化起点 (将来 BR/AT/AC へ拡張)。
 */
export function checkNfrCount(nfr: string): {
  declared: number | null;
  actual: number;
  mismatch: boolean;
} {
  const declMatch = nfr.match(/計\s*(\d+)\s*件/);
  const declared = declMatch ? Number.parseInt(declMatch[1], 10) : null;
  const ids = new Set<string>();
  for (const m of nfr.matchAll(NFR_ROW_REGEX)) ids.add(m[1]);
  const actual = ids.size;
  return { declared, actual, mismatch: declared !== null && declared !== actual };
}

export function checkHelixSetupReviewBundleConsistency(docs: {
  l3HelixPillar: string;
  l6SetupSoloTeam: string;
}): { missing: string[] } {
  const required: Array<{ id: string; text: string; pattern: RegExp }> = [
    {
      id: "l3-hac-p6-03a-review-bundle-command",
      text: docs.l3HelixPillar,
      pattern: /ut-tdd completion review-bundle --json/,
    },
    {
      id: "l3-hac-p6-03a-semantic-digest",
      text: docs.l3HelixPillar,
      pattern: /semanticBundleDigest|semantic digest/,
    },
    {
      id: "l6-setup-verification-commands-review-bundle",
      text: docs.l6SetupSoloTeam,
      pattern:
        /postSetupWorkflow\.verificationCommands[\s\S]*ut-tdd completion review-bundle --json/,
    },
    {
      id: "l6-setup-verification-matrix-review-bundle",
      text: docs.l6SetupSoloTeam,
      pattern: /postSetupWorkflow\.verificationMatrix\[\][\s\S]*completion-review-bundle/,
    },
    {
      id: "l6-setup-consumer-doctor-ten-rows",
      text: docs.l6SetupSoloTeam,
      pattern: /consumer doctor[\s\S]*10 行/,
    },
    {
      id: "l6-setup-vscode-nine-tasks",
      text: docs.l6SetupSoloTeam,
      pattern: /期待 task 9 本[\s\S]*completion review-bundle/,
    },
    {
      id: "l6-setup-semantic-digest",
      text: docs.l6SetupSoloTeam,
      pattern: /semanticBundleDigest|semantic digest/,
    },
  ];
  const forbidden: Array<{ id: string; text: string; pattern: RegExp }> = [
    {
      id: "l6-setup-no-stale-nine-row-contract",
      text: docs.l6SetupSoloTeam,
      pattern: /first-run matrix 全9行|consumer doctor[\s\S]{0,80}9 行/,
    },
    {
      id: "l6-setup-no-stale-review-bundle-gap",
      text: docs.l6SetupSoloTeam,
      pattern:
        /completion decision-packet --json` (?:と|\/) `ut-tdd version-up|completion packet preflight(?:、| と )version-up/,
    },
  ];
  const missing = required.filter((row) => !row.pattern.test(row.text)).map((row) => row.id);
  const stale = forbidden.filter((row) => row.pattern.test(row.text)).map((row) => row.id);
  return { missing: [...missing, ...stale] };
}

export function checkHelixSetupVersionUpTargetConsistency(docs: {
  l3HelixPillar: string;
  l6SetupSoloTeam: string;
  l7UnitTestDesign: string;
  setupIndex: string;
  setupTemplates: string;
  doctorIndex: string;
}): { missing: string[] } {
  const required: Array<{ id: string; text: string; pattern: RegExp }> = [
    {
      id: "l3-helix-setup-version-up-pack-target",
      text: docs.l3HelixPillar,
      pattern: new RegExp(escapeRegExp(SETUP_VERSION_UP_COMMAND)),
    },
    {
      id: "l6-setup-version-up-pack-target",
      text: docs.l6SetupSoloTeam,
      pattern: new RegExp(escapeRegExp(SETUP_VERSION_UP_COMMAND)),
    },
    {
      id: "l7-setup-test-design-version-up-pack-target",
      text: docs.l7UnitTestDesign,
      pattern: new RegExp(escapeRegExp(SETUP_VERSION_UP_COMMAND)),
    },
    {
      id: "setup-index-version-up-target-derived-from-pack-latest",
      text: docs.setupIndex,
      pattern:
        /CONSUMER_VERSION_UP_DRY_RUN_COMMAND\s*=\s*`ut-tdd version-up dry-run --current v0\.1\.0 --target \$\{PACK_DISTRIBUTION_REFERENCE\.latestTag\} --release-remote \$\{PACK_DISTRIBUTION_REMOTE_URL\} --json`/,
    },
    {
      id: "setup-index-pack-latest-tag",
      text: docs.setupIndex,
      pattern: /latestTag:\s*"v0\.1\.4"/,
    },
    {
      id: "setup-templates-version-up-pack-target",
      text: docs.setupTemplates,
      pattern: new RegExp(escapeRegExp(SETUP_VERSION_UP_COMMAND)),
    },
    {
      id: "doctor-version-up-pack-target",
      text: docs.doctorIndex,
      pattern: new RegExp(escapeRegExp(SETUP_VERSION_UP_COMMAND)),
    },
  ];
  const missing = required.filter((row) => !row.pattern.test(row.text)).map((row) => row.id);
  const stale = Object.entries(docs).flatMap(([sourceId, text]) =>
    [...text.matchAll(STALE_SETUP_VERSION_UP_TARGET_REGEX)]
      .filter((match) => match[1] !== SETUP_VERSION_UP_TARGET)
      .map((match) => `${sourceId}-stale-version-up-target-${match[1]}`),
  );
  return { missing: [...missing, ...stale] };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface DocConsistencyResult {
  carryOrphans: string[];
  carryRequired: number[];
  screenIdOrphans: string[];
  definedScreenCount: number;
  nfrCount: { declared: number | null; actual: number; mismatch: boolean };
  helixSetupReviewBundleMissing: string[];
  helixSetupVersionUpTargetMissing: string[];
}

export function analyzeDocConsistency(docs?: DocConsistencySource): DocConsistencyResult {
  const d = docs ?? loadDocConsistencyDocs();
  const carry = checkCarryConsistency(d.l3Functional);
  const screen = checkScreenIdValidity(d.l1Functional, d.screen);
  const nfr = checkNfrCount(d.nfr);
  return {
    carryOrphans: carry.orphans,
    carryRequired: carry.required,
    screenIdOrphans: screen.orphans,
    definedScreenCount: screen.definedScreens.length,
    nfrCount: nfr,
    helixSetupReviewBundleMissing: checkHelixSetupReviewBundleConsistency(d).missing,
    helixSetupVersionUpTargetMissing: checkHelixSetupVersionUpTargetConsistency(d).missing,
  };
}
