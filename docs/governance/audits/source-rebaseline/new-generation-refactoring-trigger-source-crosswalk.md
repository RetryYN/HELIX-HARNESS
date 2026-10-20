# 新世代の構造改善判断と旧Refactoring Trigger候補の対応

確認日: 2026-09-14

## 目的

`refactoring-trigger-admission-{requirements,acceptance}.md`の旧要件6件、旧受入12件を、HARNESSの変更・検証条件と
HELIX-OSの観測・候補・採否統制へ再分類する。旧候補はUIL、System Synthesis、Universal Workflow、RF0..RF6、
current 9 scope、既存CIを前提に承認されたcandidateであり、新世代へ承認状態や実装方式を継承しない。

旧候補には独立したL1利用要求がない。新世代では利用者価値と対象をL1／L2で確定してからL3 trigger契約を導出する。
本表は要求源の照合であり、候補生成、admission、Issue／PLAN生成、runtime write、CIを実行しない。

## 要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-R-01 | 観測から改善候補を導く規則を版・出典・baseline・window・閾値・反証・期限へ束縛する | HARNESS-L2-004／005、HELIXOS-L2-005／007 | UIL、旧event／finding、既存registry、runtime hardcode検査を固定しない | split_reapproval_required |
| RTG-R-02 | invariant違反、再発、傾向、環境変化等を別triggerとして扱い、単一metricで採択しない | HELIXOS-L2-005／007 | 旧trigger enum、release／provider event、scheduled scan、CI costを必須集合にしない | classification_rederivation_required |
| RTG-R-03 | 候補、finding、根拠、scope、意味保存、必要検証、期限を束縛し、意味変更・故障・外部変化を分ける | HARNESS-L2-004／005、HELIXOS-L2-002／003／005 | RF0、旧route、UIL／System Synthesis、Universal Workflowを継承しない | workflow_rederivation_required |
| RTG-R-04 | primary responsibilityを一意にし、関連影響とauthority未確定を分ける | HELIXOS-L2-001／002／003 | current 9 scope、旧owner、Issue #1170、`authority_pending` enumを固定しない | authority_scope_rewrite |
| RTG-R-05 | 対象集合、評価revision、source、policy、findingを記録し、未評価とfindingなしを分ける | HELIXOS-L2-002／005／007 | 旧coverage receipt、current scope、既存scannerを継承しない | semantic_atom_candidate |
| RTG-R-06 | 観測、候補、採否、有効化を分け、見逃し・誤検出・重複・手戻り・費用を比較する | HELIXOS-L2-005／007 | 旧UIL到達、shadow admission、Issue／PLAN、RF0実行、既存CIを段階条件にしない | measurement_rederivation_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-AC-001／002 | 同じ入力・policyから同じ判断を返し、stale・window・sample・期限を個別に判定する | HELIXOS L10候補 | 旧event exact set、baseline、policy schemaを固定しない | oracle_rederivation_required |
| RTG-AC-003／004 | triggerを区別し、単一metricや定期scanだけで実質findingを生成しない | HELIXOS L11／L10候補 | 旧trigger enum、LOC、Issue数、AI評価を固定oracleにしない | oracle_atom_candidate |
| RTG-AC-005／006 | scope・根拠・意味保存を確認し、unknownや非refactorを誤分類しない | HARNESS L11、HELIXOS L11／L10候補 | `code_clean`、REDESIGN／RECOVERY等の旧routeを継承しない | split_oracle_reapproval |
| RTG-AC-007／008 | owner不明・複数primary・authority未確定を採択済みにしない | HELIXOS L11／L10候補 | current 9 scopeと旧pending判定をoracleにしない | authority_oracle_rewrite |
| RTG-AC-009／010 | source欠落・partial・staleと、評価済みfindingなし・no actionを区別する | HELIXOS L11／L10候補 | 旧receipt schemaやscanner coverageを継承しない | oracle_atom_candidate |
| RTG-AC-011／012 | 観測だけから実行・Issue・PLAN・authority writeへ進めず、複数効果を比較する | HELIXOS L11／L10／L12候補 | UIL、RF0、旧CI cost、既存before／afterを新世代baselineにしない | lifecycle_oracle_rewrite |

