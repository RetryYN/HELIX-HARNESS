import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath = "docs/design/helix/L3-requirements/technology-stack-authority.md";
const acceptancePath = "docs/test-design/helix/technology-stack-authority-acceptance.md";
const planPath = "docs/plans/PLAN-L3-50-technology-stack-authority.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

function yamlList(source: string, key: string): string[] {
  const match = source.match(new RegExp(`${key}:\\n((?:  - [^\\n]+\\n)+)`));
  expect(match, `${key} block`).not.toBeNull();
  return (
    match?.[1]
      .trim()
      .split("\n")
      .map((line) => line.replace(/^\s*-\s*/, "")) ?? []
  );
}

describe("TECH-STACK-FR-001 technology stack authority", () => {
  it("TECH-STACK-U-001: fixes the five stack dispositions", () => {
    const block = requirement.match(
      /technology_stack_dispositions:\n((?: {2}[a-z_]+: [a-z_]+\n)+)/,
    );
    expect(block).not.toBeNull();
    expect(block?.[1].trim().split("\n")).toEqual([
      "typescript_node: required_transactional_boundary",
      "  python: required_semantic_core",
      "  rust: optional_measured_component",
      "  go: optional_measured_component",
      "  bun: forbidden_active_surface",
    ]);
  });

  it("TECH-STACK-U-002: fixes the required stack field exact set", () => {
    expect(yamlList(requirement, "required_stack_fields")).toEqual([
      "runtime_id",
      "responsibility",
      "authority_layer",
      "version_policy",
      "current_version",
      "target_version",
      "support_window",
      "adoption_evidence",
      "compatibility_boundary",
      "migration_state",
      "rollback_target",
      "forbidden_surface",
      "owner",
      "unresolved_items",
    ]);
  });

  it("TECH-STACK-U-003: preserves Python semantic and Node transactional layered authority", () => {
    expect(requirement).toContain("Python意味コアとTypeScript／Node実行境界は同格の層別authority");
    expect(requirement).toContain(
      "transactional control plane、CLI、hook、Git/GitHub、DB commitはTypeScript strict＋Node.js LTS",
    );
    expect(requirement).toContain("Nodeが再検証して単一transaction commitする");
    expect(requirement).toContain(
      "DB path、credential、repository、`.helix/`、Git/GitHub write authorityを渡さない",
    );
  });

  it("TECH-STACK-U-004: binds TypeScript 7 migration without permanent dual authority", () => {
    expect(requirement).toContain("TypeScript 7 native compilerをtarget");
    expect(requirement).toContain("Current releaseを自動採用しない");
    expect(requirement).toContain(
      "current manifestの宣言range `^5.6.3`と\n  lock済みresolved version `5.9.3`を区別し、移行完了を先に主張しない",
    );
    expect(requirement).toContain("TypeScript 6と7を恒久的な二重authorityにしない");
    expect(requirement).toContain(
      "TypeScript 7 CLI、tsconfig、Biome、Vitest、tsx、compiler API consumer、Windows／Linux",
    );
  });

  it("TECH-STACK-U-005: requires measured evidence before Rust or Go adoption", () => {
    expect(requirement).toContain("Rust／Goをcurrent mandatory runtimeへ自動追加しない");
    expect(yamlList(requirement, "native_adoption_evidence")).toEqual([
      "same_fixture_benchmark",
      "measured_p95_improvement",
      "existing_owner_cannot_meet_contract",
      "responsibility_owner",
      "ipc_or_ffi_schema",
      "failure_isolation",
      "supply_chain_and_license",
      "sbom_and_artifact_digest",
      "multi_os_distribution",
      "rollback_target",
      "removal_trigger",
    ]);
    expect(requirement).toContain(
      "TypeScript 7 compilerがGo実装であることは、HELIXへGo runtimeを追加する根拠にならない",
    );
  });

  it("TECH-STACK-U-006: terminally excludes active Bun and separates fast from full gates", () => {
    expect(requirement).toContain(
      "Bunはcurrent、fallback、rollbackのいずれにもauthorityを持たない",
    );
    expect(requirement).toContain(
      "active dependency、lock、loader、CLI、hook、CI、setup、generation、fallback、rollback",
    );
    expect(requirement).toContain("current exampleのBunを0にする");
    expect(requirement).toContain(
      "PR preflightはimpact-selected test、TypeScript 7 native typecheck、Biome",
    );
    expect(requirement).toContain(
      "full regression、DB convergence、multi-OS、historical compatibilityはcandidate固定後",
    );
    expect(requirement).toContain("同じcandidateを非blockerで再実行しない");
  });

  it("TECH-STACK-U-007: keeps unresolved choices visible and implementation out of scope", () => {
    expect(requirement).toContain(
      "source: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/",
    );
    expect(requirement).toContain("source: https://nodejs.org/en/about/previous-releases");
    expect(requirement).toContain("source: https://www.python.org/downloads/release/python-3140/");
    expect(requirement.match(/verified_at: 2026-07-29/g)).toHaveLength(3);
    expect(requirement).toContain("現行manifestの移行完了証拠にはしない");
    expect(requirement).toContain("Node.js 26 Currentを自動採用しない");
    expect(requirement).toContain("exact patch、free-threaded、JIT採否はL5 evidenceまで未解決");
    const unresolvedBlock = requirement.match(
      /## §3 unresolved register 未解決台帳\n[\s\S]*?\n((?:- [^\n]+\n)+)\n## §4 非対象/,
    )?.[1];
    expect(unresolvedBlock?.trim().split("\n")).toEqual([
      "- TypeScript 7と現行toolingのprogrammatic API compatibility exact inventory。",
      "- Node.js 24 exact patchと`node:sqlite`のstability receipt。",
      "- Python 3.14 exact patch、lock形式、free-threaded／JIT採否。",
      "- preflight／full admissionの実測p95 baselineとcapacity別budget。",
      "- Rust／Goを必要とするbounded componentの有無。証拠がなければ`none`とする。",
    ]);
    expect(requirement).toContain("`package.json`、lock、CI、runtime、skill commandの更新");
    const planStatus = plan.match(/^status: (draft|confirmed)$/m)?.[1];
    expect(["draft", "confirmed"]).toContain(planStatus);
    expect(plan).toContain("behavior_contract_id: TECH-STACK-FR-001");
  });

  it("TECH-STACK-U-008: binds twelve positive and negative L10 oracles", () => {
    const ids = [...acceptance.matchAll(/`(TECH-STACK-AC-\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(
      Array.from(
        { length: 12 },
        (_, index) => `TECH-STACK-AC-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(acceptance).toContain("Rust nightly");
    expect(acceptance).toContain("PR pushごとに無条件full");
    expect(acceptance).toContain("「速そう」を根拠");
  });
});
