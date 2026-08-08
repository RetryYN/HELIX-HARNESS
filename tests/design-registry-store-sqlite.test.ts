import { describe, expect, it } from "vitest";
import { validateRegistryGraph } from "../src/design/design-registry";
import {
  createSqliteDesignRegistryStore,
  ensureDesignRegistryTables,
  readDesignRegistryStatus,
  seedSqliteDesignRegistryHead,
} from "../src/design/design-registry-sqlite-store";
import { buildRegistryCommit, commitRegistry } from "../src/design/design-registry-transaction";
import { openHarnessDb } from "../src/state-db";
import { buildDeclaration, FULL_CHAIN_NODES } from "./tools/design-registry-fixture";

// PLAN-L7-518-design-registry-sqlite-store: Design Registry slice3。
// L8テスト設計 U-DRG-008 行を機械検査する。

function graphOf() {
  const graph = validateRegistryGraph(buildDeclaration());
  if (!graph.ok) throw new Error("fixture graph must validate");
  return graph.value;
}

function bundleOf(operationId: string, expectedHead: string) {
  const built = buildRegistryCommit({
    graph: graphOf(),
    operation_id: operationId,
    expected_registry_head: expectedHead,
  });
  if (!built.ok) throw new Error("fixture bundle must build");
  return built.value;
}

function openSeededDb(head = "registry-head-genesis") {
  const db = openHarnessDb(":memory:");
  ensureDesignRegistryTables(db);
  seedSqliteDesignRegistryHead(db, head);
  return db;
}

