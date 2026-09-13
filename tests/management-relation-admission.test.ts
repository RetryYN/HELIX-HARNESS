import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";
import {
  admitTransitionEvent,
  classifyManagementField,
  evaluateManagementRelationAdmission,
  MANAGEMENT_FIELD_OWNER_INVENTORY,
  managementFieldOwnerInventoryDigest,
  validateEvidenceSubject,
} from "../src/runtime/management-relation-admission";

const digest = (value: string) => `sha256:${value.repeat(64).slice(0, 64)}`;
const head = (value: string) => value.repeat(40).slice(0, 40);
const base = {
  field_path: "agent_slots",
  phase: "pilot_dual_read" as const,
  product_contract: { plan_id: "PLAN-L7-730-management-relation-admission", requirement: "R-1" },
  legacy_value: [{ role: "tl" }],
  canonical_available: true,
  observed_at: "2026-09-13T12:00:00Z",
  expected_generation: 1,
  writer_operations: [] as const,
  legacy_consumers_remaining: 1,
  compatibility_reader_active: true,
  retirement_requested: false,
};
const assignment = {
  schema_version: "helix-management-relation.v1",
  relation_kind: "WorkTicketAssignment",
  ticket_ref: "plan:PLAN-L7-730-management-relation-admission",
  required_role: "tl",
  required_capability: "management-control",
  assignment_ref: "assignment:860:1",
  generation: 1,
  valid_from: "2026-09-13T00:00:00Z",
  valid_until: "2026-09-14T00:00:00Z",
};
const transition = {
  schema_version: "helix-management-relation.v1",
  relation_kind: "TransitionEvent",
  ticket_ref: "plan:PLAN-L7-730-management-relation-admission",
  state_machine: "plan-lifecycle",
  from_state: "draft",
  to_state: "confirmed",
  event_id: "event:1771:1",
  occurred_at: "2026-09-13T00:00:00Z",
  actor_ref: "actor:codex",
  evidence_ref: "evidence:1771:1",
};
const evidence = {
  schema_version: "helix-management-relation.v1",
  relation_kind: "EvidenceSubjectRef",
  subject_head: head("a"),
  subject_tree: head("b"),
  contract_revision: digest("c"),
  policy_revision: digest("d"),
  evidence_envelope_ref: "evidence:1771:1",
  issuer: "reviewer:claude",
  trust_policy: "policy:cross-review-v1",
  approval_kind: "technical_review",
  revoked: false,
};

