---
layer: L8
artifact_type: test_design
status: confirmed
legacy_source: docs/test-design/harness/L7-unit-test-design.md
pair_artifact: docs/design/harness/L6-function-design/
created: 2026-07-08
updated: 2026-07-11
---

# HELIX — L8 単体テスト設計

## §0 位置付け

PO 指示（2026-07-08）により、L7 実装 PLAN の起票前提として参照する単体テスト設計の正本 path を
`docs/test-design/harness/L8-unit-test-design.md` とする。

既存 `docs/test-design/harness/L7-unit-test-design.md` は legacy shim として残すが、2026-07-08 以降に起票する
`kind=impl` / `kind=add-impl` の L7 PLAN は、本書を `pair_artifact` に持たなければならない。

## §1 起票 gate

- L7 PLAN は L6 機能設計 doc を `parent_design` に持つ。
- L7 PLAN は本書を `pair_artifact` に持つ。
- L7 PLAN は `generates` に `test_code` を持つ。
- L7 PLAN が採用候補や設計棚卸しだけを本文に置く場合、実装 ready として扱わず L3-L6 へ降下する。

## §2 Legacy 移行

既存の L7-unit test design 内容は本書へ段階移行する。移行完了まで、本書は gate 用の正本 path として機能し、
詳細 oracle は旧正本を参照する。

## §3 単体 oracle 被覆

L8 は単体テスト設計の正本であり、L9 結合テスト設計とは混同しない。既存 oracle は段階移行中のため、
本書は `fr-unit-coverage.md` と legacy `L7-unit-test-design.md` を参照しながら L6 function design の
単体粒度を閉じる。

| 被覆 family | trace | oracle route |
|---|---|---|
| L6 function contract | FR-L1-01..FR-L1-51 | `docs/design/harness/L6-function-design/fr-unit-coverage.md` の `U-FR-*` 行を単体 oracle 正本とする |
| descent obligation | FR-L1-03 | `U-DESC-*`。L6 から L8 単体テスト設計への pair を fail-close で検査する |
| plan descent gate | FR-L1-03 | `U-PDESC-*`。L7 impl PLAN は L8 unit pair を持つまで起票不可 |
| vmodel pair-freeze | FR-L1-03 | `U-VPAIR-007/008`。未参照test-designと不正なtyped exemptionをfail-closeし、nested pathとlive exemption集合も検査する。詳細fixtureはlegacy L7 test-designと`tests/vmodel-pair.test.ts`で保持する |
| visualization recovery handoff | U-VISUAL-003 | `close_ready` の `decision_draft` artifact を read-only Project view と `vmodel fit` recovery handoff gate に投影し、closure review scope / outcome / generation command / approval lane を表示する。詳細 oracle は legacy `L7-unit-test-design.md` の U-VISUAL-003 と `tests/visualization-read-model.test.ts` / `tests/visualization-treeview.test.ts` が担う |
| memory delegation recall 注入 | PLAN-L7-406 / PLAN-L7-414 / L6-64 §3-§4 | `U-MEMX-001/001b/002/003/004/005`（MEMX-S1..S5 の降下）。委譲 stdin への MEMORY_RECALL_HEADER 合成、空入力の byte 同一 no-op、skill 注入との固定順序、DELEGATION_MEMORY_BUDGET（6 件/200 chars）の cap、skill 0 件でも memory recall を落とさない独立条件、surface policy（delegation / team_run / task_route の全呼出面で注入。PLAN-L7-414 の解禁後仕様。新呼出面は policy 追加まで非注入の fail-close 既定）を `tests/runtime-adapter.test.ts` が担う |
| feedback surface group-first cap | PLAN-L7-404 | 単一 signal_type クラスタの予算独占排除（group 単位 limit・surface_count 実数保持・group breadcrumb）と escalation surface cap（既定 10、0=無制限）を `tests/feedback-surface.test.ts` / `tests/attempt-escalation.test.ts` の PLAN-L7-404 ケースが担う |
| agent-guard fable apex 境界 | PLAN-L7-409 / PLAN-L7-306 | `U-AGFA-001/002/003`。fable 要求は `FABLE_APEX_SUBAGENTS`（現行 advisor-fable のみ）以外を fail-close で block、frontmatter に fable を宣言しただけの非 apex agent の worker 用途を拒否、bypass は `HELIX_ALLOW_RAW_AGENT=1` のみ（WARN 付き）を `tests/agent-guard.test.ts` が担う |
| docs / runtime state secret-scan | PLAN-L7-410 / PLAN-L7-52 | `U-SSCAN-001..004`。credential marker（narrow 正本 + aws/github/private-key/bearer/assignment）の violation 報告、明示的合図語 allow marker と語境界の非誤検知、clean 集合の OK message、実 repo regression（violations=0 の機械検証）を `tests/secret-scan.test.ts` が担う |
| harness memory structure v2 | PLAN-L7-407 / L6-62 §8 | `U-MEMV2-001a/001b/002a/002b/003/004a/004b/005a/005b/006/007a/007b/008a/008b`。v1互換、raw codec fail-close、operationId crash recovery、SQLite coordination/fencing、別process consume/compact-write race、takeover lifecycle、group-first/code-point budget、body非包含session eventを`tests/memory/memory-v2.test.ts`が担う |
| feedback lifecycle | PLAN-L6-63 / `feedback-lifecycle.md` §9 | 下表の12 oracle。journal、surface、session nudgeの各testへ1:1降下する |
| session handover retirement | PLAN-L6-61 / `handover-retirement.md` §8 | `U-HRET-001..014`。typed disposition、phase journal、移管reconcile、at-least-once delivery、旧surface不存在・復活検出を下表の単体oracleへ降下する |

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-FLIFE-001 | strict codec / state machine | unknown version・非UTC・禁止遷移・破損行をfail-closeし、正常sourceを隠さずdiagnostic化 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-002 | operation replay / SQLite lock | 同intent replayは追記0、異intentはconflict、直列化後のeventは1系列 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-003 | crash recovery | multi-eventのpartial append後retryはsemantic prefixを検証し不足eventだけ追記 | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-004 | terminal再投影 | closed同generationは復活せず、authoritative再activeだけ新activity epochでopen | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-005 | generation / firstSeen | active再投影・通常payload driftはTTLを戻さず、安全側bucket昇格だけpolicy epochを進める | `tests/feedback-lifecycle.test.ts` |
| U-FLIFE-006 | telemetry TTL | 24h-1msはopen、境界一致でtelemetryだけack、gate/actionable/future clockは対象外 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-007 | canonical alias join | feedback_events aliasとfindings/quality_signals直読をfilter前に同identityへ正規化 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-008 | safe visibility | lifecycle unavailable・damaged・digest mismatch時は未解決を表示しruntime fail-open | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-009 | dedupe / breadcrumb | fingerprint衝突で最高severityと全identityを保持し、理由別hiddenを分離 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-010 | session receipt | surface receiptは同一sessionだけ抑止し、未ack項目は次sessionで再表示 | `tests/feedback-lifecycle-surface.test.ts` |
| U-FLIFE-011 | promotion truth table / concurrency | 成功commit/plan_switchあり・成功memory_writeなしの場合だけ並行Stopを1通知へ収束 | `tests/memory-promotion.test.ts` |
| U-FLIFE-012 | fail-open / privacy | 破損log・nudge書込失敗でもStop 0、eventへbody/diff/secretを保存しない | `tests/memory-promotion.test.ts` |

