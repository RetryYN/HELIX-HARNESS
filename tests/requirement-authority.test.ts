import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkRequirementAuthority } from "../src/requirements/requirement-authority-gate";
import {
  loadCanonicalRequirementIrFromShards,
  renderRequirementGeneratedView,
} from "../src/requirements/requirement-generated-view";
import { requirementIrRootDigest } from "../src/requirements/requirement-ir-shadow";
import { openHarnessDb } from "../src/state-db";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

// PLAN-L7-490-requirement-json-authority-cutover

describe("Requirement JSON authority", () => {
  function withAuthorityFixture(
    mutate: (authority: Record<string, unknown>, fixtureRoot: string) => void,
    run: (repoRoot: string) => void,
  ): void {
    const sourceRoot = process.cwd();
    const fixtureRoot = mkdtempSync(join(tmpdir(), "helix-requirement-authority-"));
    try {
      mkdirSync(join(fixtureRoot, "config"));
      copyFileSync(
        join(sourceRoot, "config/requirement-ir-schema.json"),
        join(fixtureRoot, "config/requirement-ir-schema.json"),
      );
      cpSync(join(sourceRoot, "requirements-ir"), join(fixtureRoot, "requirements-ir"), {
        recursive: true,
      });
      const authority = JSON.parse(
        readFileSync(join(sourceRoot, "config/requirement-ir-authority.json"), "utf8"),
      ) as Record<string, unknown>;
      const authorityPaths = [
        ...((authority.compatibility_inputs as string[]) ?? []),
        ...((authority.generated_views as string[]) ?? []),
      ];
      for (const path of authorityPaths) {
        const destination = join(fixtureRoot, path);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(join(sourceRoot, path), destination);
      }
      mkdirSync(join(fixtureRoot, "src"));
      mutate(authority, fixtureRoot);
      writeFileSync(
        join(fixtureRoot, "config/requirement-ir-authority.json"),
        `${JSON.stringify(authority, null, 2)}\n`,
        "utf8",
      );
      run(fixtureRoot);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }

  it("U-RAC-001: accepts the canonical JSON, generated view, and pinned compatibility exact set", () => {
    expect(checkRequirementAuthority(process.cwd())).toEqual({
      ok: true,
      messages: ["requirement-authority - OK (canonical JSON, generated view, compatibility=4)"],
    });
    withAuthorityFixture(
      (authority, fixtureRoot) => {
        const compatibilityPath = (authority.compatibility_inputs as string[])[0] ?? "";
        writeFileSync(
          join(fixtureRoot, compatibilityPath),
          `${readFileSync(join(fixtureRoot, compatibilityPath), "utf8")}\ndrift\n`,
          "utf8",
        );
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("pinned compatibility digest differs");
      },
    );
  });

  it("U-RAC-002: fails closed when the authority packet cannot be loaded", () => {
    const result = checkRequirementAuthority("/path/that/does/not/exist");
    expect(result.ok).toBe(false);
    expect(result.messages.join("\n")).toContain("authority validation failed");
  });

  it("U-RAC-002b: kills a dual-authority policy mutation", () => {
    withAuthorityFixture(
      (authority) => {
        const policy = authority.consumer_policy as Record<string, unknown>;
        policy.dual_authority = "allowed";
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("authority validation failed");
      },
    );
  });

  it("U-RAC-002c: rejects rewriting the external frozen baseline receipt", () => {
    withAuthorityFixture(
      (authority) => {
        authority.frozen_baseline_root_digest = `sha256:${"0".repeat(64)}`;
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("authority validation failed");
      },
    );
  });

  it("U-RAC-003: loads the exact canonical denominator and stable root digest", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    expect([
      source.requirements.length,
      source.system_contracts.length,
      source.acceptance_cases.length,
      source.system_tests.length,
    ]).toEqual([153, 24, 72, 24]);
    expect(source.refinement_contracts.map((record) => record.refinement_contract_id)).toEqual([
      "MIC-FR-001",
      "CNW-FR-001",
      "DIST-LITE-FR-001",
      "SYN-FR-001",
    ]);
    expect(source.baseline_root_digest).toBe(
      "sha256:3351a371e2643af122882f65a52cc25c63269786bbd2c87d4e1115a46191eb75",
    );
    expect(source.root_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        const requirementsPath = join(fixtureRoot, "requirements-ir/requirements.json");
        writeFileSync(
          requirementsPath,
          readFileSync(requirementsPath, "utf8").replace(
            '"requirement_id": "HIL-BR-01"',
            '"requirement_id": "HIL-BR-MUTATED"',
          ),
          "utf8",
        );
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("requirements digest mismatch");
      },
    );
  });

  it("U-RAC-004: reproduces the generated Markdown byte-for-byte from canonical JSON", () => {
    expect(
      readFileSync("docs/generated/requirements/requirement-definition.generated.md", "utf8"),
    ).toBe(renderRequirementGeneratedView(loadCanonicalRequirementIrFromShards(process.cwd())));
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        const generatedView = join(
          fixtureRoot,
          "docs/generated/requirements/requirement-definition.generated.md",
        );
        writeFileSync(
          generatedView,
          `${readFileSync(generatedView, "utf8")}\nmanual edit\n`,
          "utf8",
        );
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("generated view differs from canonical JSON");
      },
    );
  });

  it("U-RAC-005: projects canonical rows and removes the retired shadow table", () => {
    const db = openHarnessDb(":memory:");
    try {
      expect(
        rebuildHarnessDb({ repoRoot: process.cwd(), db, runtimeLogPolicy: "exclude" }).findings,
      ).toEqual([]);
      expect(db.prepare("SELECT COUNT(*) AS value FROM requirement_ir").get()).toEqual({
        // 273 baseline/current rows + 82 refinement rows。
        value: 355,
      });
      expect(
        db
          .prepare(
            "SELECT COUNT(*) AS value FROM sqlite_master WHERE type='table' AND name='requirement_ir_shadow'",
          )
          .get(),
      ).toEqual({ value: 0 });
      expect(
        db
          .prepare(
            `SELECT COUNT(*) AS value
             FROM requirement_ir AS subject
             LEFT JOIN requirement_ir AS owner
               ON owner.record_id = subject.owner_id AND owner.record_kind = 'system_contract'
             LEFT JOIN requirement_ir AS oracle
               ON oracle.record_id = subject.oracle_id AND oracle.record_kind = 'system_test'
             WHERE subject.record_kind != 'system_test'
               AND (owner.record_id IS NULL OR oracle.record_id IS NULL)`,
          )
          .get(),
      ).toEqual({ value: 0 });
    } finally {
      db.close();
    }
  });

  it("U-RAC-006: keeps the legacy compiler migration-only and shadow artifacts retired", () => {
    const migration = readFileSync("src/requirements/requirement-ir-shadow-generator.ts", "utf8");
    expect(migration).toContain("requires an explicit output directory");
    expect(migration).toContain("migration shadow output path is forbidden");
    expect(
      existsSync("generated/requirements-ir") ? readdirSync("generated/requirements-ir") : [],
    ).toEqual([]);
    for (const forbiddenOutput of ["requirements-ir", "generated/requirements-ir"]) {
      const result = spawnSync(
        process.execPath,
        ["--import", "tsx", "src/requirements/requirement-ir-shadow-generator.ts", forbiddenOutput],
        { cwd: process.cwd(), encoding: "utf8" },
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("migration shadow output path is forbidden");
    }
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        writeFileSync(
          join(fixtureRoot, "src/rogue-legacy-reader.ts"),
          `readFileSync("docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md", "utf8");\n`,
          "utf8",
        );
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain(
          "semantic legacy Markdown read is outside migration allowlist",
        );
      },
    );
  });

  it("U-RAC-008: 合成pathのlegacy semantic readもfail-closeする (Issue #300)", () => {
    // 検出がpath literalの完全一致に依存していると、join()でpathを組み立てるだけで
    // legacy Markdownを意味読取しながらgateを回避できる。負例は「回避形」であり、
    // 素の literal 形（U-RAC-006）が通ることの再確認ではない。
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        writeFileSync(
          join(fixtureRoot, "src/rogue-synthesized-reader.ts"),
          [
            'import { readFileSync } from "node:fs";',
            'import { join } from "node:path";',
            'const AREA = "governance";',
            'const NAME = "infinity-loop-requirement-definition-ledger.md";',
            "export function read(root: string): string {",
            '  return readFileSync(join(root, "docs", AREA, NAME), "utf8");',
            "}",
            "",
          ].join("\n"),
          "utf8",
        );
      },
      (fixtureRoot) => {
        // fixture root は無関係な refinement drift violation を常に持つため、`ok === false`
        // だけでは本検査が効いた証拠にならない。違反 message が当該 file を名指すことを要求する。
        expect(checkRequirementAuthority(fixtureRoot).messages.join("\n")).toContain(
          "src/rogue-synthesized-reader.ts: semantic legacy Markdown read is outside migration allowlist",
        );
      },
    );

    // 解決できた接頭辞が前置される形（suffix 一致が要る経路）。上の負例は接頭辞が未解決の
    // identifier なので候補が compatibility path と完全一致し、suffix 一致を通らない。
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        writeFileSync(
          join(fixtureRoot, "src/rogue-absolute-prefix-reader.ts"),
          [
            'import { readFileSync } from "node:fs";',
            'import { join } from "node:path";',
            'const BASE = "/srv/helix";',
            'const AREA = "governance";',
            'const NAME = "infinity-loop-requirement-definition-ledger.md";',
            "export function read(): string {",
            '  return readFileSync(join(BASE, "docs", AREA, NAME), "utf8");',
            "}",
            "",
          ].join("\n"),
          "utf8",
        );
      },
      (fixtureRoot) => {
        expect(checkRequirementAuthority(fixtureRoot).messages.join("\n")).toContain(
          "src/rogue-absolute-prefix-reader.ts: semantic legacy Markdown read is outside migration allowlist",
        );
      },
    );

    // canonical JSON read と generated view read は誤検知しない。
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        writeFileSync(
          join(fixtureRoot, "src/legitimate-canonical-reader.ts"),
          [
            'import { readFileSync } from "node:fs";',
            'import { join } from "node:path";',
            "export function read(root: string): string {",
            '  return readFileSync(join(root, "requirements-ir", "manifest.json"), "utf8");',
            "}",
            "",
          ].join("\n"),
          "utf8",
        );
        writeFileSync(
          join(fixtureRoot, "src/legitimate-generated-view-reader.ts"),
          [
            'import { readFileSync } from "node:fs";',
            "export function read(): string {",
            "  return readFileSync(",
            '    "docs/generated/requirements/requirement-definition.generated.md",',
            '    "utf8",',
            "  );",
            "}",
            "",
          ].join("\n"),
          "utf8",
        );
      },
      (fixtureRoot) => {
        expect(checkRequirementAuthority(fixtureRoot).messages.join("\n")).not.toContain(
          "semantic legacy Markdown read is outside migration allowlist",
        );
      },
    );
  });

  it("U-RAC-007: kills a refinement contract ID collision with the frozen baseline", () => {
    withAuthorityFixture(
      (_authority, fixtureRoot) => {
        const shardPath = join(fixtureRoot, "requirements-ir/refinement_contracts.json");
        const records = JSON.parse(readFileSync(shardPath, "utf8")) as Record<
          string,
          Record<string, unknown>
        >;
        const source = records["MIC-FR-001"];
        if (!source) throw new Error("MIC-FR-001 fixture record missing");
        // baseline requirement ID を名乗る refinement を追加し、shard/root digest を整合させたまま
        // ID 衝突だけを gate が fail-close することを固定する。
        records["HIL-BR-01"] = { ...source, refinement_contract_id: "HIL-BR-01" };
        writeFileSync(shardPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
        const manifestPath = join(fixtureRoot, "requirements-ir/manifest.json");
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
          schema_version: string;
          authority: string;
          source_authority: string;
          baseline_root_digest: string;
          root_digest: string;
          shards: Array<{ kind: string; path: string; count: number; digest: string }>;
        };
        const entry = manifest.shards.find((shard) => shard.kind === "refinement_contracts");
        if (!entry) throw new Error("refinement_contracts shard entry missing");
        entry.count = Object.keys(records).length;
        entry.digest = `sha256:${createHash("sha256")
          .update(JSON.stringify(records), "utf8")
          .digest("hex")}`;
        const shardValues = (kind: string): unknown[] => {
          const shard = manifest.shards.find((candidate) => candidate.kind === kind);
          if (!shard) throw new Error(`${kind} shard entry missing`);
          return Object.values(
            JSON.parse(readFileSync(join(fixtureRoot, shard.path), "utf8")) as Record<
              string,
              unknown
            >,
          );
        };
        manifest.root_digest = requirementIrRootDigest({
          schema_version: manifest.schema_version,
          authority: manifest.authority,
          source_authority: manifest.source_authority,
          baseline_root_digest: manifest.baseline_root_digest,
          requirements: shardValues("requirements"),
          system_contracts: shardValues("system_contracts"),
          acceptance_cases: shardValues("acceptance_cases"),
          system_tests: shardValues("system_tests"),
          refinement_contracts: Object.values(records),
        });
        writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
      },
      (fixtureRoot) => {
        const result = checkRequirementAuthority(fixtureRoot);
        expect(result.ok).toBe(false);
        expect(result.messages.join("\n")).toContain("HIL-BR-01: REFINEMENT_DUPLICATE_ID");
      },
    );
  });
});
