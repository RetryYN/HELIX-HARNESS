---
plan_id: PLAN-L7-425-system-review-issue-handoff
title: "PLAN-L7-425 (troubleshoot): システム全体レビュー問題提起 — doctor violation 解消と債務 triage の Codex 引き継ぎ"
kind: troubleshoot
layer: L7
drive: agent
status: draft
route_mode: incident
entry_signals:
  - "po_directive:2026-07-12 PO 指示「システム全体を見直して、問題提起してプランに残して別レーンで動いている Codex が引き継いで実装できる状態にして」"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存 doctor gate が検出済みの violation / 債務の解消と triage であり、上位要求・設計の意味変更はない。恒久修正で設計変更が必要と判明した項目は、その時点で個別 PLAN を起票して backprop を判断する。"
agent_slots:
  - role: aim
    slot_label: "AIM — troubleshoot 分類の妥当性と PO 境界 (approval / blocked-human) の仕分け確認"
  - role: se
    slot_label: "SE — objective-evidence-audit G-10 整合修正と closure machine phase 実行"
  - role: qa
    slot_label: "QA — doctor gate green 検証と design-coverage triage 結果の妥当性確認"
generates:
  - artifact_path: docs/plans/PLAN-L7-425-system-review-issue-handoff.md
    artifact_type: markdown_doc
  - artifact_path: docs/reference/system-review-triage-2026-07-12.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires: []
---

# PLAN-L7-425: システム全体レビュー問題提起（Codex 引き継ぎ）

## 背景

2026-07-12 に Claude ランタイムが `helix doctor` / `helix status` を基点にシステム全体を点検した。
検出された violation と債務を本 PLAN に集約し、別レーンで進行中の Codex が引き継いで実装できる
状態にする。基準点は commit `a30393bd`（origin/main）時点の doctor 出力である。

FE roster レーン（PLAN-L6-66 / PLAN-L7-309 / PLAN-L7-424）は Codex が in-flight であるため、
本 PLAN は同レーンの成果物を変更しない。同レーン起因の violation は「完遂待ち」として参照のみ行い、
完遂後の doctor green を本 PLAN の検収に含める。

## 問題提起（issue 一覧）

### I1: objective-evidence-audit G-10 completion row の更新漏れ（設計どおりの手動更新義務）

- 事象: 共有ツリー計測で `objective-evidence-audit` が violation。
  - `G-10: completion row decisionCount markers must all equal 4 (actual=2,2)`
  - `G-10: completion row missing outstanding plan PLAN-L6-66-fe-roster-orchestration` /
    `PLAN-L7-424-fe-roster-vpair-resolution`
- 分析: これは lint バグではない。`src/lint/objective-evidence-audit.ts` の設計上、
  `docs/governance/helix-objective-evidence-audit.md` の G-10 行は live outstanding
  （`src/lint/outstanding.ts`）と常に一致する必要があり、**draft PLAN を追加したら同一 commit で
  G-10 行（decisionCount 全 marker + outstanding plan_id 列挙）を更新する義務がある**。
  FE roster レーンの draft PLAN 2 件がこの更新を伴っていない。
  なお本 PLAN-L7-425 追加分（decisionCount 3 化 + plan_id 追記）は本 PLAN と同一 commit で更新済み。
- 対応: PLAN-L6-66 / PLAN-L7-424 を commit するレーンで G-10 行を decisionCount=（live 値）へ更新し、
  両 plan_id を row へ列挙する（confirm で outstanding から外れるならその時点の live 値に一致させる）。
- 受け入れ: merge 後 HEAD で `helix doctor` の `objective-evidence-audit - OK`。
- 改善提案（任意・別 PLAN 可）: G-10 行の decisionCount / plan 列挙を `helix status --json` から
  自動生成するコマンドを設け、手動更新義務をなくす。

### I2: FE roster レーン起因の violation 4 gate（Codex 自レーン完遂で解消）

- 注: 以下は共有ツリー（Codex 未コミット変更込み）での観測であり、HEAD 単独の worktree 計測では
  発生しない。レーン完遂時に merge 後 HEAD で green になることを検収条件とする。
- 事象（いずれも PLAN-L6-66 が status=draft のまま deliverable が merge 済みであることに起因）:
  - `merged-plan-status`: PLAN-L7-424 draft なのに `tests/fe-roster-orchestration.test.ts` merge 済み。
  - `plan-governance`: requires_not_ready ×2（PLAN-L7-309 / PLAN-L7-424 が draft の PLAN-L6-66 に依存）。
  - `plan-specific-vpair-binding`: 2 件（unused exemption `sha256:0643481c…` の
    baseline_authority_invalid、PLAN-L7-309 の baseline_plan_semantic_drift）。
