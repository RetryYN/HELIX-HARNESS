import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { aggregateInternalDoctorChecks } from "../src/doctor/check-registry";
import { checkL12HybridInventoryLifecycle } from "../src/doctor/index";
import {
  analyzeReviewedSafeInventoryLifecycle,
  REVIEWED_SAFE_ARTIFACT_FAMILIES,
} from "../src/lint/l12-hybrid-inventory-lifecycle";
import { REVIEWED_SAFE_DISPOSITIONS } from "../src/lint/l12-hybrid-reviewed-safe-v2";

const inventoryPath = "docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md";

describe("L12 reviewed-safe inventory lifecycle", () => {
  it("U-L12INV-001: reviewed-safe familyをauthority-review一覧から対称にretireする", () => {
    const inventory = readFileSync(inventoryPath, "utf8");
    expect(analyzeReviewedSafeInventoryLifecycle(inventory)).toEqual({ ok: true, findings: [] });
    expect(checkL12HybridInventoryLifecycle(process.cwd())).toEqual({
      messages: ["l12-hybrid-inventory-lifecycle - OK"],
      ok: true,
    });
  });

  it("U-L12INV-002: L6・L8・PLANの片側登録とsection件数driftを個別に拒否する", () => {
    const inventory = readFileSync(inventoryPath, "utf8");
    const planPath = REVIEWED_SAFE_ARTIFACT_FAMILIES[0].paths[2];
    const reinserted = inventory.replace("\n## 8.", `\n- \`${planPath}\`\n\n## 8.`);
    expect(analyzeReviewedSafeInventoryLifecycle(reinserted).findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reviewed_safe_member_still_authority_review",
          path: planPath,
        }),
        expect.objectContaining({ code: "section_count_mismatch", section: 7 }),
      ]),
    );

    const missingL8 = new Set(REVIEWED_SAFE_DISPOSITIONS.map((row) => row.path));
    missingL8.delete(REVIEWED_SAFE_ARTIFACT_FAMILIES[0].paths[1]);
    expect(analyzeReviewedSafeInventoryLifecycle(inventory, missingL8).findings).toContainEqual(
      expect.objectContaining({
        code: "family_member_not_reviewed_safe",
        path: REVIEWED_SAFE_ARTIFACT_FAMILIES[0].paths[1],
      }),
    );
  });

  it("U-L12INV-003: inventory lifecycle違反をdoctor全体の失敗へ配線する", () => {
    expect(
      aggregateInternalDoctorChecks([
        { id: "unrelated", severity: "hard", run: () => ({ ok: true, messages: [] }) },
        {
          id: "l12HybridInventoryLifecycle",
          severity: "hard",
          run: () => ({ ok: false, messages: [] }),
        },
      ]),
    ).toEqual({
      allOk: false,
      failingChecks: ["l12HybridInventoryLifecycle"],
      registeredHardCount: 2,
      evaluatedHardCount: 2,
    });

    const doctorSource = readFileSync("src/doctor/index.ts", "utf8");
    expect(doctorSource).toContain(
      '["l12HybridInventoryLifecycle", l12HybridInventoryLifecycle.ok]',
    );
    expect(doctorSource).toContain("aggregateInternalDoctorChecks(doctorCheckDefinitions)");
    expect(doctorSource).toContain("ok: doctorAllChecksOk");
    expect(doctorSource).not.toContain("l12HybridInventoryLifecycle.ok &&");
    expect(doctorSource).toContain(
      "...l12HybridInventoryLifecycle.messages.map((m) => `doctor: $" + "{m}`)",
    );
  });
});
