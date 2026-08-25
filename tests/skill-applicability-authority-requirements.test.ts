import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath =
  "docs/design/helix/L3-requirements/skill-applicability-authority.md";
const registryPath =
  "docs/design/helix/L3-requirements/skill-applicability-registry.v1.json";
const acceptancePath =
  "docs/test-design/helix/skill-applicability-authority-acceptance.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
  authority: { source: string; source_digest: string };
  identity_reference: { registry_version: string; registry_source_digest: string };
  current_contract: {
    allowed_axes: string[];
    implicit_default: boolean;
    emit_legacy_identity: boolean;
  };
  legacy_input_adapter: {
    conversions: Array<{ token: string; target_axis: string; target_id: string }>;
    ambiguous_tokens: string[];
    emit_legacy_identity: boolean;
  };
};

describe("skill applicability requirements authority", () => {
  it("L3とL10を同じPLANとpairへ束縛する", () => {
    expect(requirement).toContain("plan: PLAN-L3-67-skill-applicability-authority");
    expect(acceptance).toContain("plan: PLAN-L3-67-skill-applicability-authority");
    expect(requirement).toContain(`pair_artifact: ${acceptancePath}`);
    expect(acceptance).toContain(`pair_artifact: ${requirementPath}`);
  });

  it("supporting requirementとacceptanceのexact setを閉じる", () => {
    expect(requirement.match(/#### SKAPP-R-\d{2}/g)).toHaveLength(6);
    expect(acceptance.match(/\| `SKAPP-AC-\d{3}`/g)).toHaveLength(10);
  });

  it("workflow分類の7軸を混同せずexact参照する", () => {
    expect(registry.current_contract.allowed_axes).toEqual([
      "development_style",
      "case_driven_model",
      "workflow_model",
      "specialist_workflow",
      "specialist_capability",
      "specialist_drive",
      "execution_mode",
    ]);
    expect(registry.current_contract.implicit_default).toBe(false);
    expect(registry.identity_reference).toEqual(expect.objectContaining({
      registry_version: "1.1.5",
      registry_source_digest:
        "sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db",
    }));
  });

  it("legacy入力を一意変換と曖昧拒否へ分離する", () => {
    expect(registry.legacy_input_adapter.conversions).toContainEqual({
      token: "discovery",
      target_axis: "case_driven_model",
      target_id: "DISCOVERY_POC",
    });
    expect(registry.legacy_input_adapter.ambiguous_tokens).toEqual(["forward", "scrum"]);
    expect(registry.legacy_input_adapter.emit_legacy_identity).toBe(false);
    expect(registry.current_contract.emit_legacy_identity).toBe(false);
  });

  it("registryをrequirements source digestへ束縛する", () => {
    const digest = createHash("sha256").update(requirement).digest("hex");
    expect(registry.authority).toEqual(expect.objectContaining({
      source: requirementPath,
      source_digest: `sha256:${digest}`,
    }));
  });
});
