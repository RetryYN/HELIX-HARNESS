import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import {
  buildRegistryCommit,
  commitRegistry,
  createInMemoryRegistryStore,
} from "../src/design/design-registry-transaction";
import { buildDeclaration, FULL_CHAIN_NODES } from "./tools/design-registry-fixture";

// PLAN-L7-517-design-registry-transaction: Design Registry slice2。
// L8テスト設計 U-DRG-006 行を機械検査する。

function graphOf() {
  const graph = validateRegistryGraph(buildDeclaration());
  if (!graph.ok) throw new Error("fixture graph must validate");
  return graph.value;
}

function validBundle(operationId = "op-1", expectedHead = "registry-head-genesis") {
  const built = buildRegistryCommit({
    graph: graphOf(),
    operation_id: operationId,
    expected_registry_head: expectedHead,
  });
  if (!built.ok) throw new Error(`fixture bundle must build: ${JSON.stringify(built.failures)}`);
  return built.value;
}

describe("design-registry transaction (PLAN-L7-517)", () => {
  it("U-DRG-006: digest改変・CAS不一致・二重operation・append faultは増分0、正常系はatomic commit", async () => {
    // build の決定性: 同義入力は同 operation_digest / write_set_digest
    expect(validBundle()).toEqual(validBundle());
    const bundle = validBundle();
    expect(bundle.append_order).toEqual(["node", "edge", "version", "head"]);
    expect(bundle.operation_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(bundle.write_set_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(bundle.versions.length).toBe(bundle.nodes.length);

    // 正常系: atomic commit で head 前進、receipt に件数と before/after head を bind
    const store = createInMemoryRegistryStore("registry-head-genesis");
    const receipt = await commitRegistry(bundle, store.store);
    expect(receipt.ok, JSON.stringify(receipt)).toBe(true);
    if (receipt.ok) {
      expect(receipt.value.status).toBe("committed");
      expect(receipt.value.before_registry_head).toBe("registry-head-genesis");
      expect(receipt.value.after_registry_head).not.toBe("registry-head-genesis");
      expect(receipt.value.inserted_node_count).toBe(bundle.nodes.length);
      expect(receipt.value.inserted_edge_count).toBe(bundle.edges.length);
      expect(store.state.head).toBe(receipt.value.after_registry_head);
      expect(store.state.nodes.length).toBe(bundle.nodes.length);
    }
    const committedCounts = {
      nodes: store.state.nodes.length,
      edges: store.state.edges.length,
      versions: store.state.versions.length,
      head: store.state.head,
    };

    // 同一 operation の二重 commit は増分 0（mutation: 二重 operation 検査を外すと red）
    const replay = await commitRegistry(validBundle("op-1", committedCounts.head), store.store);
    expect(replay.ok).toBe(false);
    if (!replay.ok) expect(replay.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // 期待 head CAS 不一致は増分 0（mutation: CAS を外すと red）
    const casMiss = await commitRegistry(validBundle("op-2", "registry-head-wrong"), store.store);
    expect(casMiss.ok).toBe(false);
    if (!casMiss.ok) expect(casMiss.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // write_set / operation digest の改変は増分 0（mutation: digest 再計算検査を外すと red）
    for (const tamper of [
      { ...validBundle("op-3", committedCounts.head), write_set_digest: "sha256:0000" },
      { ...validBundle("op-4", committedCounts.head), operation_digest: "sha256:0000" },
      {
        ...validBundle("op-5", committedCounts.head),
        append_order: ["head", "node", "edge", "version"] as unknown as [
          "node",
          "edge",
          "version",
          "head",
        ],
      },
    ]) {
      const tampered = await commitRegistry(tamper, store.store);
      expect(tampered.ok).toBe(false);
      if (!tampered.ok) expect(tampered.failures[0]?.code).toBe("DRG_STALE_INPUT");
    }

    // 内容 tamper（digest 列は据え置きで実フィールドだけ改変）は DRG_STALE_INPUT で増分 0
    // （review round1 Critical-1/2: 内容再検証を外す mutation はこの fixture 群が red で kill）
    const nodeTamper = validBundle("op-t1", committedCounts.head);
    (nodeTamper.nodes[0] as { authority: string }).authority = "retired";
    const edgeTamper = validBundle("op-t2", committedCounts.head);
    (edgeTamper.edges[0] as { authority: string }).authority = "stale";
    const versionTamper = validBundle("op-t3", committedCounts.head);
    (versionTamper.versions[0] as { supersedes_revision: number | null }).supersedes_revision = 999;
    // 補助分岐も kill する反例: edge_id 改変・versions 個数改変・nodes/versions 順序ズレ
    const edgeIdTamper = validBundle("op-t4", committedCounts.head);
    (edgeIdTamper.edges[0] as { edge_id: string }).edge_id = "presents:SCR-x->INT-y";
    const versionCountTamper = validBundle("op-t5", committedCounts.head);
    versionCountTamper.versions.pop();
    const versionOrderTamper = validBundle("op-t6", committedCounts.head);
    versionOrderTamper.versions.reverse();
    for (const tampered of [
      nodeTamper,
      edgeTamper,
      versionTamper,
      edgeIdTamper,
      versionCountTamper,
      versionOrderTamper,
    ]) {
      const rejected = await commitRegistry(tampered, store.store);
      expect(rejected.ok).toBe(false);
      if (!rejected.ok) expect(rejected.failures[0]?.code).toBe("DRG_STALE_INPUT");
    }

    // commit 後の外部変異は store state へ漏れない（review round1 Critical-3: deep copy を
    // 外す mutation はこの assert が red で kill）
    const externalGraph = graphOf();
    const isolationStore = createInMemoryRegistryStore("iso-head");
    const isolationBuilt = buildRegistryCommit({
      graph: externalGraph,
      operation_id: "op-iso",
      expected_registry_head: "iso-head",
    });
    if (!isolationBuilt.ok) throw new Error("isolation bundle must build");
    const isolationReceipt = await commitRegistry(isolationBuilt.value, isolationStore.store);
    expect(isolationReceipt.ok).toBe(true);
    (externalGraph.nodes[0] as { authority: string }).authority = "retired";
    (isolationBuilt.value.nodes[0] as { authority: string }).authority = "retired";
    expect(isolationStore.state.nodes[0]?.authority).toBe("canonical");

    // revision>1 の supersedes_revision 導出（review round1 Important-1）
    const revisedGraph = validateRegistryGraph(
      buildDeclaration(
        FULL_CHAIN_NODES.map((node) =>
          node.entity_id === "SCR-pm-01" ? { ...node, revision: 3 } : node,
        ),
      ),
    );
    if (!revisedGraph.ok) throw new Error("revised graph must validate");
    const revisedBundle = buildRegistryCommit({
      graph: revisedGraph.value,
      operation_id: "op-rev",
      expected_registry_head: "rev-head",
    });
    expect(revisedBundle.ok).toBe(true);
    if (revisedBundle.ok) {
      const version = revisedBundle.value.versions.find((v) => v.entity_id === "SCR-pm-01");
      expect(version?.version_id).toBe("SCR-pm-01@3");
      expect(version?.supersedes_revision).toBe(2);
    }

    // 空 operation_id / 空 expected_registry_head は DRG_ID_INVALID（review round1 Important-2）
    const emptyOp = buildRegistryCommit({
      graph: graphOf(),
      operation_id: "  ",
      expected_registry_head: "head",
    });
    expect(emptyOp.ok).toBe(false);
    if (!emptyOp.ok) expect(emptyOp.failures[0]?.code).toBe("DRG_ID_INVALID");
    expect(
      buildRegistryCommit({ graph: graphOf(), operation_id: "op", expected_registry_head: "" }).ok,
    ).toBe(false);

    // append fault は rollback して増分 0（mutation: rollback を外すと red）
    const faultStore = createInMemoryRegistryStore(committedCounts.head, {
      injectAppendFault: "version",
    });
    const faulted = await commitRegistry(
      validBundle("op-6", committedCounts.head),
      faultStore.store,
    );
    expect(faulted.ok).toBe(false);
    expect(faultStore.state.nodes.length).toBe(0);
    expect(faultStore.state.edges.length).toBe(0);
    expect(faultStore.state.versions.length).toBe(0);
    expect(faultStore.state.head).toBe(committedCounts.head);

    // すべての失敗経路で元 store の増分 0
    expect(store.state.nodes.length).toBe(committedCounts.nodes);
    expect(store.state.edges.length).toBe(committedCounts.edges);
    expect(store.state.versions.length).toBe(committedCounts.versions);
    expect(store.state.head).toBe(committedCounts.head);
  });
});
