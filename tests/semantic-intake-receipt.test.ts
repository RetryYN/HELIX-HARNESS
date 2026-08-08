// PLAN-L7-526-psc-intake-receipt / U-PSC-005（#230 slice4、VDH-FR-001）。
// L8テスト設計スライス4表を機械検査する。
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildIntakeReceipt,
  computeInventoryDigest,
  type IntakeEntryV1,
  type IntakeReceiptInputV1,
} from "../src/semantic/semantic-intake-receipt";

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function entry(path: string, content = path): IntakeEntryV1 {
  return { path, digest: sha256(content) };
}

const CANONICAL_ENTRIES: IntakeEntryV1[] = [
  entry("17-design-harness-integration.md"),
  entry("design-harness/contract-01.md"),
  entry("design-harness/contract-02.md"),
  entry("schema/atom.schema.json"),
  entry("template/plan.md"),
];
// intermediate は canonical から 1 件欠け、canonical に無い 1 件を持つ（差異 2 件）。
// 同一 path の内容は byte 一致（L3 §1 の 10 対象 digest 一致に相当）。
const INTERMEDIATE_ENTRIES: IntakeEntryV1[] = [
  entry("17-design-harness-integration.md"),
  entry("design-harness/contract-01.md"),
  entry("schema/atom.schema.json"),
  entry("template/plan.md"),
  entry("stale/removed-note.md"),
];

function validInput(): IntakeReceiptInputV1 {
  return {
    schema_version: "psc-intake-receipt.v1",
    canonical_source: {
      filename: "docs/migration/source-packages/hybrid-core-rebaseline.zip",
      source_digest: sha256("canonical"),
      entry_count: CANONICAL_ENTRIES.length,
      entries: [...CANONICAL_ENTRIES],
      inventory_digest: computeInventoryDigest(CANONICAL_ENTRIES),
    },
    intermediate_source: {
      filename: "workspace-attachment.zip",
      source_digest: sha256("intermediate"),
      entry_count: INTERMEDIATE_ENTRIES.length,
      entries: [...INTERMEDIATE_ENTRIES],
      inventory_digest: computeInventoryDigest(INTERMEDIATE_ENTRIES),
    },
    divergence_rulings: [
      { entry_path: "design-harness/contract-02.md", ruling: "canonical_only_expected" },
      { entry_path: "stale/removed-note.md", ruling: "not_promoted" },
    ],
    atom_dispositions: [
      { atom_id: "ATOM-01", decision: "adopt", rationale: "Design HARNESS 意味コアの正本" },
      { atom_id: "ATOM-02", decision: "defer", rationale: "supply-chain gate 着地後に再判定" },
      {
        atom_id: "ATOM-03",
        decision: "reject",
        rationale: "旧 runtime 前提で現行 authority と不整合",
      },
    ],
    atom_ids: ["ATOM-01", "ATOM-02", "ATOM-03"],
  };
}

