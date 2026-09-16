---
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
title: "工程ゴールと完了権限 要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: PO / PM / TL
plan: PLAN-L3-47-lifecycle-stage-completion-goals
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/lifecycle-stage-completion-goals-acceptance.md
next_pair_freeze: L10
---

# 工程ゴールと完了権限 要件定義

## §0 authority

本書は、HELIXの各工程で「何をもって完了とするか」を定めるL3正本である。物理path、
cutover指示書§5が隔離したcompatibility layer scheme、旧縮退Scrum、旧drive分類、成果物の存在、
GitHubの表示だけを完了authorityにしない。

current authorityはL1〜L12と正規6 pairだけである。

```text
L1 企画             ↔ L12 運用テスト
L2 要求             ↔ L11 受入テスト
L3 要件             ↔ L10 総合テスト
L4 基本設計         ↔ L9 結合テスト
L5 詳細設計         ↔ L8 単体テスト
L6 実装             ↔ L7 テスト実装／TDD closure
```

V-model、Production Scrum、V設計＋Scrum実装Hybridは同列のdevelopment styleであり、どのstyleも
本書の工程ゴールを省略しない。styleによって変えてよいのはslice境界と反復周期だけである。
Discovery／PoC等のcase-driven modelとDesign HARNESS等のspecialist processは、必要な工程へ証拠を供給できるが、
工程完了を自己宣言せず、選択済みstyleの正規pairへ戻る。

## §1 単一振る舞い契約

### STAGE-GOAL-FR-001 工程完了は契約とcurrent evidenceでのみ成立する

HELIXは各工程について、次のexact setを同一snapshotへ束縛した`stage_exit_receipt`が成立した場合だけ、
次工程への遷移または完了を許可しなければならない。

```yaml
stage_exit_contract:
  - stage_goal_id
  - canonical_layer
  - paired_layer
  - development_style
  - case_driven_model
  - specialist_processes
  - exact_scope
  - responsibility_owner
  - required_outputs
  - positive_oracles
  - negative_oracles
  - unresolved_items
  - candidate_head
  - evidence_digest
  - independent_review_receipt
  - exit_decision
```

未知fieldによって必須field欠落を相殺しない。`unresolved_items`は空集合、後続工程へ送るtyped carry、
または理由・owner・期限・再入場条件を持つ明示deferのいずれかとする。未解決を散文、Issue数、TODO数だけで
表現して完了扱いにしない。

#### STAGE-GOAL-R-01 要求定義ゴール（L2↔L11）

L1企画の目的・対象・価値仮説を入力とし、何を作るか、誰のためか、何を満たすかをL2要求として確定する。
利用者、stakeholder、対象範囲、非対象、期待結果、人間受入基準、画面／mock適用判断をexact scopeへ含める。
L11は利用者／POがその要求を満たすことを判定できる受入oracleを持つ。

#### STAGE-GOAL-R-02 要件定義ゴール（L3↔L10）

要求から機械検証可能なFR／NFR／AC、境界、責任owner、入出力、失敗条件、trace、未解決一覧を確定する。
L10は各要件についてsystem observableなpositive oracleとnegative oracleを持つ。意味未確定、owner不在、
境界不明、oracle不能、未解決隠蔽が1件でもあればfreezeしない。

#### STAGE-GOAL-R-03 基本設計ゴール（L4↔L9）

要件を満たすsystem構成、component責務、外部I/F、主要データフロー、trust boundary、採用技術方針を確定する。
責務重複、循環依存、owner不在I/F、主要データの起点／終点欠落をL9 oracleが検出できなければG4を閉じない。

#### STAGE-GOAL-R-04 詳細設計ゴール（L5↔L8）

実装者が追加判断なしに着手できる契約、precondition、postcondition、invariant、例外、状態遷移、
永続化境界、並行性、resource bound、テスト観点を確定する。未定義分岐または例外がある場合はL5へ戻す。
L8 oracleは正常、境界、異常、状態遷移の各観点を被覆する。

#### STAGE-GOAL-R-05 実装ゴール（L6↔L7）

コードは対応する要件ID、L4/L5設計、behavior contract、responsibility ownerへexact traceされ、
Red→Green→極小Refactorを閉じる。scope外code、設計にない責務、未使用抽象化、旧authority依存、
testだけを通す迂回を完成コードとして認めない。

#### STAGE-GOAL-R-06 検証ゴール（L7〜L11）

対応pairごとのpositive／negative oracle、failure mutation、実行command、exit code、output digest、
candidate HEAD、独立review receiptが同一HEADで成立する。stale HEAD、片側oracle、未実行test design、
CI表示だけ、別branchの証拠を流用しない。

#### STAGE-GOAL-R-07 運用ゴール（L12↔L1）

観測、alert、障害分類、初動、rollback／Recovery、状態再構築、session／worker再入場、改善Issue、
L1へのfeedback経路を成立させる。正常時だけの監視、owner不在alert、復旧不能state、再入場点欠落、
改善が現PRへ無限逆流する運用を完了と認めない。

## §2 共通遷移規則

1. entry contractを満たす。
2. required outputと左右pair oracleを同じexact scopeで作る。
3. positive／negative oracleをcurrent candidate HEADで実行する。
4. unresolved itemを空、typed carry、明示deferへ全数分類する。
5. authoring runtimeと異なる独立AIが同一HEADをread-only reviewする。
6. exit authorityがreceiptを発行し、次工程または正規の差し戻し先へ遷移する。

失敗は証拠が反証した最も近い左腕工程へ戻す。右腕で新しい設計判断を埋めず、旧定義の成功でcurrent
canonical failureを相殺しない。

## §3 非対象

- L4以降の設計、source、schema、detector、CI、runtime実装。
- 新しいdevelopment style、case-driven model、specialist process、V-model layerの追加。
- 既存成果物の一括confirm、既存test designの実行済み主張。
- compatibility inputの削除または物理path rename。