### session handover 廃止の oracle

PLAN-REVERSE-344がR4へmergeされるまで本節は設計oracleであり、実装greenを主張しない。L7 retirement PLANは
以下の全oracleを`test_code`へ1:1で束縛し、provider/operations evidenceの保持試験を旧surface不存在試験と
分離しなければならない。

| U-ID | 対象 | 反例と期待結果 |
|---|---|---|
| U-HRET-001 | typed inventory | live参照の未分類、型なしallowlist、同一symbolの矛盾分類をhard fail |
| U-HRET-002 | phase state machine | prerequisite未達、逆行、complete後rollback、異intent replayを拒否 |
| U-HRET-003 | legacy note移管 | provenance/TTL/link/operationIdを持つ有効noteだけ最大1件移管しsecret/PIIを拒否 |
| U-HRET-004 | journal crash recovery | partial append後にsemantic prefixを検証し、完了checkpointを重複実行しない |
| U-HRET-005 | delivery semantics | stable deliveryIdでconsumer dedupeし、stdout成功後crashの再配信を許容 |
| U-HRET-006 | continuation precedence | DBとmemory矛盾時はDBを表示しdiagnosticを生成、memoryでDBを上書きしない |
| U-HRET-007 | Stop / complete | session digest・DB event・promotion nudgeだけを生成しCURRENT/proseを書かない |
| U-HRET-008 | preserve境界 | provider delegationとoperations transitionをcontinuation sourceにはしない。retirement前後で件数・原本digest・provenance・schema validation・query/export可用性・retention metadataが不変であることを別fixtureで検証する |
| U-HRET-009 | archive reconcile | source/target件数とper-file digest一致前のsource削除を拒否 |
| U-HRET-010 | backup / rollback | checkpoint・digest一致時だけcomplete前rollbackを許可 |
| U-HRET-011 | generated surfaces | adapter/setup/template/task/CI/distributionのmanifest差分をfail-close |
| U-HRET-012 | resurrection | complete後の旧CLI/path/import/writer/CURRENT再出現をhard fail |
| U-HRET-013 | fresh / brownfield | 旧surfaceなしでactive PLAN・blocker・next authority・feedbackを再開 |
| U-HRET-014 | residual allowlist | provider/operations/archive以外のlive handover residualを0とする |

## §4 L6 reverse reference 追補

`l6-completion` は L6 設計 doc の filename が L8 単体テスト設計または旧正本に現れることを
凍結入力として扱う。以下の L6 追加設計は L8 正本の逆参照として保持し、詳細 oracle は
対応 PLAN / 旧正本に残す。

| L6 doc | oracle route |
|---|---|
| `handover-db-derivation.md` | retirement prerequisite の歴史的 oracle。`handover-retirement.md` に supersede され、独立した現役green契約やCURRENT writerの根拠にしない |
| `handover-retirement.md` | session/prose handover廃止、継続状態移管、復活検出の`U-HRET-*` oracle |
| `harness-memory-compaction.md` | harness memory 圧縮の単体 oracle |
| `memory-cross-runtime-surface.md` | memory delegation recall 注入の単体 oracle（`U-MEMX-*`） |
| `harness-memory-structure.md` | memory v2 schema/lifecycle/fencing/compaction/delivery の14単体 oracle（`U-MEMV2-*`） |
| `feedback-lifecycle.md` | feedback lifecycle状態機械・TTL・surface filter・promotion nudgeの12単体oracle（`U-FLIFE-*`） |
| `plan-descent-specific-parent-binding.md` | PSPB 系 oracle |
| `reverse-feedback-closure.md` | reverse feedback 閉塞の単体 oracle |
