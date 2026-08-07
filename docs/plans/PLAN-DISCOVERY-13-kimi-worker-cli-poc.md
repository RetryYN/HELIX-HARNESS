---
plan_id: PLAN-DISCOVERY-13-kimi-worker-cli-poc
title: "PLAN-DISCOVERY-13 (poc): Kimi Code CLI 第三 worker runtime の採否 PoC (issue #51 S1/S2)"
kind: poc
layer: cross
workflow_phase: S3
scrum_type: tech-spike
drive: be
status: draft
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
  - artifact_path: tests/tools/kimi-smoke/run-kimi-smoke.ts
    artifact_type: test_code
  - artifact_path: docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md
    artifact_type: markdown_doc
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
    scope: "S2 rerun（docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md、Codex lane が PR #448 で merge）の worker≠verifier 独立検証。旧 S2（2026-07-20）は S3 独立検証（docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md）で digest preimage 未定義により再現不能（S3 fail）と判定済み。本 rerun は判定入力 prompt・判定 script（tests/tools/kimi-smoke/run-kimi-smoke.ts）・生出力 4 fixture を repository へ track して preimage を定義しており、reviewer が kimi バイナリを起動せず tracked bytes から fixture1-echo / fixture2-codegen / fixture3-scope / fixture4-acp の stdout sha256 を独立再計算し、summary.json の記録値と 4/4 完全一致することを確認した（旧 S2 の再現不能性が解消）。fixture1 の text renderer failure（bullet 付加、stream-json 面は完全一致）と HIL-NFR-35 の単独 failure 記録、proposal-only 境界（--yolo/--auto 不使用・FS diff 0）の evidence 記載も整合を確認。本 confirm は S1/S2 成果物の証跡保全に対するものであり、S4 採否（full admission）は本 PLAN の範囲外として後続判断に留保する。"
    green_commands:
      - { kind: smoke, command: "python3 - <<'EOF' (docs/research/assets/kimi-smoke-rerun-2026-08-08/ の summary.json 記録 digest と *.stdout.txt の sha256 独立再計算を突き合わせ) EOF", runner: bash, scope: targeted, exit_code: 0, completed_at: "2026-08-07T21:18:48Z", evidence_path: docs/research/assets/kimi-smoke-rerun-2026-08-08/summary.json, output_digest: "sha256:dc64a2e80ae66a94edc990db69e9a73129dcc71214008d1659f880d6faf45ead", result: "tracked bytes からの stdout sha256 再計算 4/4 が summary.json と完全一致（fixture1 20e92d6d… / fixture2 201c7671… / fixture3 c62fee7c… / fixture4 52ed338a…）" }
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
- [x] S2 rerun（PO 指示 2026-08-08、案 1 採用）: 再現可能条件（prompt / 判定 script / 生出力の
      tracked 化 = preimage 明示、CLI version + binary sha256 記録、worker ≠ verifier）で smoke を
      再実行。証跡 = `docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md` +
      `tests/tools/kimi-smoke/`（bench）+ `docs/research/assets/kimi-smoke-rerun-2026-08-08/`（raw）。
      **結果 = 3/4 pass**。fixture 1（exact echo）は v0.29.2 の `--output-format text` renderer が
      bullet 装飾を付加するため fail、同一 prompt の `stream-json` 面では content 完全一致。
      機械委譲の contract surface は stream-json を正とする（text 面は exact-match contract 不適）。
      scope 逸脱は検出 0。
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

## S4 decision record（S3 verified、S4 決定は未実施・PO 境界）

s4_decision_record:
- allowed_outcome: `confirmed` / `rejected` / `pivot`
- decision_owner: PO（人間）。AIM (Claude) / TL は S4 判定材料の整備と full bench PLAN の起票のみ。
- decision_basis: S2 rerun（2026-08-08、3/4 pass、stream-json 面は 4/4 成立）+ S3 独立再計算（tracked preimage から stdout sha256 4/4 一致）。full bench（blind judge・実 task scorecard）は未実施のため S4 判定はまだ下せない。
- verified_evidence: `docs/research/kimi-worker-cli-smoke-rerun-2026-08-08.md`、`docs/research/assets/kimi-smoke-rerun-2026-08-08/`（raw + summary.json）、`tests/tools/kimi-smoke/run-kimi-smoke.ts`、`docs/research/kimi-worker-cli-smoke-independent-verification-2026-08-07.md`、frontmatter review_evidence（output_digest sha256:dc64a2e80ae66a94edc990db69e9a73129dcc71214008d1659f880d6faf45ead、独立再計算 4/4 一致）。
- stakeholder_review_or_proxy: proxy review = Claude primary runtime（reviewer、worker≠verifier、kimi 未起動の tracked bytes 再計算）。S4 verification は PO（人間）が採否を判断する。
- acceptance_gap: gap = full bench（blind judge、mutation kill、実 task scorecard）未実施。fixture1 の text renderer failure により text 面 exact-match contract は不成立（stream-json 面を contract surface とする前提が S4 入力）。
- unresolved_risk: CLI version pin なし自動更新で委譲面の出力契約が黙って変わる（v0.27.0→v0.29.2 で実証）。native sandbox なし — HELIX 所有 wrapper が process 外側で filesystem/network/credential 境界を強制できるまで admit 不可（HIL-BR-32）。
- external_source_basis: Kimi Code CLI v0.29.2（binary sha256 は rerun doc に記録）、`docs/process/modes/discovery.md` の S4 decision rules。
- source_ledger_freshness: `fresh`。S4 decision に使う前に docs/process/modes/discovery.md の S4 decision source ledger（checked 2026-07-03）を確認済み。rerun evidence（2026-08-08）の CLI version / binary sha256 / prompt sha256 も実測記録済み。
- source_status_delta: `changed`。CLI が v0.27.0→v0.29.2 へ自動更新され、`--output-format text` renderer の出力契約が変化した（fixture1 failure の原因として記録済み）。
- adoption_decision_delta: `changed`。機械判定・機械委譲の contract surface を text 面から `--output-format stream-json` 面へ変更する（rerun doc の帰結）。
- workflow_route_impact: `pending-s4`。admit / 用途限定 / quarantine / 見送り のいずれも未決定。
- route_impact: pending。confirmed の場合は `helix kimi` 委譲面の L4 Forward 設計へ接続、rejected の場合は Kimi lane を quarantine のまま closed、pivot の場合は用途限定 admit の再 PoC を起票する。S4 決定まで通常 lane への Kimi 投入は禁止のまま。
- forward_route: S4 admit の場合のみ `helix kimi` 委譲面・sandbox wrapper の L4 Forward 設計へ接続（本 PLAN 範囲外）。
- reverse_fullback_required: no（S4 未決定のため正本 back-merge なし。admit 時に該当 L1/L3 要件の confirm を PO 承認境界で行う）。
- promotion_strategy_or_rejection_pivot_rationale: `pending-full-bench`。smoke 合格のみで full admission しない（HIL-NFR-35）ため、full bench 完了までは promotion / rejection いずれの結論も出さない。

## S4 routing（owner 台帳）

| 論点 | S0-S2 owner | S4 後の routing |
|------|-------------|-----------------|
| worker 採否 (HR-FR-HIL-22) | AIM (Claude) / TL | full bench PLAN → admission decision |
| `helix kimi` 委譲面 | SE / TL | L4 Forward 設計（Node supervisor + sandbox contract） |
この proposal-only 境界は外部 Kimi worker だけに適用する。ADR-010 の恒久 Python semantic core は
本 PLAN の対象外であり、transaction commit authority は引き続き Node 境界だけが持つ。