- 対応: PLAN-L7-424 レーンを完遂する（PLAN-L6-66 confirm + review_evidence、authority v3
  resolved tombstone、PLAN-L7-309 digest re-pin）。本 PLAN からの追加変更は不要。
- 受け入れ: `helix doctor` で `merged-plan-status` / `plan-governance` / `plan-specific-vpair-binding`
  がすべて OK。

### I3: current-location needs_recovery — closure machine phase の実行

- 事象: `vmodel-fit` が status=needs_fit / current=needs_recovery、closure queue=362
  （machine=1: collect_evidence for PLAN-L7-424、approval=361: close_ready）。さらに
  `recovery-handoff-gate` が approval draft の digest mismatch
  （status=refresh_approval_draft, valid=false）を報告している。
- 対応（machine 境界のみ。approval 361 件の close_ready 判断は human/approval gate であり本 PLAN の
  範囲外として PO へ残す）:
  1. approval draft を refresh する:

     ```bash
     helix closure evidence-approval-draft --action collect_evidence --limit 1 \
       --probe-record .helix/tmp/closure/collect_evidence-probe-record.json \
       --out .helix/tmp/closure/collect_evidence-approval-draft-refresh-b21ed15e46ff.yml \
       --summary-json
     ```

  2. I2 完遂後に collect_evidence を実行する:

     ```bash
     helix closure evidence-probe --action collect_evidence --limit 1 --execute \
       --out .helix/tmp/closure/collect_evidence-probe-record.json --json
     ```
- 受け入れ: `recovery-runway` の machine=0（collect_evidence 消化）、`recovery-handoff-gate` の
  digest mismatch 解消。approval 361 件は `approval_required` のまま PO 境界として残ってよい。

### I4: design-coverage 43% violation — todo=57 の triage

- 事象: 共有ツリー計測で `design-coverage - violation 1 件。総合 43% (done=43 / todo=57 / na=22,
  items=122)`。HEAD 単独 worktree では発生しないため、FE roster レーンの新規設計 doc が todo を
  押し上げている可能性が高い。merge 後 HEAD で再計測し、violation が残る場合のみ本項を実施する。
- **triage 実施済み（2026-07-12、全件結果 = `docs/reference/system-review-triage-2026-07-12.md` §2）**:
  (a) catalog 記述ミスによる status 更新漏れ 4 件（test-design 4 層。実在 confirmed doc と矛盾、
  即修正可）、(b) 真正未着手 53 件（うち na 化候補 6 件は製品境界の再定義にあたるため PO 境界）、
  scrum 系 8 件は検出ロジックだけ実装済みで対象成果物が repo に無い接続不足。
- 対応: (a) 4 件の catalog status 修正 → (b) の必要性順 PLAN 起票判断 → na 候補 6 件を PO へ
  escalate。全消化を本 PLAN で claim しない（`coding ≠ substance`）。
- 受け入れ: (a) 4 件修正で design-coverage 数値が改善し、na 候補 6 件の PO 判断が escalation
  として記録されている。coverage 全消化は受け入れ条件にしない。

### I5: hook orphan の真因修正（`plan use` の ID 未検証バグ — 実装項目へ格上げ）

- **真因特定済み（2026-07-12、詳細 = `docs/reference/system-review-triage-2026-07-12.md` §4）**:
  orphan 実測 4344 件は「legacy 残渣」ではなく、全件が截断 plan_id 5 種
  （`PLAN-L7-41` 等、正式 ID の先頭切れ）に一致する。`helix plan use <id>` が
  `plan_registry` 照合なしで `.helix/state/current-plan` へ verbatim 書き込みするため、
  以後の全 hook event が誤 ID で記録され続ける（current-plan の現在値も截断 ID で増加継続中）。
- 対応: (1) `plan use` に plan_registry 照合を追加（未解決 ID は候補提示 + fail-close）、
  (2) 既存 orphan は截断→正式 ID の対応が一意なら remap、不定なら cleanup 判断を記録、
  (3) 截断 ID 拒否 / 正常 ID 受理の regression test を追加（`generates:` に test_code 登録）。
- 受け入れ: regression test green、`drive-db-registration` の orphan が増加停止
  （修正後の新規 hook event で orphan 0）。既存分の remap/cleanup は別判断で可。

### I5b: l14-close-audit の残 item 仕分け（判断記録のみ）

- 全 10 item の仕分け済み（annex §3）: AI 進行可 = P5-context-efficiency のみ
  （PLAN-L7-315 の残スコープ裏取りが着手条件）。PO/human 境界 = P1 / P6 の一部 / P8。
  別 PLAN 追跡中 = P2 / P3 / P7。closed = P0 / P4 / P9。
