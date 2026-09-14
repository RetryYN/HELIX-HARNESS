// PLAN-L7-523-ui-domain-cli / U-UDP-007（helix ui-domain 検査表面）
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import type { RegistryNodeV1 } from "../src/design/design-registry";
import { evaluateUiDomainBundle } from "../src/design/ui-domain-pattern-profile";
import {
  UI_DOMAIN_ENTITIES,
  uiEntity,
  validContract,
  validPack,
  validProfile,
} from "./tools/ui-domain-fixture";

const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");
const tsxLoaderUrl = pathToFileURL(
  join(repoRoot, "node_modules", "tsx", "dist", "loader.mjs"),
).href;

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", tsxLoaderUrl, cliPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    timeout: 45_000,
    maxBuffer: 16 * 1024 * 1024,
  });
}

function registryNode(entity_id: string, kind: RegistryNodeV1["kind"]): RegistryNodeV1 {
  return {
    entity_id,
    kind,
    atom_role: null,
    service_role: null,
    revision: 1,
    authority: "canonical",
    semantic_digest: `sha256:${"0".repeat(64)}`,
    source_pointer: "docs/design/harness/L2-screen/screen-list.md",
  };
}

function validBundle(): Record<string, unknown> {
  return {
    schema_version: "ui-domain-bundle.v1",
    domain: {
      schema_version: "ui-domain-declaration.v1",
      entities: UI_DOMAIN_ENTITIES.map(uiEntity),
    },
    contract: validContract(),
    profile: validProfile(),
    pack: validPack(),
    graph: {
      nodes: [
        registryNode("SCR-pm-01", "screen"),
        registryNode("FLW-approve", "flow"),
        registryNode("CMP-approve-button", "component"),
        registryNode("TOK-color-primary", "design_token"),
        registryNode("CNT-approve-label", "content"),
      ],
      edges: [],
      graph_digest: `sha256:${"1".repeat(64)}`,
    },
    pairwise: {
      schema_version: "ui-pairwise-input.v1",
      axes: {
        device: ["desktop", "mobile"],
        input: ["pointer", "touch"],
        role: ["admin", "member"],
        locale: ["ja", "en"],
        data_volume: ["empty", "typical"],
        network: ["fast", "offline"],
        concurrent_update: ["none", "rival"],
        destructive_undo: ["none", "destructive"],
      },
      risk_matrix: [{ levels: { device: "mobile", network: "offline" }, risk_class: "high" }],
      mode: "pairwise",
    },
  };
}

