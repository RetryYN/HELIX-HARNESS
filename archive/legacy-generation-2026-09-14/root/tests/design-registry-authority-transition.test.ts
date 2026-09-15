import { describe, expect, it } from "vitest";
import {
  computeRegistryNodeSemanticDigest,
  type RegistryGraphV1,
  type RegistryNodeV1,
  validateRegistryGraph,
} from "../src/design/design-registry";
import {
  createSqliteDesignRegistryStore,
  ensureDesignRegistryTables,
  readDesignRegistryStatus,
  seedSqliteDesignRegistryHead,
} from "../src/design/design-registry-sqlite-store";
import {
  applyAuthorityTransition,
  buildAuthorityTransition,
  buildRegistryCommit,
  commitRegistry,
  createInMemoryRegistryStore,
  markStaleLineage,
} from "../src/design/design-registry-transaction";
import { openHarnessDb } from "../src/state-db";
import { buildDeclaration } from "./tools/design-registry-fixture";

// PLAN-L7-528-design-registry-authority-transition: Design Registry slice5。
// L8テスト設計 U-DRG-010 / U-DRG-011 行を機械検査する。
// L5 §2 が後続スライスへ送った「revision 更新の write 経路（UPDATE + versions 追記 + stale 遷移）」の着地。

function graphOf(): RegistryGraphV1 {
  const graph = validateRegistryGraph(buildDeclaration());
  if (!graph.ok) throw new Error("fixture graph must validate");
  return graph.value;
}

/** current graph 上の node を、実フィールドから digest を導出し直した「次 revision」へ進める。 */
function revise(
  graph: RegistryGraphV1,
  entityId: string,
  overrides: Partial<RegistryNodeV1> = {},
): RegistryNodeV1 {
  const current = graph.nodes.find((node) => node.entity_id === entityId);
  if (!current) throw new Error(`fixture node missing: ${entityId}`);
  const next = {
    ...current,
    revision: current.revision + 1,
    source_pointer: "docs/design/helix/L2-screen/example-revised.md",
    ...overrides,
  };
  return { ...next, semantic_digest: computeRegistryNodeSemanticDigest(next) };
}

function lineageOf(graph: RegistryGraphV1, changed: string[]) {
  const lineage = markStaleLineage(graph, {
    schema_version: "design-registry-stale-trigger.v1",
    changed_entity_ids: changed,
    reason: "upstream digest drift",
  });
  if (!lineage.ok) throw new Error("fixture lineage must build");
  return lineage.value;
}

function transitionOf(
  graph: RegistryGraphV1,
  overrides: {
    operation_id?: string;
    expected_registry_head?: string;
    next_nodes?: RegistryNodeV1[];
    lineage?: ReturnType<typeof lineageOf> | null;
  } = {},
) {
  return buildAuthorityTransition({
    operation_id: overrides.operation_id ?? "tr-1",
    expected_registry_head: overrides.expected_registry_head ?? "registry-head-genesis",
    current: graph,
    next_nodes: overrides.next_nodes ?? [revise(graph, "SCR-pm-01")],
    lineage: overrides.lineage === undefined ? null : overrides.lineage,
    reason: "slice5 transition",
  });
}

function unwrap<T>(result: { ok: true; value: T } | { ok: false; failures: unknown }): T {
  if (!result.ok) throw new Error(`expected ok: ${JSON.stringify(result.failures)}`);
  return result.value;
}

function codesOf(result: { ok: boolean; failures?: readonly { code: string }[] }): string[] {
  return result.ok ? [] : (result.failures ?? []).map((failure) => failure.code);
}

