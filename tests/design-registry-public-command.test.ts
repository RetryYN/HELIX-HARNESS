import { describe, expect, it } from "vitest";
import {
  type PublicCommandExceptionV1,
  REGISTRY_POLICY_V1,
  type RegistryPolicyV1,
  validateRegistryGraph,
} from "../src/design/design-registry";
import {
  buildDeclaration,
  type FixtureEdgeInputV1,
  FULL_CHAIN_EDGES,
  FULL_CHAIN_NODES,
} from "./tools/design-registry-fixture";

// PLAN-L7-530-design-registry-public-command: Design Registry slice7。
// L8テスト設計 U-DRG-013 行を機械検査する。
// slice4 申し送り第3項「public command（permission 不要）の RegistryPolicyV1 例外判断」の着地。

const PUBLIC_COMMAND: PublicCommandExceptionV1 = {
  entity_id: "SVC-approve-command",
  rationale: "認証不要の公開参照コマンドであり permission gate を持たない",
  authority_ref: "docs/design/helix/L5-detail/design-registry.md#public-command",
};

function policyWith(...exceptions: PublicCommandExceptionV1[]): RegistryPolicyV1 {
  return { ...REGISTRY_POLICY_V1, public_commands: exceptions };
}

/** interaction が permission を経ずに直接 command を叩く chain（既定では unguarded）。 */
function directInvokeEdges(): FixtureEdgeInputV1[] {
  return [
    ...FULL_CHAIN_EDGES.filter(
      (edge) =>
        !(
          edge.from_entity_id === "INT-approve-click" &&
          edge.to_entity_id === "SVC-approve-permission"
        ),
    ),
    {
      from_entity_id: "INT-approve-click",
      to_entity_id: "SVC-approve-command",
      relation: "invokes",
    },
  ];
}

function codesOf(result: { ok: boolean; failures?: readonly { code: string }[] }): string[] {
  return result.ok ? [] : (result.failures ?? []).map((failure) => failure.code);
}