## 新世代の構造改善境界

1. HARNESSは、意味保存の判定、変更分類、影響する上流・設計・V-pair、必要検証、差戻し条件を定める。
2. HELIX-OSは、観測、finding、改善候補、scope、重複、採否、割当、結果、効果、失効を管理する。
3. 構造改善候補は要求や設計の意味変更を実行しない。意味変更は対象製品の最上流へ別の変更候補として戻す。
4. metric、AI評価、file size、Issue数、定期scan、旧CI結果の一つだけで改善を採択・実行しない。
5. 旧実装とpolicyはarchive sourceとして意味と反例を保全し、新世代runtimeへ再接続しない。

## 次工程

Concept v4.1と対象別L1で構造改善の利用者価値を定め、HARNESS／HELIX-OS L2／L11へ個別採否する。
新しいscope、trigger、状態、効果指標はその後にL3／L10／L12へ降ろす。要求整理が閉じるまで旧UIL、RF0、
既存scanner、Issue／PLAN自動生成、既存CIを実行しない。

## 2026-10-20 追補：代表assetの再照合（Issue #1906、PHCAP-18）

確認日: 2026-10-20。固定base `f6cb2f4f575a3be6c2de027155ee1f9f831320f9`。上記の2026-09-14時点の表と歴史的候補状態は消去せず、以下は当時の判定と今回の照合結果を分けた追補である。全asset・全consumer閉包・現行実装の成立を意味しない。

### 代表assetの実読（ledger + archive実物）

| asset | 実物path・規模 | 種別 | ledger状態 | 実体 |
|---|---|---|---|---|
| 12E2CD9B07EFAC343ED0 | `docs/governance/candidates/refactoring-trigger-admission-requirements.md`（81行） | 要求 | Historical/unresolved、consumer_refs=[] | frontmatter `candidate_layer: L3`、`status: draft_candidate`、RTG-R-01〜06の要求6件＋受理pair `refactoring-trigger-admission-acceptance.md`参照 |
| 603D0E8D8193914F4AC0 | `docs/design/helix/L5-detail/design-refactoring-domain-model.md` | 設計 | Historical/unresolved | L5 `layer: L5`、`status: draft`、design_slice HDS-HIL-16、意味署名・consumer/oracle保全の外部化・共通化を記述 |
| 3B8F5F0230F7469B5D11 | `docs/design/helix/L6-function-design/design-refactoring-domain-model.md`（225行） | 設計 | Historical/unresolved | L6 `layer: L6`、`status: draft`、同じHDS-HIL-16 slice、L5文書へ `related_l5` で参照 |
| 7EBF2130DE1840722A6B | `src/state-db/refactor-candidates.ts`（400行） | 実装 | Historical/unresolved、`reuse_exclusion_class: legacy_runtime_cli_or_adapter` | candidate kind列挙（split-module/extract-helper/deduplicate-function/externalize-literal/externalize-policy）、policy・scan root・hash計算のstate実装 |
| E56701056732E5CF9A1C | `tests/feedback-refactor-disposition.test.ts`（95行） | test | Historical/unresolved、`reuse_exclusion_class: legacy_test_fixture_or_oracle` | family/binding型でsource path・file sha・predecessor→successor関係を持つdisposition検査。`// @helix-repo-wide-guard`注記あり |

### 直接consumer検索（archive root `archive/legacy-generation-2026-09-14/root/` を `rg -uu` で全件検索）

