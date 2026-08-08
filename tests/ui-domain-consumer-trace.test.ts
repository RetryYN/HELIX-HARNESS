import { describe, expect, it } from "vitest";
import type { RegistryGraphV1, RegistryNodeV1 } from "../src/design/design-registry";
import {
  buildUiConsumerTrace,
  canonicalizeUiDomain,
  type PairwiseInputV1,
  selectPairwiseFixtures,
  UDP_POLICY_V1,
  validatePatternContract,
  validateUiProfile,
} from "../src/design/ui-domain-pattern-profile";
import {
  buildUiDomain,
  UI_DOMAIN_ENTITIES,
  uiEntity,
  validContract,
  validProfile,
} from "./tools/ui-domain-fixture";

// PLAN-L7-522-ui-domain-consumer-trace: UI Domain slice3。
// L8テスト設計 U-UDP-006 行と L5結合テスト設計 IT-UDP-001 / IT-UDP-002 を機械検査する。

function registryNode(
  entity_id: string,
  kind: RegistryNodeV1["kind"],
  authority: RegistryNodeV1["authority"] = "canonical",
): RegistryNodeV1 {
  return {
    entity_id,
    kind,
    atom_role: null,
    service_role: null,
    revision: 2,
    authority,
    semantic_digest: `sha256:${"0".repeat(64)}`,
    source_pointer: "docs/design/harness/L2-screen/screen-list.md",
  };
}

// #177 共有 ID 空間の対応 node（SCR-/FLW-/CMP-/TOK-/CNT-）を全て持つ registry graph。
function graphWith(nodes: readonly RegistryNodeV1[]): RegistryGraphV1 {
  return { nodes, edges: [], graph_digest: `sha256:${"1".repeat(64)}` };
}

function validNodes(): RegistryNodeV1[] {
  return [
    registryNode("SCR-pm-01", "screen"),
    registryNode("FLW-approve", "flow"),
    registryNode("CMP-approve-button", "component"),
    registryNode("TOK-color-primary", "design_token"),
    registryNode("CNT-approve-label", "content"),
  ];
}

function validGraph(): RegistryGraphV1 {
  return graphWith(validNodes());
}

