import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  adaptLegacySkillApplicability,
  loadSkillApplicabilityRegistry,
  parseSkillApplicability,
  SKILL_APPLICABILITY_REGISTRY_PATH,
  skillApplicabilityRegistrySchema,
} from "../src/schema/skill-applicability-registry.js";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
} from "../src/schema/workflow-classification-registry.js";

const SKILL_APPLICABILITY_AUTHORITY_PATH =
  "docs/design/helix/L3-requirements/skill-applicability-authority.md";
const REQUIREMENTS_AUTHORITY_PATH = "docs/governance/helix-harness-requirements_v1.3.md";

function makeRegistryLoaderFixture(): {
  root: string;
  registryPath: string;
  raw: Record<string, unknown>;
} {
  const root = mkdtempSync(join(tmpdir(), "helix-skill-applicability-loader-"));
  for (const relativePath of [
    SKILL_APPLICABILITY_REGISTRY_PATH,
    SKILL_APPLICABILITY_AUTHORITY_PATH,
    REQUIREMENTS_AUTHORITY_PATH,
    WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  ]) {
    const target = join(root, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync(resolve(process.cwd(), relativePath)));
  }
  const registryPath = join(root, SKILL_APPLICABILITY_REGISTRY_PATH);
  const raw = JSON.parse(readFileSync(registryPath, "utf8")) as Record<string, unknown>;
  return { root, registryPath, raw };
}

