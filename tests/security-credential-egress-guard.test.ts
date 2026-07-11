import { describe, expect, it } from "vitest";
import { buildSecurityCredentialEgressGuardReport } from "../src/runtime/security-credential-egress-guard";

describe("security credential egress guard", () => {
  it("fail-closes external tools with undefined egress policy", () => {
    const report = buildSecurityCredentialEgressGuardReport({
      tool_name: "external-search",
      external: true,
      egress_policy: "undefined",
    });

    expect(report.ok).toBe(false);
    expect(report.findings).toEqual([
      expect.objectContaining({ code: "undefined_egress_policy_fail_close" }),
    ]);
    expect(report.credential_contract).toMatchObject({
      scoped_token_only: true,
      no_raw_secret_exposure: true,
    });
  });

  it("blocks secret-like tool arguments and approval-less activation", () => {
    const report = buildSecurityCredentialEgressGuardReport({
      tool_name: "deploy",
      external: true,
      egress_policy: "allowlist",
      allowed_hosts: ["api.example.invalid"],
      args: ["token=raw-secret"],
      activation_kind: "external_api",
      action_binding_approval_present: false,
    });

    expect(report.ok).toBe(false);
    expect(report.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining([
        "credential_like_tool_argument_blocked",
        "action_binding_approval_required",
      ]),
    );
    expect(JSON.stringify(report)).not.toContain("raw-secret");
  });
});