describe("ui-domain registry consumer trace (PLAN-L7-522)", () => {
  it("U-UDP-006: 共有ID空間のbindingを決定的traceで返し、欠落・kind不対応・stale参照を全列挙fail-closeする", () => {
    const domain = buildUiDomain();

    // green: 共有 prefix 5 entity のみ entries に入り、entity_id 昇順・決定的
    const result = buildUiConsumerTrace(domain, validGraph(), UDP_POLICY_V1);
    expect(result.ok, JSON.stringify(result).slice(0, 300)).toBe(true);
    if (!result.ok) return;
    const trace = result.value;
    expect(trace.entries.map((entry) => entry.entity_id)).toEqual([
      "CMP-approve-button",
      "CNT-approve-label",
      "FLW-approve",
      "SCR-pm-01",
      "TOK-color-primary",
    ]);
    expect(trace.entries.map((entry) => entry.registry_kind)).toEqual([
      "component",
      "content",
      "flow",
      "screen",
      "design_token",
    ]);
    for (const entry of trace.entries) expect(entry.registry_revision).toBe(2);
    expect(trace.trace_digest).toMatch(/^sha256:[0-9a-f]{64}$/);

    // UI-local prefix（NAV-/RGN-/PTN-/FBK-/UST-）は binding を要求せず entries に含めない
    const localIds = trace.entries.filter((entry) =>
      ["NAV-", "RGN-", "PTN-", "FBK-", "UST-"].some((p) => entry.entity_id.startsWith(p)),
    );
    expect(localIds).toEqual([]);

    // 決定性: graph node 順序を入れ替えた意味的同一入力でも trace_digest 一致
    const permuted = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith([...validNodes()].reverse()),
      UDP_POLICY_V1,
    );
    expect(permuted.ok).toBe(true);
    if (permuted.ok) expect(permuted.value.trace_digest).toBe(trace.trace_digest);

    // 欠落 2 件は全列挙で UDP_TRACE_UNBOUND（fail-fast で 1 件に潰さない）
    const missing = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith(
        validNodes().filter(
          (node) => node.entity_id !== "SCR-pm-01" && node.entity_id !== "TOK-color-primary",
        ),
      ),
      UDP_POLICY_V1,
    );
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.failures).toHaveLength(2);
      for (const failure of missing.failures) expect(failure.code).toBe("UDP_TRACE_UNBOUND");
    }

    // kind 不対応（SCR- が component として登録されている）も UDP_TRACE_UNBOUND
    const wrongKind = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith(
        validNodes().map((node) =>
          node.entity_id === "SCR-pm-01" ? registryNode("SCR-pm-01", "component") : node,
        ),
      ),
      UDP_POLICY_V1,
    );
    expect(wrongKind.ok).toBe(false);
    if (!wrongKind.ok) expect(wrongKind.failures[0]?.code).toBe("UDP_TRACE_UNBOUND");

    // registry 側 stale/retired node への参照も UDP_TRACE_UNBOUND
    const stale = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith(
        validNodes().map((node) =>
          node.entity_id === "CNT-approve-label"
            ? registryNode("CNT-approve-label", "content", "stale")
            : node,
        ),
      ),
      UDP_POLICY_V1,
    );
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.failures[0]?.code).toBe("UDP_TRACE_UNBOUND");

    // 決定性: domain entity の宣言順を入れ替えても trace_digest 一致
    const reversedDomain = buildUiDomain([...UI_DOMAIN_ENTITIES].reverse());
    const reversed = buildUiConsumerTrace(reversedDomain, validGraph(), UDP_POLICY_V1);
    expect(reversed.ok).toBe(true);
    if (reversed.ok) expect(reversed.value.trace_digest).toBe(trace.trace_digest);

    // shadow（未成熟 node）への binding も authority≠canonical として UDP_TRACE_UNBOUND
    const shadow = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith(
        validNodes().map((node) =>
          node.entity_id === "FLW-approve" ? registryNode("FLW-approve", "flow", "shadow") : node,
        ),
      ),
      UDP_POLICY_V1,
    );
    expect(shadow.ok).toBe(false);
    if (!shadow.ok) expect(shadow.failures[0]?.code).toBe("UDP_TRACE_UNBOUND");

    // 欠落 + kind 不対応の混在も個別に全列挙される（review round1 probe522_1 の恒久 oracle）
    const mixed = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith(
        validNodes()
          .filter((node) => node.entity_id !== "TOK-color-primary")
          .map((node) =>
            node.entity_id === "SCR-pm-01" ? registryNode("SCR-pm-01", "component") : node,
          ),
      ),
      UDP_POLICY_V1,
    );
    expect(mixed.ok).toBe(false);
    if (!mixed.ok) {
      expect(mixed.failures).toHaveLength(2);
      for (const failure of mixed.failures) expect(failure.code).toBe("UDP_TRACE_UNBOUND");
    }

    // graph 側の重複 entity_id は並び順依存の後勝ちを許さず UDP_STALE_INPUT で fail-close
    // （review round1 probe522_3 の恒久 oracle: 誤 kind が先でも後でも同じ失敗になる）
    const dupWrongFirst = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith([registryNode("SCR-pm-01", "component"), ...validNodes()]),
      UDP_POLICY_V1,
    );
    const dupWrongLast = buildUiConsumerTrace(
      buildUiDomain(),
      graphWith([...validNodes(), registryNode("SCR-pm-01", "component")]),
      UDP_POLICY_V1,
    );
    for (const dup of [dupWrongFirst, dupWrongLast]) {
      expect(dup.ok).toBe(false);
      if (!dup.ok) expect(dup.failures[0]?.code).toBe("UDP_STALE_INPUT");
    }

    // schema 不一致（domain / policy）は UDP_STALE_INPUT
    const badDomain = buildUiDomain();
    (badDomain as { schema_version: string }).schema_version = "ui-domain-declaration.v0";
    const badDomainResult = buildUiConsumerTrace(badDomain as never, validGraph(), UDP_POLICY_V1);
    expect(badDomainResult.ok).toBe(false);
    if (!badDomainResult.ok) expect(badDomainResult.failures[0]?.code).toBe("UDP_STALE_INPUT");
    const badPolicy = buildUiConsumerTrace(buildUiDomain(), validGraph(), {
      schema_version: "ui-domain-policy.v0",
    } as never);
    expect(badPolicy.ok).toBe(false);
    if (!badPolicy.ok) expect(badPolicy.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });

  it("IT-UDP-001/IT-UDP-002: 純関数連結の段またぎfail-closeとrisk→fixture→trace結合の決定性を検査する", () => {
    // IT-UDP-001: canonicalize→contract→profile を連結し、各段の逸脱がその段で fail-close
    const canonical = canonicalizeUiDomain(
      { schema_version: "ui-domain-declaration.v1", entities: UI_DOMAIN_ENTITIES.map(uiEntity) },
      UDP_POLICY_V1,
    );
    expect(canonical.ok).toBe(true);
    if (!canonical.ok) return;
    const contractOk = validatePatternContract(validContract(), canonical.value);
    expect(contractOk.ok).toBe(true);
    const profileOk = validateUiProfile(validProfile());
    expect(profileOk.ok).toBe(true);

    // 段1逸脱: class 名主キーは canonicalize で fail-close し、後段へ流れない
    const badCanonical = canonicalizeUiDomain(
      {
        schema_version: "ui-domain-declaration.v1",
        entities: [uiEntity({ entity_id: "ApproveButton", kind: "ui_component" })],
      },
      UDP_POLICY_V1,
    );
    expect(badCanonical.ok).toBe(false);

    // 段2逸脱: 非実在 entity への contract は typed domain 上で fail-close
    const orphanContract = validContract();
    orphanContract.required = [
      { target_kind: "ui_component", target_id: "CMP-ghost", condition: "visible" },
    ];
    expect(validatePatternContract(orphanContract, canonical.value).ok).toBe(false);

    // 段3逸脱: reduced-motion 代替の欠落は profile 検証で fail-close
    const badProfile = validProfile();
    (badProfile.motion as { reduced_motion_alternative: string }).reduced_motion_alternative = "";
    expect(validateUiProfile(badProfile).ok).toBe(false);

    // IT-UDP-002: risk matrix→fixture 選定→consumer trace の結合決定性
    const pairwiseInput: PairwiseInputV1 = {
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
    };
    const first = selectPairwiseFixtures(pairwiseInput);
    const second = selectPairwiseFixtures(pairwiseInput);
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(second.value.selection_digest).toBe(first.value.selection_digest);
    }
    const trace = buildUiConsumerTrace(canonical.value, validGraph(), UDP_POLICY_V1);
    expect(trace.ok).toBe(true);
    if (trace.ok && first.ok) {
      // fixture 選定と consumer trace は同一 typed domain 系で整合し、双方とも決定的 digest を持つ
      expect(trace.value.trace_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(first.value.selection_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });
});
