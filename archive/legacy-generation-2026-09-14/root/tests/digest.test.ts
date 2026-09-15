// @helix-repo-wide-guard
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scanDigestInventory } from "../src/lint/digest-inventory";
import { canonicalJson, compareBytewise, sha256Digest } from "../src/runtime/digest";

describe("digest canonicalization authority", () => {
  it("[PLAN-L7-438-digest-canonicalization-authority/U-DIGEST-001] preserves SHA-256 bytes", () => {
    expect(sha256Digest("HELIX")).toBe(
      `sha256:${createHash("sha256").update("HELIX").digest("hex")}`,
    );
    expect(sha256Digest(new TextEncoder().encode("HELIX"))).toBe(sha256Digest("HELIX"));
  });
  it("[PLAN-L7-438-digest-canonicalization-authority/U-DIGEST-002] sorts object keys and preserves arrays", () => {
    expect(canonicalJson({ z: [2, 1], a: true })).toBe('{"a":true,"z":[2,1]}');
  });
  it("[PLAN-L7-438-digest-canonicalization-authority/U-DIGEST-003] rejects non-JSON values", () => {
    expect(() => canonicalJson({ bad: undefined })).toThrow("not JSON");
    expect(() => canonicalJson({ bad: Number.NaN })).toThrow("not JSON");
    expect(() => canonicalJson({ bad: () => undefined })).toThrow("not JSON");
    expect(() => canonicalJson({ bad: Symbol("bad") })).toThrow("not JSON");
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalJson(cyclic)).toThrow("not JSON");
  });
  it("[PLAN-L7-438-digest-canonicalization-authority/U-DIGEST-005] inventory is an exact production hit set", () => {
    const inventory = JSON.parse(
      readFileSync("config/digest-canonicalization-inventory.json", "utf8"),
    ) as {
      schema_version: string;
      variants: string[];
      rows: Array<{
        hit_id: string;
        path: string;
        variant: string;
        disposition: string;
        rationale: string;
        expected_test: string;
        citation: string;
      }>;
    };
    const actual = scanDigestInventory(process.cwd());
    expect(inventory.schema_version).toBe("digest-inventory.v3");
    expect(inventory.rows).toEqual(actual);
    expect(new Set(inventory.rows.map((row) => row.hit_id)).size).toBe(inventory.rows.length);
    expect(
      inventory.rows.every(
        (row) =>
          inventory.variants.includes(row.variant) &&
          ["typed_utility", "explicit_nonmigration"].includes(row.disposition) &&
          row.rationale.includes(row.path) &&
          row.expected_test.length > 0 &&
          row.citation.length > 0,
      ),
    ).toBe(true);
    expect(new Set(inventory.rows.map((row) => row.rationale)).size).toBe(inventory.rows.length);
    expect(
      inventory.rows.every((row) =>
        readFileSync(row.expected_test, "utf8").includes(
          `[PLAN-L7-438-digest-canonicalization-authority/${row.citation}]`,
        ),
      ),
    ).toBe(true);
  });
  it("[PLAN-L7-438-digest-canonicalization-authority/IT-DIGEST-001] binds migrated consumers to exact citations and bytes", () => {
    const inventory = JSON.parse(
      readFileSync("config/digest-canonicalization-inventory.json", "utf8"),
    ) as {
      rows: Array<{ path: string; disposition: string; expected_test: string; citation: string }>;
    };
    const migrated = inventory.rows.filter((row) => row.disposition === "typed_utility");
    expect(migrated.map((row) => row.path).sort()).toEqual(
      [
        "src/runtime/agent-ssot-runtime-projection.ts",
        "src/runtime/atomic-slice-admission.ts",
        "src/runtime/change-package-delta-archive.ts",
        "src/runtime/constitution-template-stack.ts",
        "src/runtime/retirement-preserve.ts",
      ].sort(),
    );
    expect(
      migrated.every(
        (row) =>
          row.citation === "U-DIGEST-004" && readFileSync(row.expected_test, "utf8").length > 0,
      ),
    ).toBe(true);
    expect(sha256Digest("HELIX")).toBe(
      "sha256:10506a073fae9cedc521ae88bdc5110e7d1aae297bcbe89dfcdaa62cbcb4dc6e",
    );
  });
  it("[PLAN-L7-438-digest-canonicalization-authority/U-DIGEST-006] handover lint boundary has no runtime digest dependency", () => {
    const source = readFileSync("src/lint/handover-resurrection.ts", "utf8");
    expect(source).not.toContain('from "../runtime/digest"');
    expect(source).not.toContain('from "node:crypto"');
  });
  it("AST scanner ignores comments/strings, admits literal SHA-256, and rejects dynamic algorithms", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-digest-ast-"));
    try {
      mkdirSync(join(root, "src"));
      writeFileSync(
        join(root, "src", "fixture.ts"),
        `import { createHash as hash } from "node:crypto";\n// createHash("sha256")\nconst text='createHash("sha256")';\nexport const ok=()=>hash("sha-256").update("x").digest("hex");`,
      );
      expect(scanDigestInventory(root)).toHaveLength(1);
      writeFileSync(
        join(root, "src", "dynamic.ts"),
        `import { createHash } from "node:crypto"; const algorithm=getAlgorithm(); createHash(algorithm);`,
      );
      expect(() => scanDigestInventory(root)).toThrow("unknown digest algorithm");
      writeFileSync(
        join(root, "src", "local.ts"),
        `function createHash(value:string){return value}; createHash("sha256");`,
      );
      writeFileSync(
        join(root, "src", "runtime.mutant-fixture.ts"),
        `import { createHash } from "node:crypto"; createHash("sha256");`,
      );
      rmSync(join(root, "src", "dynamic.ts"));
      expect(scanDigestInventory(root)).toHaveLength(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-DIGEST-010: compareBytewiseはlocaleCompareが誤る2条件をcode-point順で解決する", () => {
    const NUL = String.fromCharCode(0);

    // 1. 既定 locale ですら code-point 順と符号が逆になる (Issue #309)。
    expect("aCode".localeCompare("BCode")).toBeLessThan(0);
    expect(compareBytewise("aCode", "BCode")).toBeGreaterThan(0);

    // 2. U+0000 は completely-ignorable のため、複合キーの区切りとして機能しない。
    //    異なる (code, pointer, message) 分割が照合上は等価になり、comparator が 0 を返す。
    //    0 を返すと Array#sort の安定性で入力順が残り、整列が入力順依存になる。
    const left = `AB${NUL}z`;
    const right = `A${NUL}Bz`;
    expect(left.localeCompare(right)).toBe(0);
    expect(compareBytewise(left, right)).not.toBe(0);
  });

  it("U-DIGEST-011: compareBytewiseは全順序として整合する", () => {
    const values = [
      "",
      "A",
      "B",
      "a",
      "ab",
      "a-b",
      `a${String.fromCharCode(0)}b`,
      "あ",
      "🐙",
      "\uD800",
      "\uD801",
    ];
    for (const left of values) {
      expect(compareBytewise(left, left)).toBe(0);
      for (const right of values) {
        // Object.is が 0 と -0 を区別するため、=== で符号の反対称性だけを見る。
        expect(
          Math.sign(compareBytewise(left, right)) === -Math.sign(compareBytewise(right, left)),
        ).toBe(true);
      }
    }
    const sorted = [...values].sort(compareBytewise);
    expect([...values].reverse().sort(compareBytewise)).toEqual(sorted);

    // UTF-8のU+FFFD置換で同じbyte列になるlone surrogateも、入力順に依らず区別する。
    const forward = ["\uD801", "\uD800"];
    expect(compareBytewise("\uD800", "\uD801")).toBeLessThan(0);
    expect([...forward].sort(compareBytewise)).toEqual(["\uD800", "\uD801"]);
    expect([...forward].reverse().sort(compareBytewise)).toEqual(["\uD800", "\uD801"]);
  });
});