function writeRegistryFixture(registryPath: string, raw: Record<string, unknown>): void {
  writeFileSync(registryPath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
}

describe("skill applicability registry", () => {
  it("loads requirements-owned authority and binds the workflow registry", () => {
    const registry = loadSkillApplicabilityRegistry();
    expect(registry.registry_version).toBe("1.0.0");
    expect(registry.identity_reference.registry_version).toBe("1.1.6");
    expect(registry.current_contract).toEqual(
      expect.objectContaining({
        positive_field: "applicable_identities",
        negative_field: "excluded_identities",
        implicit_default: false,
        emit_legacy_identity: false,
      }),
    );
  });

  it("rejects a requirements authority digest drift through the loader", () => {
    const fixture = makeRegistryLoaderFixture();
    try {
      const authority = fixture.raw.authority as Record<string, unknown>;
      authority.source_digest = `sha256:${"0".repeat(64)}`;
      writeRegistryFixture(fixture.registryPath, fixture.raw);

      expect(() => loadSkillApplicabilityRegistry(fixture.root)).toThrow(
        "skill applicability requirements digest mismatch",
      );
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("rejects a workflow registry digest drift through the loader", () => {
    const fixture = makeRegistryLoaderFixture();
    try {
      const identityReference = fixture.raw.identity_reference as Record<string, unknown>;
      identityReference.registry_source_digest = `sha256:${"1".repeat(64)}`;
      writeRegistryFixture(fixture.registryPath, fixture.raw);

      expect(() => loadSkillApplicabilityRegistry(fixture.root)).toThrow(
        "skill applicability workflow registry digest mismatch",
      );
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("rejects a workflow registry version drift through the loader", () => {
    const fixture = makeRegistryLoaderFixture();
    try {
      const identityReference = fixture.raw.identity_reference as Record<string, unknown>;
      identityReference.registry_version = "0.0.0";
      writeRegistryFixture(fixture.registryPath, fixture.raw);

      expect(() => loadSkillApplicabilityRegistry(fixture.root)).toThrow(
        "skill applicability workflow registry version mismatch",
      );
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("revalidates injected skill applicability registry bindings", () => {
    const registry = structuredClone(loadSkillApplicabilityRegistry());
    const workflowRegistry = loadWorkflowClassificationRegistry();
    registry.identity_reference.registry_version = "0.0.0";

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("skill applicability workflow registry version mismatch");
  });

  it("revalidates injected skill applicability registry version", () => {
    const registry = structuredClone(loadSkillApplicabilityRegistry());
    const workflowRegistry = loadWorkflowClassificationRegistry();
    registry.registry_version = "0.0.0";

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("skill applicability registry version mismatch");
  });

  it("revalidates injected skill applicability requirements digest", () => {
    const registry = structuredClone(loadSkillApplicabilityRegistry());
    const workflowRegistry = loadWorkflowClassificationRegistry();
    registry.authority.source_digest = `sha256:${"0".repeat(64)}`;

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("skill applicability requirements digest mismatch");
  });

  it("revalidates injected workflow registry source digest", () => {
    const registry = loadSkillApplicabilityRegistry();
    const workflowRegistry = structuredClone(loadWorkflowClassificationRegistry());
    registry.identity_reference.registry_source_digest = `sha256:${"0".repeat(64)}`;

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("skill applicability workflow registry digest mismatch");
  });

  it("revalidates injected workflow registry version", () => {
    const registry = loadSkillApplicabilityRegistry();
    const workflowRegistry = structuredClone(loadWorkflowClassificationRegistry());
    workflowRegistry.registry_version = "0.0.0";

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("skill applicability workflow registry version mismatch");
  });

  it("revalidates injected workflow registry bindings", () => {
    const registry = loadSkillApplicabilityRegistry();
    const workflowRegistry = structuredClone(loadWorkflowClassificationRegistry());
    workflowRegistry.authority.source_digest = `sha256:${"0".repeat(64)}`;

    expect(() =>
      parseSkillApplicability(
        { applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }] },
        { registry, workflowRegistry },
      ),
    ).toThrow("workflow classification requirements digest mismatch");
  });

  it("rejects a classification-known axis that is not allowed by the skill registry", () => {
    const registry = structuredClone(loadSkillApplicabilityRegistry());
    registry.current_contract.allowed_axes = [
      ...registry.current_contract.allowed_axes,
      "state_machine",
    ];

    expect(() =>
      parseSkillApplicability(
        {
          applicable_identities: [
            { target_axis: "state_machine", target_id: "DISCOVERY_POC_S0_S4" },
          ],
        },
        { registry, workflowRegistry: loadWorkflowClassificationRegistry() },
      ),
    ).toThrow("skill applicability axis is not allowed: state_machine");
  });

  it("accepts separate typed identities without folding their axes", () => {
    expect(
      parseSkillApplicability({
        applicable_identities: [
          { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
          { target_axis: "case_driven_model", target_id: "DISCOVERY_POC" },
        ],
        excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
      }),
    ).toEqual({
      applicable_identities: [
        { target_axis: "development_style", target_id: "PRODUCTION_SCRUM" },
        { target_axis: "case_driven_model", target_id: "DISCOVERY_POC" },
      ],
      excluded_identities: [{ target_axis: "workflow_model", target_id: "INCIDENT" }],
    });
  });

  it.each([
    [
      "unknown identity",
      { applicable_identities: [{ target_axis: "workflow_model", target_id: "UNKNOWN" }] },
      "unknown skill applicability identity",
    ],
    [
      "axis mismatch",
      { applicable_identities: [{ target_axis: "workflow_model", target_id: "PRODUCTION_SCRUM" }] },
      "axis mismatch",
    ],
    [
      "duplicate identity",
      {
        applicable_identities: [
          { target_axis: "workflow_model", target_id: "REVERSE" },
          { target_axis: "workflow_model", target_id: "REVERSE" },
        ],
      },
      "duplicate skill applicability identity",
    ],
    [
      "polarity conflict",
      {
        applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
        excluded_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
      },
      "polarity conflict",
    ],
    ["implicit default", { applicable_identities: [] }, "Array must contain at least 1 element(s)"],
  ])("rejects %s", (_name, input, message) => {
    expect(() => parseSkillApplicability(input)).toThrow(message);
  });

  it("rejects duplicate excluded identities", () => {
    expect(() =>
      parseSkillApplicability({
        applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
        excluded_identities: [
          { target_axis: "workflow_model", target_id: "RECOVERY" },
          { target_axis: "workflow_model", target_id: "RECOVERY" },
        ],
      }),
    ).toThrow("duplicate skill exclusion identity: workflow_model:RECOVERY");
  });

  it("exposes applicability collections as readonly runtime values", () => {
    const parsed = parseSkillApplicability({
      applicable_identities: [{ target_axis: "workflow_model", target_id: "REVERSE" }],
      excluded_identities: [{ target_axis: "workflow_model", target_id: "RECOVERY" }],
    });
    const converted = adaptLegacySkillApplicability(["reverse"]);

    if (converted.disposition !== "converted") {
      throw new Error("expected a converted legacy applicability result");
    }

    expect(Object.isFrozen(parsed.applicable_identities)).toBe(true);
    expect(Object.isFrozen(parsed.excluded_identities)).toBe(true);
    expect(Object.isFrozen(converted.identities)).toBe(true);
    expect(Object.isFrozen(converted.warnings)).toBe(true);
  });

  it("converts only unambiguous legacy input and records its source", () => {
    expect(adaptLegacySkillApplicability([" Reverse ", "recovery"])).toEqual({
      disposition: "converted",
      identities: [
        { target_axis: "workflow_model", target_id: "REVERSE" },
        { target_axis: "workflow_model", target_id: "RECOVERY" },
      ],
      warnings: [
        { source_field: "drive_models", normalized_token: "reverse" },
        { source_field: "drive_models", normalized_token: "recovery" },
      ],
    });
    expect(adaptLegacySkillApplicability(["Forward"])).toEqual({
      disposition: "ambiguous",
      token: "forward",
    });
    expect(adaptLegacySkillApplicability(["mystery"])).toEqual({
      disposition: "unsupported",
      token: "mystery",
    });
  });

  it("rejects registry shape drift before runtime use", () => {
    const raw = JSON.parse(
      readFileSync(resolve(process.cwd(), SKILL_APPLICABILITY_REGISTRY_PATH), "utf8"),
    ) as Record<string, unknown>;
    const current = raw.current_contract as Record<string, unknown>;
    current.emit_legacy_identity = true;
    expect(() => skillApplicabilityRegistrySchema.parse(raw)).toThrow();
  });

  it.each([
    [
      "duplicate allowed axis",
      (raw: Record<string, unknown>) => {
        const current = raw.current_contract as { allowed_axes: string[] };
        current.allowed_axes.push(current.allowed_axes[0] ?? "workflow_model");
      },
      "duplicate skill applicability axis",
    ],
    [
      "duplicate conversion token",
      (raw: Record<string, unknown>) => {
        const adapter = raw.legacy_input_adapter as { conversions: unknown[] };
        adapter.conversions.push(structuredClone(adapter.conversions[0]));
      },
      "duplicate legacy skill applicability token",
    ],
    [
      "convertible and ambiguous token",
      (raw: Record<string, unknown>) => {
        const adapter = raw.legacy_input_adapter as {
          conversions: Array<{ token: string }>;
          ambiguous_tokens: string[];
        };
        adapter.ambiguous_tokens.push(adapter.conversions[0]?.token ?? "discovery");
      },
      "cannot be convertible and ambiguous",
    ],
  ])("rejects %s registry drift", (_name, mutate, message) => {
    const raw = JSON.parse(
      readFileSync(resolve(process.cwd(), SKILL_APPLICABILITY_REGISTRY_PATH), "utf8"),
    ) as Record<string, unknown>;
    mutate(raw);
    expect(() => skillApplicabilityRegistrySchema.parse(raw)).toThrow(message);
  });

  it("rejects an empty legacy token set instead of inferring applicability", () => {
    expect(adaptLegacySkillApplicability([])).toEqual({
      disposition: "unsupported",
      token: "",
    });
  });
});