describe("management relation admission", () => {
  it("U-MREL-001: owned fieldはexactly one ownerへ分類する", () => {
    const owned = MANAGEMENT_FIELD_OWNER_INVENTORY.filter((entry) => entry.disposition === "owned");
    expect(owned.length).toBeGreaterThan(0);
    expect(owned.every((entry) => typeof entry.owner === "string")).toBe(true);
    expect(new Set(MANAGEMENT_FIELD_OWNER_INVENTORY.map((entry) => entry.path)).size).toBe(
      MANAGEMENT_FIELD_OWNER_INVENTORY.length,
    );
    expect(managementFieldOwnerInventoryDigest()).toMatch(/^sha256:[a-f0-9]{64}$/u);

    const observed = new Set<string>();
    for (const filename of readdirSync("docs/plans").filter((name) => name.endsWith(".md"))) {
      const source = readFileSync(`docs/plans/${filename}`, "utf8");
      const block = source.match(/^---\n([\s\S]*?)\n---/u)?.[1];
      if (!block) continue;
      const frontmatter = parseYaml(block) as Record<string, unknown>;
      for (const key of Object.keys(frontmatter)) {
        if (key !== "dependencies") observed.add(key);
      }
      const dependencies = frontmatter.dependencies;
      if (typeof dependencies === "object" && dependencies !== null) {
        for (const key of Object.keys(dependencies)) observed.add(`dependencies.${key}`);
      }
    }
    const registered = new Set(MANAGEMENT_FIELD_OWNER_INVENTORY.map((entry) => entry.path));
    expect([...observed].filter((path) => !registered.has(path)).sort()).toEqual([]);
  });

  it("U-MREL-002: unknown fieldを拒否する", () => {
    expect(classifyManagementField("invented_field")).toEqual({
      ok: false,
      reason: "unknown_field",
      path: "invented_field",
    });
  });

  it("U-MREL-003: multi-owner fieldをsplit_requiredにする", () => {
    expect(classifyManagementField("status")).toMatchObject({
      ok: true,
      entry: { disposition: "split_required", owner: null },
    });
  });

  it("U-MREL-004: agent_slotsとassignment relationの一致を受理する", () => {
    expect(evaluateManagementRelationAdmission({ ...base, relation: assignment })).toMatchObject({
      ok: true,
      disposition: "match",
      reasons: [],
    });
  });

  it("U-MREL-005: role/assignment mismatchを拒否する", () => {
    expect(
      evaluateManagementRelationAdmission({
        ...base,
        relation: { ...assignment, required_role: "qa" },
      }),
    ).toMatchObject({
      ok: false,
      disposition: "mismatch",
      reasons: expect.arrayContaining(["dual_read_mismatch"]),
    });
  });

  it("U-MREL-006: requires/blocksだけをmanagement ownerにしparent/referenceを分離する", () => {
    expect(classifyManagementField("dependencies.requires")).toMatchObject({
      entry: { owner: "management_control" },
    });
    expect(classifyManagementField("dependencies.parent")).toMatchObject({
      entry: { owner: "product_contract" },
    });
    expect(classifyManagementField("dependencies.references")).toMatchObject({
      entry: { owner: "product_contract" },
    });
  });

  it("U-MREL-007: revoked実行証拠を拒否し有効な旧ContractRevisionを世代だけで拒否しない", () => {
    expect(
      evaluateManagementRelationAdmission({
        ...base,
        relation: { ...assignment, generation: 0 },
      }),
    ).toMatchObject({
      ok: false,
      reasons: expect.arrayContaining(["assignment_generation_mismatch"]),
    });
    expect(
      evaluateManagementRelationAdmission({
        ...base,
        observed_at: "2026-09-14T00:00:00Z",
        relation: assignment,
      }),
    ).toMatchObject({ ok: false, reasons: expect.arrayContaining(["assignment_not_current"]) });
    expect(
      validateEvidenceSubject({
        candidate: { ...evidence, revoked: true },
        expected_head: head("a"),
        expected_contract_revision: digest("c"),
        expected_policy_revision: digest("d"),
        required_approval_kind: "technical_review",
        trusted_issuers: ["reviewer:claude"],
        accepted_trust_policies: ["policy:cross-review-v1"],
      }),
    ).toMatchObject({ ok: false, reasons: ["evidence_revoked"] });
    expect(
      validateEvidenceSubject({
        candidate: evidence,
        expected_head: head("a"),
        expected_contract_revision: digest("c"),
        expected_policy_revision: digest("d"),
        required_approval_kind: "technical_review",
        trusted_issuers: ["reviewer:claude"],
        accepted_trust_policies: ["policy:cross-review-v1"],
      }),
    ).toEqual({ ok: true, reasons: [] });
  });

  it("U-MREL-008: transition ordering・ID conflict・冪等再配信を区別する", () => {
    expect(
      admitTransitionEvent({ current_state: "draft", candidate: transition, prior_events: [] }),
    ).toMatchObject({ ok: true, disposition: "apply" });
    expect(
      admitTransitionEvent({
        current_state: "draft",
        candidate: transition,
        prior_events: [transition],
      }),
    ).toMatchObject({ ok: true, disposition: "idempotent" });
    expect(
      admitTransitionEvent({
        current_state: "draft",
        candidate: { ...transition, to_state: "completed" },
        prior_events: [transition],
      }),
    ).toMatchObject({ ok: false, reason: "event_id_conflict" });
    expect(
      admitTransitionEvent({ current_state: "planned", candidate: transition, prior_events: [] }),
    ).toMatchObject({ ok: false, reason: "from_state_mismatch" });
    expect(
      admitTransitionEvent({
        current_state: "draft",
        candidate: { ...transition, event_id: "event:1771:2" },
        prior_events: [transition],
      }),
    ).toMatchObject({ ok: false, reason: "duplicate_business_transition" });
  });

  it("U-MREL-009: evidence subject tupleとapproval kindの不一致を拒否する", () => {
    const result = validateEvidenceSubject({
      candidate: evidence,
      expected_head: head("f"),
      expected_contract_revision: digest("e"),
      expected_policy_revision: digest("f"),
      required_approval_kind: "human_po",
      trusted_issuers: [],
      accepted_trust_policies: [],
    });
    expect(result.ok).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "subject_head_mismatch",
        "contract_revision_mismatch",
        "policy_revision_mismatch",
        "approval_kind_mismatch",
        "issuer_untrusted",
        "trust_policy_unaccepted",
      ]),
    );
  });

  it("U-MREL-010: canonical relation欠落をlegacy greenで相殺しない", () => {
    expect(evaluateManagementRelationAdmission({ ...base, relation: undefined })).toMatchObject({
      ok: false,
      disposition: "legacy_only",
      reasons: expect.arrayContaining(["legacy_only_forbidden"]),
    });
  });

  it("U-MREL-011: outside pilotだけがlegacy_onlyを許容する", () => {
    expect(
      evaluateManagementRelationAdmission({ ...base, phase: "outside_pilot", relation: undefined }),
    ).toMatchObject({ ok: true, disposition: "legacy_only" });
  });

  it("U-MREL-012: same operation dual-writeを拒否する", () => {
    expect(
      evaluateManagementRelationAdmission({
        ...base,
        relation: assignment,
        writer_operations: ["legacy", "relation"],
      }),
    ).toMatchObject({ ok: false, reasons: expect.arrayContaining(["dual_write_forbidden"]) });
  });

  it("U-MREL-013: inventory digestを固定しadmission差分だけdigestへ反映する", () => {
    const left = evaluateManagementRelationAdmission({ ...base, relation: assignment });
    const right = evaluateManagementRelationAdmission({
      ...base,
      relation: { ...assignment, required_capability: "management-control-v2" },
    });
    expect(left.inventory_digest).toBe(right.inventory_digest);
    expect(left.contract_semantic_digest).toBe(right.contract_semantic_digest);
    expect(left.admission_digest).not.toBe(right.admission_digest);
  });

  it("U-MREL-014: consumer-zero前のwriter cutoverを拒否する", () => {
    expect(
      evaluateManagementRelationAdmission({
        ...base,
        phase: "writer_cutover",
        relation: assignment,
        retirement_requested: true,
      }),
    ).toMatchObject({ ok: false, reasons: expect.arrayContaining(["consumer_zero_required"]) });
  });
});
