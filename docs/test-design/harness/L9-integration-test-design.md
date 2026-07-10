---
layer: L9
artifact_type: test_design
status: confirmed
pair_freeze_exempt: true
pair_freeze_exempt_kind: layer_migration_staged
pair_freeze_exempt_reason: "L8=unit/L9=integrationへのatomic layer migrationが未完了のため、現行L5↔L8正本を維持してstaged扱いにする"
pair_freeze_exempt_target: docs/test-design/harness/L8-integration-test-design.md
legacy_source: docs/test-design/harness/L8-integration-test-design.md
pair_artifact: docs/design/harness/L5-detailed-design/
created: 2026-07-08
updated: 2026-07-08
---

# HELIX — L9 結合テスト設計

## §0 位置付け

PO 指示（2026-07-08）により、結合テスト設計の正本 path を
`docs/test-design/harness/L9-integration-test-design.md` とする。

既存 `docs/test-design/harness/L8-integration-test-design.md` は legacy shim として残し、詳細 oracle は段階移行する。

## §1 結合テスト oracle

L9 結合テスト設計は、L5 詳細設計の module boundary、adapter boundary、state boundary、DB projection、
search / feedback / automation / guardrail / asset catalog boundary を、IT-* の Given / When / Then 粒度で検証する。

初期移行では、既存 `L8-integration-test-design.md` の IT-* 行を legacy oracle として参照する。
新規 PLAN では、L8 を単体テスト設計、L9 を結合テスト設計として扱い、L7 起票 gate の unit pair と混同しない。

| 結合 family | trace | oracle route |
|---|---|---|
| module / adapter boundary | FR-L1-01..FR-L1-51 | legacy `L8-integration-test-design.md` の IT-* 行を L9 結合 oracle として段階移行する |
| DB / state projection（DB / state 投影） | FR-L1-03 / FR-L1-07 / FR-L1-47 | IT-DB / IT-STATE / IT-FEEDBACK family（系列） |
| automation / guardrail / asset catalog（自動化 / 防護 / 資産 catalog） | FR-L1-09 / FR-L1-46..FR-L1-49 | IT-AUTOMATION / IT-GUARDRAIL / IT-ASSET family（系列） |

## §2 確定済み IT case design

| IT-ID（識別子） | Given（前提） | When（操作） | Then（期待結果） | Fixture / Boundary（fixture / 境界） | Assertions（検証） | Negative / Edge（異常・境界） |
|---|---|---|---|---|---|---|
| IT-MODULE-01 | L5 module contract と L6 function contract が confirmed で、対象 trace が L7 実装 PLAN に接続されている | module boundary をまたぐ CLI / runtime / lint function を実行する | public behavior は L5 contract の入出力・error policy・state transition と一致する | harness module boundary、adapter boundary、state projection | exit code / normalized finding / DB projection row が期待値と一致する | downstream design が欠ける場合は L9 pass ではなく L5/L6 reverse または plan-descent violation へ route する |
| IT-DB-01 | harness.db projection 対象の event / state / feedback source が fixture として存在する | projection writer と read model を同一 slice で実行する | persisted row と query result が trace key、PLAN ID、evidence path を失わず join できる | DB/state boundary | row count、primary key、foreign key 相当 join、timestamp provenance | missing evidence は green にしない |
| IT-CONT-01 | append-only session event、DB continuation projection、bounded memory、feedback fixtureが存在する | SessionStart/statusのcontinuation queryを実行する | DB projectionを主に、session/memory/feedbackをprovenance付きでjoinする | runtime↔state-db↔memory↔feedback | DB由来plan/next_action、event sequence、memory_ref、feedback status | memoryとDBが競合してもDB値を保持しfindingを返す（DB precedence） |
| IT-CONT-02 | event append失敗、append後・projection前、projection後・checkpoint/memory前の各crash fixture、DB消失、同一seq異payload/concurrent replayがある | restart/replayと全rebuildを反復実行する | append失敗は非公開、欠落projectionは回復、投影済みeventは重複せず、DB消失から同じread modelを再構成する。memory失敗はreadiness findingを残す | session-log↔projection writer↔memory | `(session_id,event_seq,payload_hash)` uniqueness、watermark、同一digest、next_action | truncated/invalid eventと同seq異payloadはsilent skipせずfail-close finding |
| IT-CONT-03 | repoに旧command/module/schema/panel名または`handover/CURRENT.json`生成fixtureを混入する | resurrection detectorをdoctor経由で実行する | pre-cutover shadowでは既知baselineをtelemetry、新規resurrection findingをhard failし、complete checkpoint後はfinding 1件でもhard failする | CLI/module/schema/docs/UI boundary | finding code、offending path、exit non-zero | R1 inventory gateのgreenを本oracleの実装証拠にしない。provider delegation evidence/operations transitionは型・digest・nonjoin条件付きで誤検出せず、retirement前後のcount/digest/provenance/query可用性を保持する |
| IT-CONT-04 | clean fixtureで旧CURRENT/prose sourceが存在しない | continuation surfaceを起動・照会する | absenceを正常条件として動作し、旧fileを暗黙生成しない | filesystem boundary | CURRENT不存在、writer call 0、DB query実行 | read fallbackで旧fileを作る互換shimもfail |

実装binding（PLAN-L7-416 Sprint 2）: `IT-CONT-01/02`のruntime↔real SQLite↔memory/feedback join、
fsync JSONL、crash replay、DB rebuild、同sequence異payload、strict parserは
`tests/continuation-event-first.test.ts`へcitationする。CLI/Stop/`plan complete` production routeの
切替と旧surface不存在はPO confirmation後のSprint 3で検証し、それ以前に`IT-CONT-04` greenを主張しない。
`IT-CONT-03`のshadow doctor負例は`tests/handover-resurrection.test.ts`へbinding済みだが、
baseline同時改ざん、R4 provider evidence削除、allowlist schema/content spoofもdoctor fail-closeへ束縛する。
post-complete production enforce、fresh/brownfield/distributionは未達として分離する。
| IT-GUARDRAIL-01 | L7 実装 PLAN が L6 parent design と L8 unit pair を持つ | plan lint / doctor を実行する | L8 unit pair を欠く L7 impl は起票不可、L9 integration pair と unit pair の混同も不可 | plan frontmatter、test-design path boundary | `pair_artifact_not_l8_unit_test_design` または no violation のどちらかが deterministic | L9 integration を pair に置いて L7 impl を通す regression を fail-close する |