describe("design-registry authority transition (PLAN-L7-528)", () => {
  it("U-DRG-010: revision bumpとstale遷移をfail-closeつきで決定的に組み立てる", () => {
    const graph = graphOf();

    // 正常系: revision bump は version 行を採番し、node update は from/to revision を束縛する
    const built = unwrap(transitionOf(graph));
    expect(built.schema_version).toBe("design-registry-transition.v1");
    expect(built.apply_order).toEqual(["version", "node", "edge", "head"]);
    expect(built.node_updates).toHaveLength(1);
    expect(built.node_updates[0]).toMatchObject({
      entity_id: "SCR-pm-01",
      from_revision: 1,
      to_revision: 2,
    });
    expect(built.version_appends).toHaveLength(1);
    expect(built.version_appends[0]).toMatchObject({
      version_id: "SCR-pm-01@2",
      entity_id: "SCR-pm-01",
      revision: 2,
      supersedes_revision: 1,
    });

    // 決定性: 同義入力は同一 operation_digest（2 回実行で deep-equal）
    expect(unwrap(transitionOf(graph))).toEqual(built);

    // aliasing 遮断: 返り値を書き換えても入力 graph は汚染されない
    const firstUpdate = built.node_updates[0];
    if (firstUpdate === undefined) throw new Error("node_updates must not be empty");
    firstUpdate.to_revision = 99;
    expect(graph.nodes.find((n) => n.entity_id === "SCR-pm-01")?.revision).toBe(1);

    // stale 遷移: lineage の entity / edge が authority=stale の update として現れ、
    // revision は進めない（version 行を採番しない）
    const lineage = lineageOf(graph, ["SCR-pm-01"]);
    const staleOnly = unwrap(transitionOf(graph, { next_nodes: [], lineage }));
    expect(staleOnly.version_appends).toHaveLength(0);
    expect(staleOnly.node_updates.length).toBe(lineage.stale_entity_ids.length);
    expect(staleOnly.edge_updates.length).toBe(lineage.stale_edge_ids.length);
    for (const update of staleOnly.node_updates) {
      expect(update.to_authority).toBe("stale");
      expect(update.to_revision).toBe(update.from_revision);
    }

    // 反例1: 未知 entity は DRG_ID_INVALID
    expect(
      codesOf(
        transitionOf(graph, {
          next_nodes: [{ ...revise(graph, "SCR-pm-01"), entity_id: "SCR-unknown" }],
        }),
      ),
    ).toContain("DRG_ID_INVALID");

    // 反例2: revision が current+1 でない（据え置き・飛び越し）は DRG_REVISION_MISMATCH
    for (const revision of [1, 4]) {
      const skewed = revise(graph, "SCR-pm-01");
      const next = { ...skewed, revision };
      expect(
        codesOf(
          transitionOf(graph, {
            next_nodes: [{ ...next, semantic_digest: computeRegistryNodeSemanticDigest(next) }],
          }),
        ),
      ).toContain("DRG_REVISION_MISMATCH");
    }

    // 反例3: semantic_digest の masked mutation（宣言 digest を信じない）は DRG_STALE_INPUT
    expect(
      codesOf(
        transitionOf(graph, {
          next_nodes: [{ ...revise(graph, "SCR-pm-01"), semantic_digest: "sha256:deadbeef" }],
        }),
      ),
    ).toContain("DRG_STALE_INPUT");

    // 反例4: 同一 entity の identity（kind）すり替えは DRG_REVISION_MISMATCH
    expect(
      codesOf(transitionOf(graph, { next_nodes: [revise(graph, "SCR-pm-01", { kind: "flow" })] })),
    ).toContain("DRG_REVISION_MISMATCH");

    // 反例5: next_nodes 内の entity_id 重複は DRG_DUPLICATE_ID
    expect(
      codesOf(
        transitionOf(graph, {
          next_nodes: [revise(graph, "SCR-pm-01"), revise(graph, "SCR-pm-01")],
        }),
      ),
    ).toContain("DRG_DUPLICATE_ID");

    // 反例6: authority lattice の逆行（retired → canonical）は DRG_REVISION_MISMATCH
    const retiredGraph: RegistryGraphV1 = {
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.entity_id === "SCR-pm-01" ? { ...node, authority: "retired" as const } : node,
      ),
    };
    expect(
      codesOf(
        transitionOf(retiredGraph, {
          next_nodes: [revise(retiredGraph, "SCR-pm-01", { authority: "canonical" })],
        }),
      ),
    ).toContain("DRG_REVISION_MISMATCH");

    // canonical → retired の直行終端化は許可する（stale 経由を強制しない。L5 §2 の lattice 明記）
    const retiring = unwrap(
      transitionOf(graph, {
        next_nodes: [revise(graph, "SCR-pm-01", { authority: "retired" })],
      }),
    );
    expect(retiring.node_updates[0]?.to_authority).toBe("retired");

    // 反例7: 空遷移（変化 0）は静かな green を許さず DRG_STALE_INPUT
    expect(codesOf(transitionOf(graph, { next_nodes: [], lineage: null }))).toContain(
      "DRG_STALE_INPUT",
    );

    // 反例8: lineage が current に無い entity を指す場合は DRG_ID_INVALID
    expect(
      codesOf(
        transitionOf(graph, {
          next_nodes: [],
          lineage: { ...lineageOf(graph, ["SCR-pm-01"]), stale_entity_ids: ["SCR-unknown"] },
        }),
      ),
    ).toContain("DRG_ID_INVALID");

    // 反例9: operation_id / expected head の空は DRG_ID_INVALID
    expect(codesOf(transitionOf(graph, { operation_id: "  " }))).toContain("DRG_ID_INVALID");
    expect(codesOf(transitionOf(graph, { expected_registry_head: "" }))).toContain(
      "DRG_ID_INVALID",
    );
  });

  it("U-DRG-010b: in-memory storeがCAS・二重operation・改変拒否で増分0を保つ", async () => {
    const graph = graphOf();
    const { state, store } = createInMemoryRegistryStore("registry-head-genesis");
    const seeded = await commitRegistry(
      unwrap(
        buildRegistryCommit({
          graph,
          operation_id: "op-seed",
          expected_registry_head: "registry-head-genesis",
        }),
      ),
      store,
    );
    expect(seeded.ok, JSON.stringify(seeded)).toBe(true);
    if (!seeded.ok) return;
    const head = seeded.value.after_registry_head;

    // 正常系: node revision が進み version 行が増える
    const receipt = await applyAuthorityTransition(
      unwrap(transitionOf(graph, { expected_registry_head: head })),
      store,
    );
    expect(receipt.ok, JSON.stringify(receipt)).toBe(true);
    if (!receipt.ok) return;
    expect(receipt.value.updated_node_count).toBe(1);
    expect(receipt.value.appended_version_count).toBe(1);
    expect(state.head).toBe(receipt.value.after_registry_head);
    expect(state.nodes.find((node) => node.entity_id === "SCR-pm-01")?.revision).toBe(2);
    expect(state.versions.some((version) => version.version_id === "SCR-pm-01@2")).toBe(true);
    const afterHead = state.head;
    const nodeCount = state.nodes.length;
    const versionCount = state.versions.length;

    // 期待 head CAS 不一致は増分 0
    const casMiss = await applyAuthorityTransition(
      unwrap(
        transitionOf(graph, { operation_id: "tr-cas", expected_registry_head: "registry-head-x" }),
      ),
      store,
    );
    expect(codesOf(casMiss)).toContain("DRG_CAS_CONFLICT");
    expect(state.head).toBe(afterHead);
    expect(state.versions).toHaveLength(versionCount);

    // 二重 operation は増分 0（operations 台帳の冪等性）
    const duplicate = await applyAuthorityTransition(
      unwrap(transitionOf(graph, { expected_registry_head: afterHead })),
      store,
    );
    expect(codesOf(duplicate)).toContain("DRG_CAS_CONFLICT");
    expect(state.head).toBe(afterHead);

    // bundle の masked mutation（digest を信じない再検証）は store へ届かない
    const tampered = unwrap(
      transitionOf(graph, { operation_id: "tr-tamper", expected_registry_head: afterHead }),
    );
    const tamperedUpdate = tampered.node_updates[0];
    if (tamperedUpdate === undefined) throw new Error("node_updates must not be empty");
    tamperedUpdate.to_revision = 9;
    const rejected = await applyAuthorityTransition(tampered, store);
    expect(codesOf(rejected)).toContain("DRG_STALE_INPUT");

    // bundle 内で identity が自己矛盾（from_kind と node.kind の食い違い）も apply 層が弾く
    const identityMismatch = unwrap(
      transitionOf(graph, { operation_id: "tr-identity", expected_registry_head: afterHead }),
    );
    const identityTarget = identityMismatch.node_updates[0];
    if (identityTarget === undefined) throw new Error("node_updates must not be empty");
    identityTarget.from_kind = "flow";
    expect(codesOf(await applyAuthorityTransition(identityMismatch, store))).toContain(
      "DRG_STALE_INPUT",
    );

    // edge の revision 自己矛盾（from_revision と edge.revision の食い違い）も同様
    const edgeMismatch = unwrap(
      transitionOf(graph, {
        operation_id: "tr-edge-mismatch",
        expected_registry_head: afterHead,
        next_nodes: [],
        lineage: lineageOf(graph, ["SCR-pm-01"]),
      }),
    );
    const edgeTarget = edgeMismatch.edge_updates[0];
    if (edgeTarget === undefined) throw new Error("edge_updates must not be empty");
    edgeTarget.from_revision = 42;
    expect(codesOf(await applyAuthorityTransition(edgeMismatch, store))).toContain(
      "DRG_STALE_INPUT",
    );
    expect(state.nodes).toHaveLength(nodeCount);
    expect(state.head).toBe(afterHead);
  });

  it("U-DRG-011: SQLite storeがUPDATE経路のrevision CASとrollbackで行増分0を保つ", async () => {
    const graph = graphOf();
    const db = openHarnessDb(":memory:");
    ensureDesignRegistryTables(db);
    seedSqliteDesignRegistryHead(db, "registry-head-genesis");
    const store = createSqliteDesignRegistryStore(db, "2026-08-08T00:00:00Z");
    const seeded = await commitRegistry(
      unwrap(
        buildRegistryCommit({
          graph,
          operation_id: "op-seed",
          expected_registry_head: "registry-head-genesis",
        }),
      ),
      store,
    );
    expect(seeded.ok, JSON.stringify(seeded)).toBe(true);
    if (!seeded.ok) return;
    const head = seeded.value.after_registry_head;
    const before = readDesignRegistryStatus(db);

    // 正常系: UPDATE 経路で revision が進み versions が 1 行増える
    const receipt = await applyAuthorityTransition(
      unwrap(transitionOf(graph, { expected_registry_head: head })),
      store,
    );
    expect(receipt.ok, JSON.stringify(receipt)).toBe(true);
    if (!receipt.ok) return;
    const after = readDesignRegistryStatus(db);
    expect(after.registry_head).toBe(receipt.value.after_registry_head);
    expect(after.counts.design_registry_nodes).toBe(before.counts.design_registry_nodes);
    expect(after.counts.design_registry_versions).toBe(before.counts.design_registry_versions + 1);
    // revision は TEXT affinity 列。number を直接 bind すると '2.0' として保存され
    // 文字列 '2' と等値比較で一致しない（行 CAS が静かに外れる）。十進正準表現を固定する。
    const row = db
      .prepare("SELECT revision, authority FROM design_registry_nodes WHERE entity_id = ?")
      .get("SCR-pm-01") as { revision: string; authority: string };
    expect(row.revision).toBe("2");
    const genesisRevisions = db
      .prepare("SELECT DISTINCT revision FROM design_registry_nodes ORDER BY revision")
      .all() as { revision: string }[];
    expect(genesisRevisions.map((r) => r.revision)).toEqual(["1", "2"]);

    // stale 遷移が edge の authority まで永続化される。
    // 遷移は「現在ビュー」基準で組む（revision bump 済みの view を読み直す）。
    const revised = revise(graph, "SCR-pm-01");
    const graphAfter: RegistryGraphV1 = {
      ...graph,
      nodes: graph.nodes.map((node) => (node.entity_id === "SCR-pm-01" ? revised : node)),
    };
    const lineage = lineageOf(graphAfter, ["SCR-pm-01"]);
    const staleReceipt = await applyAuthorityTransition(
      unwrap(
        transitionOf(graphAfter, {
          operation_id: "tr-stale",
          expected_registry_head: after.registry_head,
          next_nodes: [],
          lineage,
        }),
      ),
      store,
    );
    expect(staleReceipt.ok, JSON.stringify(staleReceipt)).toBe(true);
    const staleEdges = db
      .prepare("SELECT COUNT(*) AS n FROM design_registry_edges WHERE authority = 'stale'")
      .get() as { n: number };
    expect(staleEdges.n).toBe(lineage.stale_edge_ids.length);

    const settled = readDesignRegistryStatus(db);

    // 行 CAS: from_revision が DB と食い違う transition は rollback（行増分 0）。
    // 注意: version_id が衝突する再送は UNIQUE 制約が先に発火して node 行 CAS へ到達しない
    // （review round1 Critical: 旧 oracle はこの経路を検査できていなかった）。以下は
    // version 追記を伴わない stale 遷移だけで node/edge の行 CAS を個別に kill する。
    const stale = await applyAuthorityTransition(
      unwrap(
        transitionOf(graph, {
          operation_id: "tr-lost-update",
          expected_registry_head: settled.registry_head,
        }),
      ),
      store,
    );
    expect(codesOf(stale)).toContain("DRG_CAS_CONFLICT");
    expect(readDesignRegistryStatus(db)).toEqual(settled);

    // --- 行 CAS の分離 kill -------------------------------------------------------
    // 各反例を「新規 seed 済み DB」で 1 要因だけ壊して当てる。同一 DB 上で連続実行すると
    // 先行遷移が動かした authority/revision が別要因の CAS 不一致を生み、node 側と edge 側が
    // 互いを覆い隠して「どの分岐で落ちたか」が特定できない（review round1 Critical の再発防止）。
    async function seededStore(): Promise<{
      db: ReturnType<typeof openHarnessDb>;
      store: ReturnType<typeof createSqliteDesignRegistryStore>;
    }> {
      const freshDb = openHarnessDb(":memory:");
      ensureDesignRegistryTables(freshDb);
      seedSqliteDesignRegistryHead(freshDb, "registry-head-genesis");
      const freshStore = createSqliteDesignRegistryStore(freshDb, "2026-08-08T00:00:00Z");
      const genesis = await commitRegistry(
        unwrap(
          buildRegistryCommit({
            graph,
            operation_id: "op-seed",
            expected_registry_head: "registry-head-genesis",
          }),
        ),
        freshStore,
      );
      if (!genesis.ok) throw new Error("fixture genesis must commit");
      return { db: freshDb, store: freshStore };
    }

    // (a) node 行 CAS のみ: edge update を伴わない revision bump を、DB 側 revision を
    //     外から進めた（lost update を模擬した）entity に当てる。version_id は未使用で
    //     UNIQUE 制約は関与しないため、落ちる分岐は node 行 CAS ただ一つ。
    {
      const fresh = await seededStore();
      fresh.db
        .prepare("UPDATE design_registry_nodes SET revision = '7' WHERE entity_id = ?")
        .run("VDH-FR-004");
      const baseline = readDesignRegistryStatus(fresh.db);
      const result = await applyAuthorityTransition(
        unwrap(
          transitionOf(graph, {
            operation_id: "tr-node-row-cas",
            expected_registry_head: baseline.registry_head,
            next_nodes: [revise(graph, "VDH-FR-004")],
          }),
        ),
        fresh.store,
      );
      expect(codesOf(result), "node row CAS").toContain("DRG_CAS_CONFLICT");
      expect(readDesignRegistryStatus(fresh.db)).toEqual(baseline);
      fresh.db.close();
    }

    // (b) edge 行 CAS のみ: node 側は DB 実態と一致させたまま、edge の revision だけを
    //     外から進める。落ちる分岐は edge 行 CAS ただ一つ。
    {
      const fresh = await seededStore();
      fresh.db
        .prepare("UPDATE design_registry_edges SET revision = '7' WHERE edge_id = ?")
        .run("presents:SCR-pm-01->INT-approve-click");
      const baseline = readDesignRegistryStatus(fresh.db);
      const result = await applyAuthorityTransition(
        unwrap(
          transitionOf(graph, {
            operation_id: "tr-edge-row-cas",
            expected_registry_head: baseline.registry_head,
            next_nodes: [],
            lineage: lineageOf(graph, ["SCR-pm-01"]),
          }),
        ),
        fresh.store,
      );
      expect(codesOf(result), "edge row CAS").toContain("DRG_CAS_CONFLICT");
      expect(readDesignRegistryStatus(fresh.db)).toEqual(baseline);
      fresh.db.close();
    }

    // (c) 完全適応的改変（identity ごと整合的に作り直した bundle）: bundle 内部は自己整合
    //     しており apply 層では判別できないため、DB 実態との行 CAS が最終防衛線になる。
    {
      const fresh = await seededStore();
      const baseline = readDesignRegistryStatus(fresh.db);
      const forged: RegistryGraphV1 = {
        ...graph,
        nodes: graph.nodes.map((node) =>
          node.entity_id === "SCR-pm-01" ? { ...node, kind: "flow" as const } : node,
        ),
      };
      const result = await applyAuthorityTransition(
        unwrap(
          transitionOf(forged, {
            operation_id: "tr-identity-forge",
            expected_registry_head: baseline.registry_head,
            next_nodes: [revise(forged, "SCR-pm-01")],
          }),
        ),
        fresh.store,
      );
      expect(codesOf(result), "identity forge").toContain("DRG_CAS_CONFLICT");
      expect(readDesignRegistryStatus(fresh.db)).toEqual(baseline);
      fresh.db.close();
    }

    // (d) 同上: edge revision を偽装した bundle も DB 実態と食い違って落ちる。
    {
      const fresh = await seededStore();
      const baseline = readDesignRegistryStatus(fresh.db);
      const forged: RegistryGraphV1 = {
        ...graph,
        edges: graph.edges.map((edge) => ({ ...edge, revision: 999 })),
      };
      const result = await applyAuthorityTransition(
        unwrap(
          transitionOf(forged, {
            operation_id: "tr-edge-forge",
            expected_registry_head: baseline.registry_head,
            next_nodes: [],
            lineage: lineageOf(forged, ["SCR-pm-01"]),
          }),
        ),
        fresh.store,
      );
      expect(codesOf(result), "edge revision forge").toContain("DRG_CAS_CONFLICT");
      expect(readDesignRegistryStatus(fresh.db)).toEqual(baseline);
      fresh.db.close();
    }

    // BEGIN 失敗・apply fault・lock 内 head CAS 競合はすべて typed failure で行増分 0
    const faults = [
      { injectBeginFault: true },
      { injectAppendFault: "design_registry_versions" },
      { injectAppendFault: "design_registry_nodes" },
      { injectAppendFault: "design_registry_edges" },
      {
        onBeforeHeadUpdate: () => {
          db.prepare(
            "UPDATE design_registry_heads SET registry_head = 'intruder' WHERE head_id = 'current'",
          ).run();
        },
      },
    ];
    for (const [index, options] of faults.entries()) {
      const faultDb = openHarnessDb(":memory:");
      ensureDesignRegistryTables(faultDb);
      seedSqliteDesignRegistryHead(faultDb, "registry-head-genesis");
      const faultStore = createSqliteDesignRegistryStore(faultDb, "2026-08-08T00:00:00Z", {});
      await commitRegistry(
        unwrap(
          buildRegistryCommit({
            graph,
            operation_id: "op-seed",
            expected_registry_head: "registry-head-genesis",
          }),
        ),
        faultStore,
      );
      const baseline = readDesignRegistryStatus(faultDb);
      const injected = createSqliteDesignRegistryStore(faultDb, "2026-08-08T00:00:00Z", {
        ...options,
        ...(options.onBeforeHeadUpdate
          ? {
              onBeforeHeadUpdate: () => {
                faultDb
                  .prepare(
                    "UPDATE design_registry_heads SET registry_head = 'intruder' WHERE head_id = 'current'",
                  )
                  .run();
              },
            }
          : {}),
      });
      const result = await applyAuthorityTransition(
        unwrap(
          transitionOf(graph, {
            operation_id: `tr-fault-${index}`,
            expected_registry_head: baseline.registry_head,
          }),
        ),
        injected,
      );
      expect(codesOf(result), `fault ${index}`).toContain("DRG_CAS_CONFLICT");
      const settledFault = readDesignRegistryStatus(faultDb);
      expect(settledFault.counts, `fault ${index} counts`).toEqual(baseline.counts);
      if (!options.onBeforeHeadUpdate) {
        expect(settledFault.registry_head, `fault ${index} head`).toBe(baseline.registry_head);
      }
      faultDb.close();
    }
    db.close();
  });
});