describe("design-registry public command policy (PLAN-L7-530)", () => {
  it("U-DRG-013: public command 例外は宣言した command にだけ効き、宣言の腐りをfail-closeする", () => {
    const directInvoke = buildDeclaration(FULL_CHAIN_NODES, directInvokeEdges());

    // 既定 policy（例外 0 件）では従来どおり permission 素通りを拒否する
    expect(REGISTRY_POLICY_V1.public_commands).toEqual([]);
    expect(codesOf(validateRegistryGraph(directInvoke))).toContain("DRG_UNGUARDED_INVOKE");

    // 明示宣言した command への interaction 直結だけが通る
    expect(validateRegistryGraph(directInvoke, policyWith(PUBLIC_COMMAND)).ok).toBe(true);

    // 例外は宣言した entity にだけ効く（別 command を宣言しても直結は塞がれたまま）
    expect(
      codesOf(
        validateRegistryGraph(
          directInvoke,
          policyWith({ ...PUBLIC_COMMAND, entity_id: "SVC-approve-api" }),
        ),
      ),
    ).toContain("DRG_STALE_INPUT");

    // 例外は permission 省略だけを許し、chain の段飛ばしは許さない:
    // interaction → api の直結は public 宣言があっても DRG_UNGUARDED_INVOKE
    const skipToApi = buildDeclaration(FULL_CHAIN_NODES, [
      ...FULL_CHAIN_EDGES.filter(
        (edge) =>
          !(
            edge.from_entity_id === "INT-approve-click" &&
            edge.to_entity_id === "SVC-approve-permission"
          ),
      ),
      { from_entity_id: "INT-approve-click", to_entity_id: "SVC-approve-api", relation: "invokes" },
    ]);
    expect(
      codesOf(
        validateRegistryGraph(
          skipToApi,
          policyWith({ ...PUBLIC_COMMAND, entity_id: "SVC-approve-api" }),
        ),
      ),
    ).toContain("DRG_UNGUARDED_INVOKE");

    // 例外は **interaction からの invokes** に限る。allowlist に載っていても、
    // 他 kind からの到達や別 relation での到達は通さない（逆流・迂回の遮断）。
    const forbiddenApproaches: FixtureEdgeInputV1[][] = [
      // api → command の逆流
      [
        {
          from_entity_id: "SVC-approve-api",
          to_entity_id: "SVC-approve-command",
          relation: "invokes",
        },
      ],
      // screen から command へ直結
      [{ from_entity_id: "SCR-pm-01", to_entity_id: "SVC-approve-command", relation: "invokes" }],
      // invokes 以外（guarded_by）で command へ到達
      [
        {
          from_entity_id: "INT-approve-click",
          to_entity_id: "SVC-approve-command",
          relation: "guarded_by",
        },
      ],
    ];
    const forbiddenCodes = [
      "DRG_UNGUARDED_INVOKE", // api → command の逆流（service 直列 chain の破れ）
      "DRG_RELATION_INVALID", // screen → command は adjacency 表外
      "DRG_UNGUARDED_INVOKE", // guarded_by の到達先が permission でない
    ];
    for (const [index, extra] of forbiddenApproaches.entries()) {
      const graph = buildDeclaration(FULL_CHAIN_NODES, [...FULL_CHAIN_EDGES, ...extra]);
      const codes = codesOf(validateRegistryGraph(graph, policyWith(PUBLIC_COMMAND)));
      // 「何か失敗した」ではなく期待 code を固定する（別 code へ化けた退行も検知する）
      expect(codes, `forbidden approach ${index}`).toContain(forbiddenCodes[index]);
    }

    // 反例1: 宣言 entity がグラフに無い（腐った allowlist）は DRG_STALE_INPUT
    expect(
      codesOf(
        validateRegistryGraph(
          directInvoke,
          policyWith({ ...PUBLIC_COMMAND, entity_id: "SVC-removed-command" }),
        ),
      ),
    ).toContain("DRG_STALE_INPUT");

    // 反例2: command 以外（permission / api / 非 service）の public 宣言は DRG_STALE_INPUT
    for (const entityId of ["SVC-approve-permission", "SVC-approve-api", "SCR-pm-01"]) {
      expect(
        codesOf(
          validateRegistryGraph(
            directInvoke,
            policyWith({ ...PUBLIC_COMMAND, entity_id: entityId }),
          ),
        ),
        entityId,
      ).toContain("DRG_STALE_INPUT");
    }

    // 反例3: 同一 entity の重複宣言は DRG_DUPLICATE_ID
    expect(
      codesOf(validateRegistryGraph(directInvoke, policyWith(PUBLIC_COMMAND, PUBLIC_COMMAND))),
    ).toContain("DRG_DUPLICATE_ID");

    // 反例4: 根拠のない例外（rationale / authority_ref が空）は DRG_STALE_INPUT
    for (const blank of [{ rationale: "  " }, { authority_ref: "" }]) {
      expect(
        codesOf(validateRegistryGraph(directInvoke, policyWith({ ...PUBLIC_COMMAND, ...blank }))),
        JSON.stringify(blank),
      ).toContain("DRG_STALE_INPUT");
    }

    // 反例5: policy schema_version 逸脱は DRG_ID_INVALID（既存 canonicalize と同じ規律）
    expect(
      codesOf(
        validateRegistryGraph(directInvoke, {
          ...policyWith(PUBLIC_COMMAND),
          schema_version: "design-registry-policy.v0",
        } as unknown as RegistryPolicyV1),
      ),
    ).toContain("DRG_ID_INVALID");

    // 非強制（意図的）の固定: 同一 command へ permission chain と public 直結が共存しても ok。
    // interaction ごとに公開/保護が分かれる設計は正当であり、一律禁止しない（L5 §1 に明記）。
    const coexisting = buildDeclaration(
      [...FULL_CHAIN_NODES, { entity_id: "INT-public-view", kind: "interaction" }],
      [
        ...FULL_CHAIN_EDGES,
        {
          from_entity_id: "SCR-pm-01",
          to_entity_id: "INT-public-view",
          relation: "presents",
        },
        {
          from_entity_id: "INT-public-view",
          to_entity_id: "SVC-approve-command",
          relation: "invokes",
        },
        { from_entity_id: "INT-public-view", to_entity_id: "VDH-FR-002", relation: "parents" },
        { from_entity_id: "INT-public-view", to_entity_id: "VDH-FR-003", relation: "parents" },
      ],
    );
    expect(
      validateRegistryGraph(coexisting, policyWith(PUBLIC_COMMAND)).ok,
      JSON.stringify(codesOf(validateRegistryGraph(coexisting, policyWith(PUBLIC_COMMAND)))),
    ).toBe(true);

    // 正常 chain（permission 経由）は public 宣言の有無に関わらず通る（例外が既存経路を壊さない）
    expect(validateRegistryGraph(buildDeclaration()).ok).toBe(true);
    expect(validateRegistryGraph(buildDeclaration(), policyWith(PUBLIC_COMMAND)).ok).toBe(true);
  });
});