| asset | 検出path（代表） | 種別 | 備考 |
|---|---|---|---|
| refactoring-trigger-admission-requirements | `docs/governance/candidates/refactoring-trigger-admission-acceptance.md`、`docs/plans/PLAN-L3-77-refactoring-trigger-authority.md` | 受理pair・対応PLAN | 外部module import/callは検出せず |
| L5/L6 design-refactoring-domain-model | `docs/design/design-catalog.yaml`、L5/L6両`design-*.md`、`docs/test-design/helix/L5-...integration-test-design.md`、`L6-...unit-test-design.md`、`docs/governance/infinity-loop-design-slice-registry.md`、`docs/governance/design-harness-assessment-audit-2026-07-19.md`、`docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest`、`docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md` | catalog・pair test design・slice registry・監査・fixture manifest・PLAN | catalog/ledger系は所在参照、test-designは対検証pair |
| refactor-candidates.ts | `src/doctor/index.ts`、`src/state-db/feedback-projections.ts`、`config/digest-canonicalization-inventory.json`、`tests/slow/projection-writer.test.ts`、各PLAN（L7-150・REVERSE-141等）、`.helix/review/cross-review-imp146-legacy-convergence.md`、`docs/governance/python-semantic-migration-ledger.v1.yaml` | module import・projection・config・test・PLAN | `src/doctor/index.ts`と`feedback-projections.ts`は直接import/call。旧runtime側であり現consumer成立は主張しない |
| feedback-refactor-disposition.test.ts | `docs/governance/feedback-refactor-disposition.json`、tests `l3-downstream-queue.test.ts`・`l3-g3-freeze-packet-v2.test.ts`、`config/repo-wide-guard-tests.v1.json`、`config/plan-legacy-workflow-identity-inventory.json`、関連PLAN群 | dispositionデータ・guard config・他test・PLAN | test本体のimport関係は同test系内 |

### 保持・意味再導出・置換候補・未評価の分類

| asset | 分類 | 対応・根拠 |
|---|---|---|
| RTG-R要件6件（12E2CD9B...） | 意味再導出（既存2026-09-14表の再分類を維持） | RTG-R-02〜06の観測・影響・採否・復旧意味はHARNESS-L2-004／005・HELIXOS-L2-005／007等へ再結合の候補。旧UIL／RF0／event enum・scheduled scan・Issue数／file size単独採択・旧CI結果は昇格しない（現crosswalk表と一致） |
| DRDM L5／L6（603D0E8D...／3B8F5F02...） | 意味再導出＋保持 | §0〜§1の意味署名・consumer/oracle保全・外部化／共通化の責務分離は現行の意味保存refactor・materialization著述（H040/LABO001/002等）の起点として保持。旧slice実装・test-design pairの物理形は置換しない、read-only参照とする |
| refactor-candidates.ts（7EBF2130...） | 未評価→候補 | candidate kind列挙・policy・scan rootの意味は観測→候補化の設計候補と照合できるが、現OS観測採否runtimeとの実装再接続は未評価。`reuse_exclusion_class: legacy_runtime_cli_or_adapter`として現runtime実行は禁止範囲 |
| feedback-refactor-disposition.test.ts（E5670105...） | 未評価 | dispositionのfamily/binding・predecessor→successor追跡はHARNESS構造改善の観測例として候補。guard config・他testとの関係を既存failure（stale偽oracle・consumer漏れ）と照合するまでは置換・採用候補にしない |

### 現設計への対応（既決／候補／未特定の区別）

- **既決（参照のみ）**: 意味保存・consumer/oracle保全の方針はConcept・七原則・既存FT-DESIGN-REFACTOR-001の対応へ既に写像済み。旧UIL／9scope／固定roles／旧gate／旧CIを現要求へ昇格しない。
- **候補**: 観測→候補→採否の分離（OS側）、意味保存refactorのfixture/materialization著述（HARNESS側）、版付き契約の片側交換（CONNECT側）はRTG-R/DRDMの同責務へ対応づける候補。disposition追跡・predecessor→successor対応は未特定のまま残す。
- **未特定**: BRAIN知識・CONNECT交換への直接写像、旧test系実consumerの現runtime相当、全asset/全consumerの完全閉包。旧source未発見や直接consumerで止まる箇所を推測で補完しない。

### 旧failureとの照合

- `tests/feedback-refactor-disposition.test.ts` が持つsource path・file sha・family追跡は、旧failure「stale/偽oracle・consumer漏れ」に対応する証拠形式であることを実物で確認した。旧実装・policy・receipt schemaを新世代baselineに昇格せず、意味のみを保持する。
- 独立oracle・consumer漏れ・stale偽証拠は既存crosswalkの「持ち込まない条件」と一致し、今回の再照合で新たな失敗類型は見つからなかった。
