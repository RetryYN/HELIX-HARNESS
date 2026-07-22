---
title: "HELIX Infinity Loop 設計slice正本台帳"
status: draft
created: 2026-07-15
updated: 2026-07-15
owner: PO / TL
plan: PLAN-L1-07-infinity-loop-platform-requirements
requirements: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
progress: docs/governance/infinity-loop-design-progress-ledger.md
schema: infinity-loop-design-slice-registry.v1
---

# HELIX Infinity Loop 設計slice正本台帳

## §0 目的

L3の18 system FRをL5/L8とL6/L7の設計・テスト設計pairへ降ろすための、固定分母を管理する。
単なる文書数ではなく、責務と変更理由が独立したcanonical sliceを単位にする。`HR-FR-HIL-09`だけは
captureとatomizationでauthorityおよびfailure境界が異なるため2 sliceとし、合計を19 sliceへ固定する。
将来さらに文書を分割しても、親sliceのclosure分母は増減させず、child artifactとして当該行へ結線する。

## §1 完了判定

各sliceは次の4成果物を必須とする。

1. L5詳細設計
2. L8結合テスト設計（L5の左右pair）
3. L6関数設計
4. L7単体テスト設計（L6の左右pair）

`quartet_draft`は4成果物の存在、frontmatter pair、対象FR/AC、各canonical caseの`pre_state`、`expected_state`、
failure、全oracle IDのexact pointerが閉じた場合だけ
加算する。`pair_frozen`は別runtime reviewとfreeze receipt、`implemented_verified`は全oracleのcommand、exit code、
output digest、artifact/DB evidenceが揃った場合だけ加算する。草案をfreezeまたは実装完了へ読み替えない。

## §2 canonical設計slice台帳

| slice ID | L3 owner | canonical stem | 主責務 | quartet状態 | freeze | 実装検証 |
|---|---|---|---|---|---|---|
| HDS-HIL-01 | HR-FR-HIL-01 | `intake-contract-normalization` | chat/GitHub/product/source入力の信頼境界とIssue contract正規化 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-02 | HR-FR-HIL-02 | `forward-infinity-orchestration` | Forward収束、causality、budget checkpoint | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-03 | HR-FR-HIL-03 | `github-pr-audit-promotion` | PR hook監査jobとfinding原子的昇格 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-04 | HR-FR-HIL-04 | `universal-reverse-redesign` | R0–R4 substance、Redesign、再freeze | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-05 | HR-FR-HIL-05 | `issue-scope-authority-gates` | directive custody、Issue/Scope/approval/evidence gate | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-06 | HR-FR-HIL-06 | `three-stage-ci-quarantine` | prejoin/postjoin/external CIと限定隔離 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-07 | HR-FR-HIL-07 | `memory-learning-promotion` | completion圧縮とrecipe/skill/detector/gate昇格 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-08 | HR-FR-HIL-08 | `harness-agent-lifecycle` | HARNESS-owned registry、muster、lease、verify、retire | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-09A | HR-FR-HIL-09 | `source-capability-capture` | ZIP/exact 2前身repo全advertised ref authority/現行treeのimmutable capture | strict GREEN（all-ref authority／consumer cascade／shared lifecycle rebuildをcommit固定fixture＋二系統独立再監査） | 未凍結 | 未実装 |
| HDS-HIL-09B | HR-FR-HIL-09 | `source-capability-atomization-closure` | behavior atom、採否、trace、coverage closure | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-10 | HR-FR-HIL-10 | `engine-detector-execution` | versioned core engine/detectorの決定論実行 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-11 | HR-FR-HIL-11 | `product-data-connector` | full/incremental product data projection | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-12 | HR-FR-HIL-12 | `python-worker-runtime` | Node監督下Python data/detection plane | strict GREEN（closed capability／resolution／AST gate独立再監査済み） | 未凍結 | 未実装 |
| HDS-HIL-13 | HR-FR-HIL-13 | `node-runtime-cutover` | Node.js LTS移行とactive Bun dependency 0 | strict GREEN（authority state／exact trace／mutation gate独立再監査済み） | 未凍結 | 未実装 |
| HDS-HIL-14 | HR-FR-HIL-14 | `os-portability-supply-chain` | Linux full、macOS/Windows、lock/SBOM/policy | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-15 | HR-FR-HIL-15 | `screen-applicability-prototype` | prototype必須routeと構造化no-UI skip | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-16 | HR-FR-HIL-16 | `design-refactoring-domain-model` | semantic設計refactor、DDD object、命名route | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-17 | HR-FR-HIL-17 | `requirement-translation-obligation` | requirement翻訳、template gap、design obligation | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |
| HDS-HIL-18 | HR-FR-HIL-18 | `layer-ledger-pair-gate` | canonical L1–L12台帳、層外L0 anchor、上下pair、左右V-pair、refactor保存 | strict GREEN（独立再監査＋機械semantic gate） | 未凍結 | 未実装 |

## §3 2026-07-15 snapshot

| 指標 | 分子/分母 | 率 | 意味 |
|---|---:|---:|---|
| canonical slice採番 | 19/19 | 100.00% | 設計分母と責務境界を固定 |
| quartet成果物作成済み | 76/76 | 100.00% | 19 slice × 4成果物 |
| 旧manual semantic review | 19/19 | 100.00% | 新strict基準導入で全件stale history。current分子外 |
| strict typed/API semantic closure | 19/19 | 100.00% | HDS-HIL-09A all-ref authorityをcommit固定fixture＋11/11 strictで閉鎖 |
| fresh横断再監査済み | 19/19 | 100.00% | 二系統独立再監査でBlocker/High 0。runtime authority receiptとは別指標 |
| pair frozen | 0/19 | 0.00% | 独立review/freeze receiptなし |
| implementation verified | 0/19 | 0.00% | 実行oracle evidenceなし |

19 sliceの76成果物は存在する。HDS-HIL-09Aは旧fixed-ref契約をstale化した後、all-advertised-ref authority、consumer cascade、
shared lifecycle rebuildへ再設計し、commit固定fixtureと二系統独立再監査によりcurrent strict semantic closureと
fresh横断再監査を19/19へ戻した。旧manual semantic review 19/19はstale historyのままとする。
current quartet再抽出でnumeric canonical U 491、canonical IT 376、合計867件を確認した。`U-LLPG-S01` 1件と`IT-LLPG-S01` 1件はsupporting存在inventoryとして別記し、
canonical分母には含めない。canonical HST 462を加えた全canonical inventoryは867＋462＝1,329件である。pair frozen 0/19、
implementation verified 0/19、quartet oracle execution 0/867、全canonical inventory execution 0/1,329を維持する。

## §4 更新契約

1. L3 owner追加・分割・統合時はL3 revisionと同じ変更で本台帳を更新する。
2. 4成果物のいずれかが欠ける、pairが片方向、oracleがrange省略、canonical state/failure authorityが不一致なら草案閉鎖を取り消す。
3. child分割は親slice IDを保持し、分母を都合よく増減させない。
4. `作成中`、`未作成`、`stale`、根拠のないN/Aを分子へ算入しない。
5. 台帳行、artifact digest、検証commandへbindするgenerated receiptのV1契約はHDS-HIL-18で設計済みだが、runtimeは未実装である。実装までは本snapshotを手更新正本とし、generated計測を主張しない。