- 対応: P5 の残スコープ確認と着手判断のみ。PO 境界 3 件はエスカレーション対象として残す。

### I7: improvement-backlog open 137 件の全件 triage 反映

- **triage 実施済み（annex §1）**: (a) 対応 PLAN 既存・実装済 91 件（うち 10 件は backlog の
  status 未更新）、(b) PLAN 起票要の実害 30 件（annex に全件表）、(c) PO 境界 1 件（IMP-031）、
  (d) 陳腐化・重複 close 候補 15 件（実装実在を確認済み）。
- 対応: (d) 15 件 + (a) の status 未更新 10 件を `docs/improvement-backlog.md` の status 更新で
  close する（trace に根拠を追記）。(b) 30 件は必要性順に PLAN 起票判断（一括起票しない）。
  (c) は PO へ escalate。
- 受け入れ: backlog の status 更新が完了し `improvement-backlog` gate green 維持。(b) の起票判断
  結果（起票 or 保留理由）が本 PLAN の IMP 記録または successor PLAN に残る。

### I6: 左腕差し戻し記録（carry log）の機械強制欠落

- 事象: `docs/process/forward/L07-implementation.md` §6 は、3 点レビュー / G7 で設計矛盾を発見した
  場合の差し戻し先（signature 不整合→L6/G6、API/Contract 乖離→L5/G5、アーキ違反→L4/G4）と
  「差し戻し記録は PLAN の carry log に残す」を規定するが、対応する lint / doctor gate が存在しない
  （`src/lint/` の carry 検査は g3-trace の FR carry 宣言用で別物）。差し戻しが記録されない、
  または差し戻し先 gate の再通過がスキップされても機械検出できない。
- 対応（document-first plus machine enforcement 原則に従う）:
  1. carry log の記録形式を定義する（PLAN frontmatter または本文の機械可読 marker。
     例: `carry_log:` に `finding` / `pushback_target_layer` / `gate` / `resolved` を持たせる）。
  2. lint を新設する: carry_log entry が差し戻し先 gate（G4/G5/G6）の再通過 evidence を持つまで
     当該 PLAN の trace-freeze / confirm を fail-close にする。
  3. `docs/process/forward/L07-implementation.md` §6 に機械強制の正本参照を追記し、
     regression test（`tests/` に test_code artifact として `generates:` 登録）を追加する。
- 受け入れ: 差し戻し記録の無い gate 再通過スキップを再現する fixture で lint が fail し、
  正しい carry_log + gate evidence で pass する regression test が green。既存 PLAN への遡及適用は
  enforcement date 方式（既存 lint と同様）で新規分から適用する。

## Schedule

- step 1 (serial): I1 修正（切り分け → 修正 → doctor green）。
- step 2 (serial): I2 = PLAN-L7-424 レーン完遂（Codex 自レーン、既存作業の継続）。
- step 3 (serial, step 2 依存): I3 machine phase（approval draft refresh → collect_evidence 実行）。
- step 4 (parallel, step 1-3 と独立): I4 catalog 修正 + na 候補 escalate、I5b P5 裏取り、
  I7 backlog status 更新（triage 済み annex に基づく処置）。
- step 5 (parallel, step 1-3 と独立): I5 `plan use` ID 検証バグ修正（照合 + remap/cleanup + test）。
- step 6 (parallel, step 1-3 と独立): I6 carry log 機械強制（marker 定義 → lint 新設 → regression test）。

## 完了条件（DoD）

- `helix doctor` で `objective-evidence-audit` / `merged-plan-status` / `plan-governance` /
  `plan-specific-vpair-binding` が OK（I1/I2）。
- `recovery-runway` machine=0 かつ `recovery-handoff-gate` digest mismatch 解消（I3）。
  approval 361 件と l14 blocked-human 2 件は PO 境界として明示的に残す。
- design-coverage catalog 記述ミス 4 件の修正と na 候補 6 件の PO escalation 記録（I4）。
- `plan use` ID 検証の regression test green と orphan 増加停止（I5）。
- improvement-backlog の close 候補 25 件（(d)15 + (a)status 未更新 10）の status 更新と
  gate green 維持（I7）。
- carry log lint の新設と regression test green（I6。実装ファイル確定時に `generates:` へ
  source_module / test_code を追記する）。
- 各 step の green command を review_evidence に digest 付きで記録し、cross-runtime review
  （hybrid: 反対 runtime / model family）を経て confirm する。

## 引き継ぎメモ（Codex 向け）

- 本 PLAN は Claude が問題提起のみ行った draft。実装・confirm・evidence 記録は Codex が行う。
- 基準 doctor 出力の取得: `helix doctor`（violation 行のみ抽出して差分確認）。
- I1 は FE roster レーンと独立に着手可能。I3 は I2 完遂後に実行する。
