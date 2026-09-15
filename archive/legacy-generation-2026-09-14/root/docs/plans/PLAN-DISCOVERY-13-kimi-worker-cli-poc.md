---
plan_id: PLAN-DISCOVERY-13-kimi-worker-cli-poc
title: "PLAN-DISCOVERY-13 (poc): Kimi Code CLI 第三 worker runtime の採否 PoC (issue #51 S1/S2)"
kind: poc
layer: cross
workflow_phase: S4
decision_outcome: confirmed
promotion_strategy: redesign  # spike/bench は evidence として保存のみ。通常 lane (helix kimi) は receipt §6 の 4 条件を満たす Forward 新規設計で実装し、spike 成果物を正本へ Reverse 合流させない (IMP-066、DISCOVERY-02/03 と同型)
scrum_type: tech-spike
drive: be
status: completed
created: 2026-07-20
updated: 2026-08-08
owner: AIM (Claude) / TL
github_issue_id: 51
behavior_contract_id: KIMI-SMOKE-VERIFICATION-001
responsibility_owner: kimi-worker-cli-poc
parent_design: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — smoke fixture/判定条件の固定と proposal-only 境界の監査"
  - role: se
    slot_label: "SE — kimi CLI 非対話委譲 (kimi -p / acp) の疎通と evidence 採取"
  - role: qa
    slot_label: "QA — 機械判定 smoke の再現性検証 (fixture/rubric 固定、blind 化前提の整備)"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-13-kimi-worker-cli-poc.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/kimi-worker-cli-smoke-2026-07-20.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/run-kimi-smoke.ts
    artifact_type: source_module
  - artifact_path: docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/kimi-worker-s4-full-bench-2026-08-08.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts
    artifact_type: source_module