describe("U-UDP-007 helix ui-domain 検査表面 (PLAN-L7-523)", () => {
  it("U-UDP-007: 全section greenでok・決定的report、section逸脱は当該sectionへ帰属しfail-close", () => {
    // green: 全 section が評価され ok、report_digest は決定的
    const green = evaluateUiDomainBundle(validBundle());
    expect(green.ok, JSON.stringify(green).slice(0, 300)).toBe(true);
    if (!green.ok) return;
    const report = green.value;
    expect(report.schema_version).toBe("ui-domain-cli.v1");
    expect(report.sections.map((s) => s.section)).toEqual([
      "domain",
      "contract",
      "profile",
      "pack",
      "trace",
      "pairwise",
    ]);
    for (const section of report.sections) expect(section.ok).toBe(true);
    expect(report.report_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    const again = evaluateUiDomainBundle(validBundle());
    expect(again).toEqual(green);

    // 任意 section は省略可: domain のみの bundle も ok（評価 section は domain のみ）
    const domainOnly = evaluateUiDomainBundle({
      schema_version: "ui-domain-bundle.v1",
      domain: (validBundle() as { domain: unknown }).domain,
    });
    expect(domainOnly.ok).toBe(true);
    if (domainOnly.ok) {
      expect(domainOnly.value.sections.map((s) => s.section)).toEqual(["domain"]);
    }

    // section 逸脱の帰属: contract 競合 + pack 混入を同時に入れると、両 section が
    // fail として並記され、他 section の green を潰さない
    const bad = validBundle();
    (bad.contract as ReturnType<typeof validContract>).forbidden = [
      { target_kind: "ui_component", target_id: "CMP-approve-button", condition: "visible" },
    ];
    (bad.pack as ReturnType<typeof validPack>).rules = [
      {
        rule_id: "RULE-brand-leak",
        target_kind: "ui_component",
        constraint: "color",
        value: "#0a5cff",
      },
    ];
    const mixed = evaluateUiDomainBundle(bad);
    expect(mixed.ok).toBe(true);
    if (mixed.ok) {
      const bySection = new Map(mixed.value.sections.map((s) => [s.section, s]));
      expect(mixed.value.bundle_ok).toBe(false);
      expect(bySection.get("contract")?.ok).toBe(false);
      expect(bySection.get("pack")?.ok).toBe(false);
      expect(bySection.get("domain")?.ok).toBe(true);
      expect(bySection.get("pairwise")?.ok).toBe(true);
      expect((bySection.get("contract")?.failures.length ?? 0) > 0).toBe(true);
    }

    // trace 逸脱（graph から SCR node を欠落）も trace section へ帰属
    const traceBad = validBundle();
    (traceBad.graph as { nodes: unknown[] }).nodes = (
      traceBad.graph as { nodes: RegistryNodeV1[] }
    ).nodes.filter((node) => node.entity_id !== "SCR-pm-01");
    const traceResult = evaluateUiDomainBundle(traceBad);
    expect(traceResult.ok).toBe(true);
    if (traceResult.ok) {
      const trace = traceResult.value.sections.find((s) => s.section === "trace");
      expect(trace?.ok).toBe(false);
      expect(trace?.failures[0]?.code).toBe("UDP_TRACE_UNBOUND");
      expect(traceResult.value.bundle_ok).toBe(false);
    }

    // 必須ネスト field 欠落（schema_version は正しい）は section-malformed の typed failure で
    // fail-close し、他 section の評価結果を握り潰さない（review round1 probe523_2 の恒久 oracle）
    const malformedCases: [string, Record<string, unknown>][] = [
      ["contract", { schema_version: "ui-pattern-contract.v1", pattern_id: "PTN-x" }],
      ["profile", { schema_version: "ui-profile.v1", profile_id: "PRF-x" }],
      ["pack", { schema_version: "ui-common-rule-pack.v1", pack_id: "PACK-x" }],
      ["trace", null as never],
      ["pairwise", { schema_version: "ui-pairwise-input.v1", mode: "pairwise" }],
    ];
    for (const [section, payload] of malformedCases) {
      const bundleKey = section === "trace" ? "graph" : section;
      const malformed = { ...validBundle(), [bundleKey]: payload };
      const evaluated = evaluateUiDomainBundle(malformed);
      expect(evaluated.ok, `section=${section} must not throw`).toBe(true);
      if (evaluated.ok) {
        const bySection = new Map(evaluated.value.sections.map((s) => [s.section, s]));
        expect(bySection.get(section as never)?.ok, section).toBe(false);
        expect(bySection.get(section as never)?.failures[0]?.code).toBe("UDP_STALE_INPUT");
        expect(bySection.get("domain")?.ok, `domain green preserved for ${section}`).toBe(true);
        expect(evaluated.value.bundle_ok).toBe(false);
      }
    }

    // report_digest は pass/fail 形状だけでなく実内容を反映する: 中身の異なる green bundle は
    // 異なる digest（review round1 probe523_3 の恒久 oracle）
    const domainA = evaluateUiDomainBundle({
      schema_version: "ui-domain-bundle.v1",
      domain: {
        schema_version: "ui-domain-declaration.v1",
        entities: [uiEntity({ entity_id: "CMP-alpha", kind: "ui_component" })],
      },
    });
    const domainB = evaluateUiDomainBundle({
      schema_version: "ui-domain-bundle.v1",
      domain: {
        schema_version: "ui-domain-declaration.v1",
        entities: [uiEntity({ entity_id: "CMP-beta", kind: "ui_component" })],
      },
    });
    expect(domainA.ok && domainB.ok).toBe(true);
    if (domainA.ok && domainB.ok) {
      expect(domainA.value.report_digest).not.toBe(domainB.value.report_digest);
      expect(domainA.value.sections[0]?.value_digest).toMatch(/^sha256:/);
    }

    // bundle schema 不一致・非 record は UDP_STALE_INPUT
    const badSchema = evaluateUiDomainBundle({ schema_version: "ui-domain-bundle.v0" });
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
    const notRecord = evaluateUiDomainBundle("bundle");
    expect(notRecord.ok).toBe(false);
    if (!notRecord.ok) expect(notRecord.failures[0]?.code).toBe("UDP_STALE_INPUT");
    // domain 欠落も UDP_STALE_INPUT（domain は必須 section）
    const noDomain = evaluateUiDomainBundle({ schema_version: "ui-domain-bundle.v1" });
    expect(noDomain.ok).toBe(false);
    if (!noDomain.ok) expect(noDomain.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });

  it("CLI 表面: green bundleでexit 0 + schema付きJSON、fail bundleでexit 1、file欠落でexit 1", () => {
    const dir = mkdtempSync(join(tmpdir(), "ui-domain-cli-"));
    try {
      const greenPath = join(dir, "green.json");
      writeFileSync(greenPath, JSON.stringify(validBundle()));
      const greenRun = runCli(["ui-domain", "check", "--input", greenPath, "--json"]);
      expect(greenRun.status, greenRun.stderr).toBe(0);
      const greenJson = JSON.parse(greenRun.stdout) as {
        schema_version: string;
        source_command: string;
        bundle_ok: boolean;
        sections: { section: string; ok: boolean }[];
      };
      expect(greenJson.schema_version).toBe("ui-domain-cli.v1");
      expect(greenJson.source_command).toBe("helix ui-domain check --json");
      expect(greenJson.bundle_ok).toBe(true);
      expect(greenJson.sections.length).toBe(6);

      const bad = validBundle();
      (bad.pairwise as { mode: string }).mode = "cartesian";
      const badPath = join(dir, "bad.json");
      writeFileSync(badPath, JSON.stringify(bad));
      const badRun = runCli(["ui-domain", "check", "--input", badPath, "--json"]);
      expect(badRun.status).toBe(1);
      const badJson = JSON.parse(badRun.stdout) as {
        bundle_ok: boolean;
        sections: { section: string; ok: boolean; failures: { code: string }[] }[];
      };
      expect(badJson.bundle_ok).toBe(false);
      const pairwise = badJson.sections.find((s) => s.section === "pairwise");
      expect(pairwise?.ok).toBe(false);
      expect(pairwise?.failures[0]?.code).toBe("UDP_CARTESIAN_EXPLOSION");

      const missingRun = runCli([
        "ui-domain",
        "check",
        "--input",
        join(dir, "nope.json"),
        "--json",
      ]);
      expect(missingRun.status).toBe(1);
      expect(missingRun.stderr).toContain("ui-domain-cli.v1");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});