describe("design-registry sqlite store (PLAN-L7-518)", () => {
  it("U-DRG-008: SQLite storeがin-memory契約と同一のCAS/二重operation/rollback/改変拒否を満たす", async () => {
    // 正常系: atomic commit で head 前進し、全 table へ行が入る
    const db = openSeededDb();
    const store = createSqliteDesignRegistryStore(db, "2026-08-08T00:00:00Z");
    const receipt = await commitRegistry(bundleOf("op-1", "registry-head-genesis"), store);
    expect(receipt.ok, JSON.stringify(receipt)).toBe(true);
    const status = readDesignRegistryStatus(db);
    expect(status.registry_head).not.toBe("registry-head-genesis");
    expect(status.counts.design_registry_nodes).toBeGreaterThan(0);
    expect(status.counts.design_registry_edges).toBeGreaterThan(0);
    expect(status.counts.design_registry_versions).toBe(status.counts.design_registry_nodes);
    if (!receipt.ok) return;
    expect(status.registry_head).toBe(receipt.value.after_registry_head);
    const committed = { ...status.counts };
    const head = status.registry_head;

    // 期待 head CAS 不一致は増分 0（mutation: WHERE 条件の CAS を外すと red）
    const casMiss = await commitRegistry(bundleOf("op-2", "registry-head-wrong"), store);
    expect(casMiss.ok).toBe(false);
    if (!casMiss.ok) expect(casMiss.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // 同一 operation_id の再送は operations 台帳（DB 正本）で fail-close（mutation:
    // duplicate SELECT を外しても write-set PK 衝突が二重防御するが、台帳判定が第一防御）
    const replaySameOp = await commitRegistry(bundleOf("op-1", head), store);
    expect(replaySameOp.ok).toBe(false);
    if (!replaySameOp.ok) expect(replaySameOp.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // 別 operation_id でも同一 write-set の再送は PK/unique 制約で rollback
    const replay = await commitRegistry(bundleOf("op-1-replay", head), store);
    expect(replay.ok).toBe(false);
    if (!replay.ok) expect(replay.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // 正当な revision-bump（内容が異なる同一 entity への再 commit）も本 slice では
    // genesis-only scope として fail-close する（L5 §2 の意図した暫定 scope。UPDATE 経路は
    // 後続スライス。mutation: node PK を外すとこの fixture が red で kill）
    const bumpGraph = validateRegistryGraph(
      buildDeclaration(
        FULL_CHAIN_NODES.map((node) =>
          node.entity_id === "SCR-pm-01" ? { ...node, revision: 2 } : node,
        ),
      ),
    );
    if (!bumpGraph.ok) throw new Error("bump graph must validate");
    const bumpBuilt = buildRegistryCommit({
      graph: bumpGraph.value,
      operation_id: "op-bump",
      expected_registry_head: head,
    });
    if (!bumpBuilt.ok) throw new Error("bump bundle must build");
    const bump = await commitRegistry(bumpBuilt.value, store);
    expect(bump.ok).toBe(false);
    if (!bump.ok) expect(bump.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // 内容 tamper は commitRegistry の再検証で DRG_STALE_INPUT（store まで到達しない）
    const tampered = bundleOf("op-3", head);
    (tampered.nodes[0] as { authority: string }).authority = "retired";
    const rejected = await commitRegistry(tampered, store);
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.failures[0]?.code).toBe("DRG_STALE_INPUT");

    // 全失敗経路で増分 0
    expect(readDesignRegistryStatus(db).counts).toEqual(committed);
    expect(readDesignRegistryStatus(db).registry_head).toBe(head);

    // append fault は全 step 経路で rollback して増分 0（mutation: ROLLBACK を外すと red）
    for (const faultTable of [
      "design_registry_nodes",
      "design_registry_edges",
      "design_registry_versions",
      "design_registry_operations",
    ]) {
      const faultDb = openSeededDb();
      const faultStore = createSqliteDesignRegistryStore(faultDb, "2026-08-08T00:00:00Z", {
        injectAppendFault: faultTable,
      });
      const faulted = await commitRegistry(bundleOf("op-f", "registry-head-genesis"), faultStore);
      expect(faulted.ok, faultTable).toBe(false);
      const faultStatus = readDesignRegistryStatus(faultDb);
      expect(faultStatus.counts.design_registry_nodes, faultTable).toBe(0);
      expect(faultStatus.counts.design_registry_edges, faultTable).toBe(0);
      expect(faultStatus.counts.design_registry_versions, faultTable).toBe(0);
      expect(faultStatus.counts.design_registry_operations, faultTable).toBe(0);
      expect(faultStatus.registry_head, faultTable).toBe("registry-head-genesis");
    }

    // BEGIN fault は typed failure へ正規化（型契約を破らない）
    const beginDb = openSeededDb();
    const beginStore = createSqliteDesignRegistryStore(beginDb, "2026-08-08T00:00:00Z", {
      injectBeginFault: true,
    });
    const beginFail = await commitRegistry(bundleOf("op-b", "registry-head-genesis"), beginStore);
    expect(beginFail.ok).toBe(false);
    if (!beginFail.ok) expect(beginFail.failures[0]?.code).toBe("DRG_CAS_CONFLICT");

    // lock 内 CAS: head UPDATE 直前の競合書込は影響行数 0 → rollback（lost update 遮断。
    // mutation: WHERE の期待 head 条件を外すとこの fixture が red で kill）
    const rivalDb = openSeededDb();
    const rivalStore = createSqliteDesignRegistryStore(rivalDb, "2026-08-08T00:00:00Z", {
      onBeforeHeadUpdate: () => {
        rivalDb
          .prepare(
            "UPDATE design_registry_heads SET registry_head = 'rival-head' WHERE head_id = 'current'",
          )
          .run();
      },
    });
    const rival = await commitRegistry(bundleOf("op-r", "registry-head-genesis"), rivalStore);
    expect(rival.ok).toBe(false);
    if (!rival.ok) expect(rival.failures[0]?.code).toBe("DRG_CAS_CONFLICT");
    // 同一 connection の transaction 内注入のため rival 書込も rollback され、head は
    // 原状（lost update も汚染も 0）。commit 側が成功していれば red になる oracle。
    expect(readDesignRegistryStatus(rivalDb).registry_head).toBe("registry-head-genesis");
    expect(readDesignRegistryStatus(rivalDb).counts.design_registry_nodes).toBe(0);

    // 未 seed（heads 行なし）は fail-close（silent genesis を発行しない）
    const bareDb = openHarnessDb(":memory:");
    ensureDesignRegistryTables(bareDb);
    const bareStore = createSqliteDesignRegistryStore(bareDb, "2026-08-08T00:00:00Z");
    const bare = await commitRegistry(bundleOf("op-u", "registry-head-genesis"), bareStore);
    expect(bare.ok).toBe(false);
  });
});