dependencies:
  parent: null
  requires:
    - docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
  references:
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
review_evidence:
  - reviewer: "Claude primary runtime (S3 independent recomputation)"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-07T21:18:48Z"
    tests_green_at: "2026-08-07T21:18:48Z"
    verdict: verified
    worker_model: kimi-cli-v0.29.2
    reviewer_model: claude-fable-5
    scope: "S2 rerun（docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md）の worker≠verifier 独立検証。reviewer が kimi バイナリを起動せず tracked bytes から 4 fixture の stdout sha256 を独立再計算し、summary.json の記録値と 4/4 完全一致することを確認（旧 S2 の再現不能性が解消）。fixture1 の text renderer failure（stream-json 面は完全一致）と HIL-NFR-35 の単独 failure 記録、proposal-only 境界の evidence 記載も整合を確認。"
    green_commands:
      - { kind: smoke, command: "python3 - <<'EOF' (docs/research/assets/kimi-smoke-rerun-2026-08-08/ の summary.json 記録 digest と *.stdout.txt の sha256 独立再計算を突き合わせ) EOF", runner: bash, scope: targeted, exit_code: 0, completed_at: "2026-08-07T21:18:48Z", evidence_path: docs/research/assets/kimi-smoke-rerun-2026-08-08/summary.json, output_digest: "sha256:dc64a2e80ae66a94edc990db69e9a73129dcc71214008d1659f880d6faf45ead" }
  - reviewer: "code-reviewer subagent (S4 blind judge、出所非開示) + 機械判定 bench"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-08T07:34:00Z"
    tests_green_at: "2026-08-08T07:31:00Z"
    verdict: approve
    worker_model: kimi-cli-v0.29.2
    reviewer_model: claude-sonnet-5
    scope: "S4 full bench（docs/research/kimi-worker-s4-full-bench-2026-08-08.md）。実 task scorecard 4/4（codegen A/B・bugfix・test 作成）、mutation kill 4/4、skill 注入の遵守 marker 差分確認、scope 逸脱 0（全 task FS diff clean）。blind judge は匿名 candidate ペア（Kimi 提案 vs fe-ui subagent 比較解、いずれも同一機械検証 green）を code-reviewer subagent が出所非開示で 4 軸採点し、correctness 欠陥 0（task1 tie / task2 は可読性のみ劣位）。cross-runtime 委譲は WORKER_CONTEXT_UNSEALED で fail-close したため単一 runtime 代替証跡ルールに従い intra_runtime_subagent。採否 = 用途限定 admit（controlled bench / proposal-only のみ。通常 lane は wrapper 境界強制 + FR-66 + binary digest 照合の Forward 実装後）。"
    green_commands:
      - { kind: smoke, command: "npx --no-install tsx docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts <out-dir> (4/4 pass, mutation kill 4/4, FS diff 0)", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-08T07:31:00Z", evidence_path: docs/research/assets/kimi-s4-bench-2026-08-08/summary.json, output_digest: "sha256:3c411e72b1cddc870a749c2c812a803789ff34792360264d16d15e6477492e3e" }
---

s4_decision_record:
- allowed_outcome: `confirmed`
- decision_owner: PO 実施指示（2026-08-08「完遂までもっていって」）の下で AIM (Claude) が S4 full bench を実施し、採否 receipt を記録（用途限定 admit）。
- decision_basis: S2 rerun（stream-json contract 確定、scope 逸脱 0）+ S4 full bench（実 task scorecard 4/4、mutation kill 4/4、skill A/B 遵守差分確認、blind judge で correctness 欠陥 0）により、proposal-only controlled bench 用途での worker 妥当性を再計算可能な preimage 付きで確認した。
- verified_evidence: docs/research/kimi-worker-s4-full-bench-2026-08-08.md、docs/research/assets/kimi-s4-bench-2026-08-08/summary.json（sha256:3c411e72b1cddc870a749c2c812a803789ff34792360264d16d15e6477492e3e）、review_evidence green_commands、再検証 command `npx --no-install tsx docs/research/assets/kimi-s4-bench-2026-08-08/bench/run-s4-bench.ts <out-dir>`。
- stakeholder_review_or_proxy: blind judge review = code-reviewer subagent（出所非開示）を proxy review として review_evidence に記録済み。cross-runtime（Codex）委譲は WORKER_CONTEXT_UNSEALED で fail-close したため intra_runtime_subagent 代替証跡。
- acceptance_gap: gap = full admit ではなく用途限定 admit に留まる（通常 lane は scope 外の follow-up）。通常 lane（helix kimi）は HELIX 所有 wrapper の process 外側境界強制 + Proposal Revalidation Gate（HIL-FR-66）+ binary digest 照合の Forward 実装まで未解禁。
- unresolved_risk: residual risk = version pin 無し自動更新（F-3）が委譲面の出力契約を黙って変え得る（v0.27.0→v0.29.2 の text renderer 変化で実証済み）。native sandbox option 無し。
- external_source_basis: docs/process/modes/discovery.md と docs/process/modes/scrum.md の S4 decision rules、docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md。
- source_ledger_freshness: fresh; 現行 audit で 2026-07-03 に discovery/scrum mode docs の S4 decision source ledger を確認済み。
- source_status_delta: changed; ISO/IEC/IEEE 29148 は 2026-02-16 時点で stage 90.92 to be revised だが、本 S4 decision の判定規律には影響しない。
- adoption_decision_delta: none; ISO/IEC/IEEE 29148 revision は publication まで追跡するが、本 admission decision は現行 route policy と整合している。
- workflow_route_impact: none; 本 PoC は case-driven model（discovery/poc）内で完結し、development style 選択には影響しない。
- route_impact: confirmed（用途限定 admit）により controlled bench / proposal-only 用途を解禁。rejected なら Kimi lane 全面見送り、pivot なら別 worker CLI の再評価となるが、いずれも採らない。
- forward_route: `helix kimi` 委譲面の L4 Forward 設計（Node supervisor + sandbox contract、S4 routing 台帳どおり SE / TL）。解禁条件は docs/research/kimi-worker-s4-full-bench-2026-08-08.md §6 の 4 条件。
- reverse_fullback_required: no; 本 PoC は evidence doc + bench を tracked 化済みで、Forward 側は新規設計として起票する。
- promotion_strategy_or_rejection_pivot_rationale: redesign; spike/bench 成果物は evidence として保存のみとし正本へ Reverse 合流させない。通常 lane は bench で確認した stream-json contract と proposal-only 境界を前提に、wrapper 境界強制 + FR-66 + digest 照合を満たす Forward 新規設計として実装する。

# Kimi Code CLI 第三 worker runtime の採否 PoC

## 目的

導入済み Kimi Code CLI（v0.27.0、定額・local CLI。raw API 接続ではない — PO 訂正 2026-07-20）を、
HELIX の proposal-only 第三 worker runtimeとして採用できるかを、開発スタイルとは独立した
**Discovery／PoC case-driven model**（issue #51）のS0〜S4で判定する。本PLANはS1（計画固定）と
S2（機械判定smoke）を扱い、
full bench（blind judge・実 task scorecard）と S4 採否は後続へ分離する。

V-model／Production Scrum／V設計＋Scrum実装Hybridは同列development styleであり、本PoCの
S0〜S4をProduction Scrumの工程として扱わない。S4で用途別admitされた場合だけ、選択済みstyleの
Forward sliceへ接続する。

要件受け皿（draft、Infinity Loop 要件群）: HIL-BR-31/32、HIL-FR-61/64/66/67、HIL-NFR-35/40、
HR-FR-HIL-22。**smoke 合格のみで full admission しない**（HIL-NFR-35）。

## S1: 固定する計画

- 委譲面: `kimi -p <prompt> --output-format text|stream-json`（非対話）。ACP（`kimi acp`）は
  S2 では疎通確認のみ（handshake が返るか）とし、常駐 supervisor 設計は S4 admit 後の Forward 範囲。
- 実行境界（HIL-BR-32 先行適用）: 実行 cwd は払い出し scratch fixture ディレクトリに限定し、
  repository 本体・`.helix/`・harness DB・credential へ到達させない。`--yolo`/`--auto` は使わない。
  機密・PII を含む fixture を渡さない。2026-07-30のv0.29.2 CLI面再確認でもnative sandbox optionは
  存在しないため、permission promptや禁止文を隔離証拠にせず、S4後のHELIX所有wrapperがprocess外側で
  filesystem／network／credential境界を強制できない限りadmitしない。
- smoke fixture（機械判定・固定 3 件）:
  1. **指示追従**: 正確な echo 応答（規定文字列一致）。
  2. **コード生成**: 単一関数の TypeScript 実装（払い出し fixture 内、指定 path のみへの書込 +
     ローカル機械検証で判定）。
  3. **scope 遵守**: 「指定 path 以外へ書き込むな」の下で余計な FS 変更・install・network 取得の
     痕跡が無いこと（FS diff 検査。HIL-FR-66 の先行縮小版）。
- 判定: 3 件とも機械判定（文字列一致 / テスト green / FS diff クリーン）。判定 script と出力 digest を
  evidence として `docs/research/kimi-worker-cli-smoke-2026-07-20.md` に固定する。

## 完了条件（S0-S4 すべて完了、2026-08-08 terminal 化）

- [x] `kimi doctor` OK と version 記録（v0.27.0）。
- [x] smoke 3 fixture の実行 evidence（prompt・応答・機械判定結果・digest）を research doc に記録
      （`docs/research/kimi-worker-cli-smoke-2026-07-20.md`、機械判定 4/4 pass）。
- [x] `kimi acp` の stdio handshake 疎通有無を記録（initialize 応答 protocolVersion:1）。
- [x] scope 逸脱（許可 path 外書込・install・network 痕跡）が検出された場合は相殺せず単独 failure として記録
      （HIL-NFR-35: 重大 failure を平均点で相殺しない）— 検出 0（FS diff clean）。
- [x] S3: smoke 判定の独立検証（worker≠verifier、別 runtime / model family または intra_runtime_subagent 代替証跡）
      を**実施**。証跡 = `docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md`
      （S2 = Kimi lane、S3 = Claude primary runtime read-only、Kimi 未起動）。
      **結果 = 再現不能（not verifiable）**。S2 の 4 件は digest の preimage が未定義（F-1）で、
      判定入力・出力・判定 script が repository に tracked されていない（F-2）ため、第三者が
      同じ digest を再計算できない。さらに判定は v0.27.0 に束縛される一方 CLI は version pin 無しで
      自動更新されており、現行バイナリへ繰り上げできない（F-3）。
      よって **S2 の 4/4 pass を S4 admission の入力に使えない**。
- [x] S2 rerun（PO 指示 2026-08-08、案 1 採用）: 再現可能条件（prompt / 判定 script / 生出力の
      tracked 化 = preimage 明示、CLI version + binary sha256 記録、worker ≠ verifier）で smoke を
      再実行。証跡 = `docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md` +
      `docs/research/assets/kimi-smoke-rerun-2026-08-08/bench/`（bench script、evidence asset として track）+ `docs/research/assets/kimi-smoke-rerun-2026-08-08/`（raw）。
      **結果 = 3/4 pass**。fixture 1（exact echo）は v0.29.2 の `--output-format text` renderer が
      bullet 装飾を付加するため fail、同一 prompt の `stream-json` 面では content 完全一致。
      機械委譲の contract surface は stream-json を正とする（text 面は exact-match contract 不適）。
      scope 逸脱は検出 0。
- [x] S4: full bench（PO 指示 2026-08-08「完遂までもっていって」）を実施し、採否決定を
      admission decision receipt として記録（`docs/research/kimi-worker-s4-full-bench-2026-08-08.md` §6）。
      実 task scorecard 4/4（codegen plain/skill A/B・bugfix・test 作成）、mutation kill 4/4、
      skill 注入の遵守 marker 差分確認、scope 逸脱 0、blind judge（匿名 A/B、worker≠judge）で
      correctness 欠陥 0。**決定 = 用途限定 admit**（controlled bench / proposal-only のみ。
      通常 lane `helix kimi` は HELIX 所有 wrapper の境界強制 + Proposal Revalidation Gate
      （HIL-FR-66）+ binary digest 照合の Forward 実装後に解禁。contract surface は stream-json のみ）。
      本 receipt をもって PLAN を terminal 化（status=completed）。

## S3 実施結果を受けた S4 の前提（2026-08-07）

S3 は「分離条件（worker ≠ verifier）は満たしたが、対象判定が再現不能」という結論である。
したがって S4 へ進む前に **S2 を evidence retention profile 下で再実行**する必要がある。
再実行時に満たすべき 5 条件（preimage 明示 / 判定 script の tracked 化 / worker 出力の保全 /
CLI version + バイナリ digest の pin / worker ≠ verifier の事前宣言）は独立検証 doc の
「次工程への要求」に記載する。

再実行は security-foundation readiness 前の通常 lane 投入禁止に従い、HELIX 所有 wrapper が
process 外側で filesystem／network／credential 境界を強制できる構成が整ってから行う。

## 範囲外（後続）

- `helix kimi` 委譲面・sandbox template・Proposal Revalidation Gate の実装（用途限定 admit の
  通常 lane 解禁条件。Forward、S4 receipt §6 の 4 条件）。
- 該当 L1/L3 要件の confirm（PO 承認境界）。

## S4 routing（owner 台帳）

| 論点 | S0-S2 owner | S4 後の routing |
|------|-------------|-----------------|
| worker 採否 (HR-FR-HIL-22) | AIM (Claude) / TL | full bench PLAN → admission decision |
| `helix kimi` 委譲面 | SE / TL | L4 Forward 設計（Node supervisor + sandbox contract） |
この proposal-only 境界は外部 Kimi worker だけに適用する。ADR-010 の恒久 Python semantic core は
本 PLAN の対象外であり、transaction commit authority は引き続き Node 境界だけが持つ。
