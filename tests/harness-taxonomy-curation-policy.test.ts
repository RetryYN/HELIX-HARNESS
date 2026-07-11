import { describe, expect, it } from "vitest";
import { buildHarnessTaxonomyCurationReport } from "../src/runtime/harness-taxonomy-curation-policy";

describe("harness taxonomy curation policy", () => {
  it("keeps star count advisory and reports topic digest deltas only for changed sources", () => {
    const report = buildHarnessTaxonomyCurationReport([
      {
        source_id: "repo:a",
        source_url: "https://github.com/org/a",
        taxonomy_family: "quality_verification",
        source_verified: true,
        license_risk: "low",
        activity_freshness_days: 7,
        scope_fit: "fit",
        topic_result_digest: "sha256:new",
        previous_topic_result_digest: "sha256:old",
        star_count: 100000,
      },
      {
        source_id: "repo:b",
        source_url: "https://github.com/org/b",
        taxonomy_family: "security_guardrail",
        source_verified: true,
        license_risk: "medium",
        activity_freshness_days: 21,
        scope_fit: "partial",
        topic_result_digest: "sha256:same",
        previous_topic_result_digest: "sha256:same",
        star_count: 1,
      },
    ]);

    expect(report.ok).toBe(true);
    expect(report.changed_sources).toEqual(["repo:a"]);
    expect(report.curated_sources.every((source) => source.star_count_is_advisory)).toBe(true);
    expect(report.policy_references).toMatchObject({
      plan: "docs/plans/PLAN-L7-383-harness-taxonomy-curation-policy.md",
    });
  });

  it("fail-closes unclassified or unverified sources instead of dropping them", () => {
    const report = buildHarnessTaxonomyCurationReport([
      {
        source_id: "repo:unknown",
        source_url: "https://github.com/org/unknown",
        source_verified: false,
        license_risk: "unknown",
        topic_result_digest: "sha256:unknown",
      },
    ]);

    expect(report.ok).toBe(false);
    expect(report.curated_sources[0].adoption_basis).toBe("rejected");
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "unclassified_source_fail_close",
        "source_verification_missing",
        "license_risk_blocks_adoption",
      ]),
    );
  });
});