describe("semantic intake receipt (PLAN-L7-526)", () => {
  it("U-PSC-005: intakeをreceiptへ固定し、差異とdisposition未裁定をfail-closeする", () => {
    const green = buildIntakeReceipt(validInput());
    expect(green.ok, JSON.stringify(green).slice(0, 300)).toBe(true);
    if (!green.ok) return;
    const receipt = green.value;
    expect(receipt.schema_version).toBe("psc-intake-receipt.v1");
    expect(receipt.canonical_entry_count).toBe(CANONICAL_ENTRIES.length);
    expect(receipt.receipt_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    // 差異は canonical 側 1 件 + intermediate 側 1 件が全列挙され、裁定済みで green
    expect(receipt.divergences.map((d) => d.entry_path).sort()).toEqual([
      "design-harness/contract-02.md",
      "stale/removed-note.md",
    ]);
    expect(receipt.divergences.every((d) => d.ruling.length > 0)).toBe(true);

    // 決定性: entries / dispositions の宣言順を入れ替えた意味的同一入力は同一 receipt_digest
    const permuted = validInput();
    permuted.canonical_source.entries = [...CANONICAL_ENTRIES].reverse();
    const permutedIntermediate = permuted.intermediate_source;
    if (permutedIntermediate === undefined) throw new Error("fixture must declare intermediate");
    permuted.intermediate_source = {
      ...permutedIntermediate,
      entries: [...INTERMEDIATE_ENTRIES].reverse(),
    };
    permuted.divergence_rulings = [...validInput().divergence_rulings].reverse();
    permuted.atom_dispositions = [...validInput().atom_dispositions].reverse();
    permuted.atom_ids = [...validInput().atom_ids].reverse();
    const permutedResult = buildIntakeReceipt(permuted);
    expect(permutedResult.ok).toBe(true);
    if (permutedResult.ok) {
      expect(permutedResult.value.receipt_digest).toBe(receipt.receipt_digest);
    }

    // 宣言 entry_count 不一致は PSC_SCHEMA_INVALID
    const badCount = validInput();
    badCount.canonical_source.entry_count = 99;
    const badCountResult = buildIntakeReceipt(badCount);
    expect(badCountResult.ok).toBe(false);
    if (!badCountResult.ok) expect(badCountResult.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");

    // entry path の重複は PSC_SCHEMA_INVALID
    const dup = validInput();
    dup.canonical_source.entries = [...CANONICAL_ENTRIES, CANONICAL_ENTRIES[0] as IntakeEntryV1];
    dup.canonical_source.entry_count = dup.canonical_source.entries.length;
    dup.canonical_source.inventory_digest = computeInventoryDigest(dup.canonical_source.entries);
    const dupResult = buildIntakeReceipt(dup);
    expect(dupResult.ok).toBe(false);
    if (!dupResult.ok) expect(dupResult.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");

    // path 逸脱（絶対 path / `..` / percent-encode）は PSC_SCHEMA_INVALID
    for (const path of ["/etc/passwd", "../escape.md", "docs/%2e%2e/secret.md"]) {
      const traversal = validInput();
      traversal.canonical_source.entries = [...CANONICAL_ENTRIES.slice(0, 4), entry(path)];
      traversal.canonical_source.inventory_digest = computeInventoryDigest(
        traversal.canonical_source.entries,
      );
      const rejected = buildIntakeReceipt(traversal);
      expect(rejected.ok, path).toBe(false);
      if (!rejected.ok) expect(rejected.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
    }

    // masked mutation: entries 差替 + 宣言 inventory_digest 据え置きは PSC_DIGEST_MISMATCH
    const masked = validInput();
    masked.canonical_source.entries = [...CANONICAL_ENTRIES.slice(0, 4), entry("extra/added.md")];
    const maskedResult = buildIntakeReceipt(masked);
    expect(maskedResult.ok).toBe(false);
    if (!maskedResult.ok) expect(maskedResult.failures[0]?.code).toBe("PSC_DIGEST_MISMATCH");

    // 同一 path で内容がすり替わった差異（byte-level）も content_mismatch として全列挙し裁定を要求する
    // （review round1 Important#1 の恒久 oracle。L3 §1 の byte digest 照合に対応）
    const contentMismatch = validInput();
    const mismatchIntermediate = contentMismatch.intermediate_source;
    if (mismatchIntermediate === undefined) throw new Error("fixture must declare intermediate");
    const swapped: IntakeEntryV1[] = INTERMEDIATE_ENTRIES.map((item) =>
      item.path === "schema/atom.schema.json" ? entry(item.path, "tampered-content") : item,
    );
    contentMismatch.intermediate_source = {
      ...mismatchIntermediate,
      entries: swapped,
      inventory_digest: computeInventoryDigest(swapped),
    };
    const unruledMismatch = buildIntakeReceipt(contentMismatch);
    expect(unruledMismatch.ok).toBe(false);
    if (!unruledMismatch.ok) {
      expect(unruledMismatch.failures[0]?.code).toBe("PSC_INTAKE_UNRESOLVED");
    }
    // 裁定を与えれば green になり、side=content_mismatch として receipt へ固定される
    const ruledMismatch = { ...contentMismatch };
    ruledMismatch.divergence_rulings = [
      ...validInput().divergence_rulings,
      { entry_path: "schema/atom.schema.json", ruling: "superseded" },
    ];
    const ruledResult = buildIntakeReceipt(ruledMismatch);
    expect(ruledResult.ok, JSON.stringify(ruledResult).slice(0, 200)).toBe(true);
    if (ruledResult.ok) {
      const mismatch = ruledResult.value.divergences.find(
        (d) => d.entry_path === "schema/atom.schema.json",
      );
      expect(mismatch?.side).toBe("content_mismatch");
      expect(mismatch?.ruling).toBe("superseded");
      // 内容が異なる receipt は digest も異なる（content-blind でない）
      expect(ruledResult.value.receipt_digest).not.toBe(receipt.receipt_digest);
    }

    // 差異の裁定漏れは PSC_INTAKE_UNRESOLVED（漏れた分を全列挙）
    const unresolved = validInput();
    unresolved.divergence_rulings = [];
    const unresolvedResult = buildIntakeReceipt(unresolved);
    expect(unresolvedResult.ok).toBe(false);
    if (!unresolvedResult.ok) {
      expect(unresolvedResult.failures).toHaveLength(2);
      for (const failure of unresolvedResult.failures) {
        expect(failure.code).toBe("PSC_INTAKE_UNRESOLVED");
      }
    }

    // disposition を欠く atom も PSC_INTAKE_UNRESOLVED
    const missingDisposition = validInput();
    missingDisposition.atom_dispositions = validInput().atom_dispositions.slice(0, 2);
    const missingResult = buildIntakeReceipt(missingDisposition);
    expect(missingResult.ok).toBe(false);
    if (!missingResult.ok) {
      expect(missingResult.failures[0]?.code).toBe("PSC_INTAKE_UNRESOLVED");
    }

    // closed set 外の decision / ruling は PSC_SCHEMA_INVALID
    const badDecision = validInput();
    badDecision.atom_dispositions = [
      { atom_id: "ATOM-01", decision: "maybe" as never, rationale: "曖昧" },
      ...validInput().atom_dispositions.slice(1),
    ];
    const badDecisionResult = buildIntakeReceipt(badDecision);
    expect(badDecisionResult.ok).toBe(false);
    if (!badDecisionResult.ok) {
      expect(badDecisionResult.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
    }
    // rationale 空も裁定として不十分（PSC_SCHEMA_INVALID）
    const emptyRationale = validInput();
    emptyRationale.atom_dispositions = [
      { atom_id: "ATOM-01", decision: "adopt", rationale: "" },
      ...validInput().atom_dispositions.slice(1),
    ];
    expect(buildIntakeReceipt(emptyRationale).ok).toBe(false);

    // intermediate を canonical へ昇格させる入力（同一 source_digest 宣言）は fail-close
    const promoted = validInput();
    const promotedIntermediate = promoted.intermediate_source;
    if (promotedIntermediate === undefined) throw new Error("fixture must declare intermediate");
    promoted.intermediate_source = {
      ...promotedIntermediate,
      source_digest: promoted.canonical_source.source_digest,
    };
    const promotedResult = buildIntakeReceipt(promoted);
    expect(promotedResult.ok).toBe(false);
    if (!promotedResult.ok) {
      expect(promotedResult.failures[0]?.code).toBe("PSC_INTAKE_UNRESOLVED");
    }

    // intermediate 不在（canonical のみ）でも green（差異 0 件）
    const canonicalOnly = validInput();
    canonicalOnly.intermediate_source = undefined;
    canonicalOnly.divergence_rulings = [];
    const canonicalOnlyResult = buildIntakeReceipt(canonicalOnly);
    expect(canonicalOnlyResult.ok).toBe(true);
    if (canonicalOnlyResult.ok) {
      expect(canonicalOnlyResult.value.divergences).toEqual([]);
    }

    // schema 不一致・非 record は PSC_SCHEMA_INVALID
    const badSchema = buildIntakeReceipt({
      ...validInput(),
      schema_version: "psc-intake-receipt.v0" as never,
    });
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("PSC_SCHEMA_INVALID");
    expect(buildIntakeReceipt("receipt" as never).ok).toBe(false);
  });
});
