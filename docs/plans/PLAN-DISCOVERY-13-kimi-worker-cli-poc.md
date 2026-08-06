---
plan_id: PLAN-DISCOVERY-13-kimi-worker-cli-poc
title: "PLAN-DISCOVERY-13 (poc): Kimi Code CLI 第三 worker runtime の採否 PoC (issue #51 S1/S2)"
kind: poc
layer: cross
workflow_phase: S2
scrum_type: tech-spike
drive: be
status: draft
created: 2026-07-20
updated: 2026-08-07
owner: AIM (Claude) / TL
github_issue_id: 51
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
  - artifact_path: docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md
    artifact_type: markdown_doc
dependencies:
  parent: null
  requires:
    - docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
  references:
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    - docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
---

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

## 完了条件（S2 済み / S3-S4 未了）

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
- [ ] S4: full bench（blind judge・実 task scorecard）実施後の採否決定（admit / 用途限定 / quarantine / 見送り）を
      admission decision receipt として記録し、本 PLAN を terminal 化する。

## S3 実施結果を受けた S4 の前提（2026-08-07）

S3 は「分離条件（worker ≠ verifier）は満たしたが、対象判定が再現不能」という結論である。
したがって S4 へ進む前に **S2 を evidence retention profile 下で再実行**する必要がある。
再実行時に満たすべき 5 条件（preimage 明示 / 判定 script の tracked 化 / worker 出力の保全 /
CLI version + バイナリ digest の pin / worker ≠ verifier の事前宣言）は独立検証 doc の
「次工程への要求」に記載する。

再実行は security-foundation readiness 前の通常 lane 投入禁止に従い、HELIX 所有 wrapper が
process 外側で filesystem／network／credential 境界を強制できる構成が整ってから行う。

## 範囲外（後続）

- full bench（blind judge、mutation kill、skill A/B、実 task scorecard）と S4 採否決定。
- `helix kimi` 委譲面・sandbox template・Proposal Revalidation Gate の実装（S4 admit 後の Forward）。
- 該当 L1/L3 要件の confirm（PO 承認境界）。

## S4 routing（owner 台帳）

| 論点 | S0-S2 owner | S4 後の routing |
|------|-------------|-----------------|
| worker 採否 (HR-FR-HIL-22) | AIM (Claude) / TL | full bench PLAN → admission decision |
| `helix kimi` 委譲面 | SE / TL | L4 Forward 設計（Node supervisor + sandbox contract） |
この proposal-only 境界は外部 Kimi worker だけに適用する。ADR-010 の恒久 Python semantic core は
本 PLAN の対象外であり、transaction commit authority は引き続き Node 境界だけが持つ。
